
import { Gamepad } from 'gamepad.js';

class GamepadController {
  constructor() {
    this.gamepad = new Gamepad();
    this.isConnected = false;
    this.callbacks = {
      buttonPress: new Map(),
      axisMove: new Map(),
      connect: [],
      disconnect: []
    };
    
    this.init();
  }

  init() {
    // Handle gamepad connection
    this.gamepad.on('connect', (gamepadIndex) => {
      console.log(`Gamepad ${gamepadIndex} connected!`);
      this.isConnected = true;
      this.callbacks.connect.forEach(callback => callback(gamepadIndex));
    });

    // Handle gamepad disconnection
    this.gamepad.on('disconnect', (gamepadIndex) => {
      console.log(`Gamepad ${gamepadIndex} disconnected!`);
      this.isConnected = false;
      this.callbacks.disconnect.forEach(callback => callback(gamepadIndex));
    });

    // Handle button presses
    this.gamepad.on('press', (buttonName, gamepadIndex) => {
      console.log(`Button ${buttonName} pressed on gamepad ${gamepadIndex}`);
      if (this.callbacks.buttonPress.has(buttonName)) {
        this.callbacks.buttonPress.get(buttonName).forEach(callback => 
          callback(buttonName, gamepadIndex)
        );
      }
    });

    // Handle axis movement
    this.gamepad.on('move', (axisName, value, gamepadIndex) => {
      if (Math.abs(value) > 0.1) { // Dead zone
        if (this.callbacks.axisMove.has(axisName)) {
          this.callbacks.axisMove.get(axisName).forEach(callback => 
            callback(axisName, value, gamepadIndex)
          );
        }
      }
    });

    // Start polling
    this.gamepad.init();
  }

  // Register callback for button press
  onButtonPress(buttonName, callback) {
    if (!this.callbacks.buttonPress.has(buttonName)) {
      this.callbacks.buttonPress.set(buttonName, []);
    }
    this.callbacks.buttonPress.get(buttonName).push(callback);
  }

  // Register callback for axis movement
  onAxisMove(axisName, callback) {
    if (!this.callbacks.axisMove.has(axisName)) {
      this.callbacks.axisMove.set(axisName, []);
    }
    this.callbacks.axisMove.get(axisName).push(callback);
  }

  // Register connection callbacks
  onConnect(callback) {
    this.callbacks.connect.push(callback);
  }

  onDisconnect(callback) {
    this.callbacks.disconnect.push(callback);
  }

  // Navigation helpers for React components
  setupNavigationControls() {
    // D-pad for navigation
    this.onButtonPress('d_pad_up', () => this.navigateUp());
    this.onButtonPress('d_pad_down', () => this.navigateDown());
    this.onButtonPress('d_pad_left', () => this.navigateLeft());
    this.onButtonPress('d_pad_right', () => this.navigateRight());
    
    // Action buttons
    this.onButtonPress('button_0', () => this.selectItem()); // A button
    this.onButtonPress('button_1', () => this.goBack()); // B button
    this.onButtonPress('button_2', () => this.showMenu()); // X button
    this.onButtonPress('button_3', () => this.showInventory()); // Y button
  }

  navigateUp() {
    const focusedElement = document.activeElement;
    const focusableElements = this.getFocusableElements();
    const currentIndex = Array.from(focusableElements).indexOf(focusedElement);
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
    }
  }

  navigateDown() {
    const focusedElement = document.activeElement;
    const focusableElements = this.getFocusableElements();
    const currentIndex = Array.from(focusableElements).indexOf(focusedElement);
    if (currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    }
  }

  navigateLeft() {
    // Custom left navigation logic
    this.triggerKeyEvent('ArrowLeft');
  }

  navigateRight() {
    // Custom right navigation logic
    this.triggerKeyEvent('ArrowRight');
  }

  selectItem() {
    const focusedElement = document.activeElement;
    if (focusedElement && (focusedElement.tagName === 'BUTTON' || focusedElement.tagName === 'A')) {
      focusedElement.click();
    } else {
      this.triggerKeyEvent('Enter');
    }
  }

  goBack() {
    this.triggerKeyEvent('Escape');
  }

  showMenu() {
    // Dispatch custom event for menu
    window.dispatchEvent(new CustomEvent('gamepad-menu'));
  }

  showInventory() {
    // Dispatch custom event for inventory
    window.dispatchEvent(new CustomEvent('gamepad-inventory'));
  }

  getFocusableElements() {
    return document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  triggerKeyEvent(key) {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: key,
      code: key,
      bubbles: true
    }));
  }

  // Get current gamepad state
  getState() {
    return {
      connected: this.isConnected,
      gamepads: this.gamepad.gamepads
    };
  }

  // Clean up
  destroy() {
    this.gamepad.destroy();
  }
}

// Singleton instance
let gamepadController = null;

export const getGamepadController = () => {
  if (!gamepadController) {
    gamepadController = new GamepadController();
  }
  return gamepadController;
};

export default GamepadController;
