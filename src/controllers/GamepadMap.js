
import { v4 as uuidv4 } from 'uuid';

export class GamepadMapper {
  constructor() {
    this.gamepads = {};
    this.callbacks = {};
    this.isActive = false;
    this.deadzone = 0.1;
    
    // Standard gamepad button mapping
    this.buttonMap = {
      0: 'A',      // Cross/A
      1: 'B',      // Circle/B  
      2: 'X',      // Square/X
      3: 'Y',      // Triangle/Y
      4: 'LB',     // L1/LB
      5: 'RB',     // R1/RB
      6: 'LT',     // L2/LT
      7: 'RT',     // R2/RT
      8: 'SELECT', // Select/Back
      9: 'START',  // Start/Menu
      10: 'LS',    // L3/LS
      11: 'RS',    // R3/RS
      12: 'UP',    // D-pad Up
      13: 'DOWN',  // D-pad Down
      14: 'LEFT',  // D-pad Left
      15: 'RIGHT'  // D-pad Right
    };

    // Axis mapping
    this.axisMap = {
      0: 'LEFT_STICK_X',
      1: 'LEFT_STICK_Y',
      2: 'RIGHT_STICK_X',
      3: 'RIGHT_STICK_Y'
    };

    this.init();
  }

  init() {
    if (!('getGamepads' in navigator)) {
      console.warn('Gamepad API not supported');
      return;
    }

    window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this));
    
    this.startPolling();
  }

  onGamepadConnected(event) {
    const gamepad = event.gamepad;
    console.log(`Gamepad connected: ${gamepad.id}`);
    
    this.gamepads[gamepad.index] = {
      id: gamepad.id,
      index: gamepad.index,
      buttons: new Array(gamepad.buttons.length).fill(false),
      axes: new Array(gamepad.axes.length).fill(0),
      vibration: gamepad.vibrationActuator || null
    };

    this.triggerCallback('connected', { gamepad: this.gamepads[gamepad.index] });
  }

  onGamepadDisconnected(event) {
    const gamepad = event.gamepad;
    console.log(`Gamepad disconnected: ${gamepad.id}`);
    
    delete this.gamepads[gamepad.index];
    this.triggerCallback('disconnected', { index: gamepad.index });
  }

  startPolling() {
    if (this.isActive) return;
    this.isActive = true;
    this.pollGamepads();
  }

  stopPolling() {
    this.isActive = false;
  }

  pollGamepads() {
    if (!this.isActive) return;

    const gamepads = navigator.getGamepads();
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad || !this.gamepads[i]) continue;

      const storedGamepad = this.gamepads[i];

      // Check buttons
      for (let j = 0; j < gamepad.buttons.length; j++) {
        const button = gamepad.buttons[j];
        const wasPressed = storedGamepad.buttons[j];
        const isPressed = button.pressed;

        if (isPressed && !wasPressed) {
          this.triggerCallback('buttondown', {
            gamepadIndex: i,
            buttonIndex: j,
            buttonName: this.buttonMap[j] || `BUTTON_${j}`,
            value: button.value
          });
        } else if (!isPressed && wasPressed) {
          this.triggerCallback('buttonup', {
            gamepadIndex: i,
            buttonIndex: j,
            buttonName: this.buttonMap[j] || `BUTTON_${j}`,
            value: button.value
          });
        }

        storedGamepad.buttons[j] = isPressed;
      }

      // Check axes
      for (let j = 0; j < gamepad.axes.length; j++) {
        const axisValue = Math.abs(gamepad.axes[j]) > this.deadzone ? gamepad.axes[j] : 0;
        const oldValue = storedGamepad.axes[j];

        if (Math.abs(axisValue - oldValue) > 0.01) {
          this.triggerCallback('axis', {
            gamepadIndex: i,
            axisIndex: j,
            axisName: this.axisMap[j] || `AXIS_${j}`,
            value: axisValue,
            oldValue: oldValue
          });
        }

        storedGamepad.axes[j] = axisValue;
      }
    }

    requestAnimationFrame(() => this.pollGamepads());
  }

  // Event system
  on(event, callback) {
    const id = uuidv4();
    if (!this.callbacks[event]) {
      this.callbacks[event] = {};
    }
    this.callbacks[event][id] = callback;
    return id;
  }

  off(event, id) {
    if (this.callbacks[event] && this.callbacks[event][id]) {
      delete this.callbacks[event][id];
    }
  }

  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      Object.values(this.callbacks[event]).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Gamepad callback error:', error);
        }
      });
    }
  }

  // Utility methods
  isButtonPressed(gamepadIndex, buttonIndex) {
    return this.gamepads[gamepadIndex]?.buttons[buttonIndex] || false;
  }

  getAxisValue(gamepadIndex, axisIndex) {
    return this.gamepads[gamepadIndex]?.axes[axisIndex] || 0;
  }

  getConnectedGamepads() {
    return Object.values(this.gamepads);
  }

  vibrate(gamepadIndex, intensity = 1.0, duration = 200) {
    const gamepad = this.gamepads[gamepadIndex];
    if (gamepad && gamepad.vibration) {
      gamepad.vibration.playEffect('dual-rumble', {
        startDelay: 0,
        duration: duration,
        weakMagnitude: intensity * 0.5,
        strongMagnitude: intensity
      });
    }
  }

  // Quest-specific controls
  getQuestControls() {
    return {
      select: () => this.isButtonPressed(0, 0), // A button
      back: () => this.isButtonPressed(0, 1),   // B button
      navigate: () => ({
        x: this.getAxisValue(0, 0),
        y: this.getAxisValue(0, 1)
      }),
      menu: () => this.isButtonPressed(0, 9),   // START button
      map: () => this.isButtonPressed(0, 8),    // SELECT button
    };
  }
}

// Create singleton instance
export const gamepadMapper = new GamepadMapper();

// React hook for gamepad integration
export const useGamepadQuest = (questHandler) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [activeGamepad, setActiveGamepad] = React.useState(null);

  React.useEffect(() => {
    const connectId = gamepadMapper.on('connected', ({ gamepad }) => {
      setIsConnected(true);
      setActiveGamepad(gamepad);
    });

    const disconnectId = gamepadMapper.on('disconnected', () => {
      setIsConnected(false);
      setActiveGamepad(null);
    });

    const buttonId = gamepadMapper.on('buttondown', ({ buttonName, gamepadIndex }) => {
      if (questHandler && buttonName) {
        switch (buttonName) {
          case 'A':
            questHandler('select', 0);
            break;
          case 'B':
            questHandler('select', 1);
            break;
          case 'X':
            questHandler('select', 2);
            break;
          case 'Y':
            questHandler('back');
            break;
          case 'START':
            questHandler('menu');
            break;
          case 'UP':
            questHandler('navigate', 'up');
            break;
          case 'DOWN':
            questHandler('navigate', 'down');
            break;
          case 'LEFT':
            questHandler('navigate', 'left');
            break;
          case 'RIGHT':
            questHandler('navigate', 'right');
            break;
        }
      }
    });

    return () => {
      gamepadMapper.off('connected', connectId);
      gamepadMapper.off('disconnected', disconnectId);
      gamepadMapper.off('buttondown', buttonId);
    };
  }, [questHandler]);

  return {
    isConnected,
    activeGamepad,
    vibrate: (intensity, duration) => gamepadMapper.vibrate(0, intensity, duration)
  };
};
