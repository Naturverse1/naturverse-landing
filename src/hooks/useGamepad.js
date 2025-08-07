
import { useEffect, useState } from 'react';
import { getGamepadController } from '../controllers/GamepadController';

export const useGamepad = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [gamepadController, setGamepadController] = useState(null);

  useEffect(() => {
    const controller = getGamepadController();
    setGamepadController(controller);

    // Setup connection handlers
    controller.onConnect(() => {
      setIsConnected(true);
      console.log('🎮 Gamepad connected! Use D-pad to navigate, A to select, B to go back.');
    });

    controller.onDisconnect(() => {
      setIsConnected(false);
      console.log('🎮 Gamepad disconnected.');
    });

    // Setup navigation controls
    controller.setupNavigationControls();

    // Cleanup on unmount
    return () => {
      // Note: We don't destroy the controller as it's a singleton
    };
  }, []);

  const registerButtonCallback = (button, callback) => {
    if (gamepadController) {
      gamepadController.onButtonPress(button, callback);
    }
  };

  const registerAxisCallback = (axis, callback) => {
    if (gamepadController) {
      gamepadController.onAxisMove(axis, callback);
    }
  };

  return {
    isConnected,
    registerButtonCallback,
    registerAxisCallback,
    controller: gamepadController
  };
};

export default useGamepad;
