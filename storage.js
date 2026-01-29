
const SAVE_KEY = 'got_rpg_save_v8'; // We update this version number if we change the save structure

/**
 * Loads the game state from local storage.
 * Returns null if no save exists or if data is corrupt.
 */
export const loadGame = () => {
  try {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return null;
    return JSON.parse(savedData);
  } catch (e) {
    console.error("Failed to load save file:", e);
    return null;
  }
};

/**
 * Saves the current player and world state.
 */
export const saveGame = (player, world) => {
  try {
    const dataToSave = JSON.stringify({ player, world });
    localStorage.setItem(SAVE_KEY, dataToSave);
    return true;
  } catch (e) {
    console.error("Failed to save game:", e);
    return false;
  }
};

/**
 * Wipes the save file (for Game Over or Restart).
 */
export const clearSave = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.error("Failed to clear save:", e);
  }
};
