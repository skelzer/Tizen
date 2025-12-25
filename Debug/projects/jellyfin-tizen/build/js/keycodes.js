/*
 * Moonfin Tizen Key Codes
 * Global key code constants for consistent keyboard/remote navigation
 * Samsung Tizen TV remote control key mappings
 */

var KeyCodes = (function() {
    'use strict';

    // Standard navigation keys
    var NAVIGATION = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        ENTER: 13,
        OK: 13 // Alias for ENTER
    };

    // Tizen/Samsung TV specific keys
    var TIZEN = {
        BACK: 10009,           // Return/Back button
        EXIT: 10182,           // Exit button
        RED: 403,              // Color button Red
        GREEN: 404,            // Color button Green
        YELLOW: 405,           // Color button Yellow
        BLUE: 406,             // Color button Blue
        PLAY: 415,             // MediaPlay
        PAUSE: 19,             // MediaPause
        PLAY_PAUSE: 10252,     // MediaPlayPause
        STOP: 413,             // MediaStop
        REWIND: 412,           // MediaRewind
        FAST_FORWARD: 417,     // MediaFastForward
        TRACK_PREVIOUS: 10232, // MediaTrackPrevious
        TRACK_NEXT: 10233,     // MediaTrackNext
        CHANNEL_UP: 427,       // ChannelUp
        CHANNEL_DOWN: 428,     // ChannelDown
        VOLUME_UP: 447,        // VolumeUp (usually handled by TV)
        VOLUME_DOWN: 448,      // VolumeDown (usually handled by TV)
        VOLUME_MUTE: 449,      // VolumeMute
        INFO: 457,             // Info button
        MENU: 18,              // Menu button
        TOOLS: 10135,          // Tools button
        SOURCE: 10072,         // Source button
        GUIDE: 458,            // Guide button
        CAPTION: 10221,        // Caption/Subtitle button
        EXTRA: 10253           // Extra button
    };

    // Standard keyboard keys (for development/debugging)
    var KEYBOARD = {
        SPACE: 32,
        ESCAPE: 27,
        TAB: 9,
        BACKSPACE: 8,
        DELETE: 46
    };

    // Number keys (0-9 on remote)
    var NUMBERS = {
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57
    };

    // Merged object with all keys
    var ALL_KEYS = {
        // Navigation
        LEFT: NAVIGATION.LEFT,
        UP: NAVIGATION.UP,
        RIGHT: NAVIGATION.RIGHT,
        DOWN: NAVIGATION.DOWN,
        ENTER: NAVIGATION.ENTER,
        OK: NAVIGATION.OK,
        
        // Tizen/Samsung TV specific
        BACK: TIZEN.BACK,
        EXIT: TIZEN.EXIT,
        RED: TIZEN.RED,
        GREEN: TIZEN.GREEN,
        YELLOW: TIZEN.YELLOW,
        BLUE: TIZEN.BLUE,
        PLAY: TIZEN.PLAY,
        PAUSE: TIZEN.PAUSE,
        PLAY_PAUSE: TIZEN.PLAY_PAUSE,
        STOP: TIZEN.STOP,
        REWIND: TIZEN.REWIND,
        FAST_FORWARD: TIZEN.FAST_FORWARD,
        TRACK_PREVIOUS: TIZEN.TRACK_PREVIOUS,
        TRACK_NEXT: TIZEN.TRACK_NEXT,
        CHANNEL_UP: TIZEN.CHANNEL_UP,
        CHANNEL_DOWN: TIZEN.CHANNEL_DOWN,
        INFO: TIZEN.INFO,
        MENU: TIZEN.MENU,
        TOOLS: TIZEN.TOOLS,
        CAPTION: TIZEN.CAPTION,
        
        // Keyboard
        SPACE: KEYBOARD.SPACE,
        ESCAPE: KEYBOARD.ESCAPE,
        TAB: KEYBOARD.TAB,
        BACKSPACE: KEYBOARD.BACKSPACE,
        DELETE: KEYBOARD.DELETE,
        
        // Numbers
        ZERO: NUMBERS.ZERO,
        ONE: NUMBERS.ONE,
        TWO: NUMBERS.TWO,
        THREE: NUMBERS.THREE,
        FOUR: NUMBERS.FOUR,
        FIVE: NUMBERS.FIVE,
        SIX: NUMBERS.SIX,
        SEVEN: NUMBERS.SEVEN,
        EIGHT: NUMBERS.EIGHT,
        NINE: NUMBERS.NINE
    };

    /**
     * Check if a key code is a navigation key
     * @param {number} keyCode - The key code to check
     * @returns {boolean} True if the key is a navigation key
     */
    function isNavigationKey(keyCode) {
        return keyCode === NAVIGATION.LEFT ||
               keyCode === NAVIGATION.UP ||
               keyCode === NAVIGATION.RIGHT ||
               keyCode === NAVIGATION.DOWN ||
               keyCode === NAVIGATION.ENTER;
    }

    /**
     * Check if a key code is a number key
     * @param {number} keyCode - The key code to check
     * @returns {boolean} True if the key is a number key
     */
    function isNumberKey(keyCode) {
        return keyCode >= NUMBERS.ZERO && keyCode <= NUMBERS.NINE;
    }

    /**
     * Get the number value from a number key code
     * @param {number} keyCode - The key code
     * @returns {number|null} The number value (0-9) or null if not a number key
     */
    function getNumberValue(keyCode) {
        if (isNumberKey(keyCode)) {
            return keyCode - NUMBERS.ZERO;
        }
        return null;
    }

    /**
     * Get a human-readable name for a key code
     * @param {number} keyCode - The key code
     * @returns {string} The key name or 'UNKNOWN'
     */
    function getKeyName(keyCode) {
        for (var key in ALL_KEYS) {
            if (ALL_KEYS[key] === keyCode) {
                return key;
            }
        }
        return 'UNKNOWN';
    }

    // Public API
    return {
        // Key code groups
        NAVIGATION: NAVIGATION,
        TIZEN: TIZEN,
        KEYBOARD: KEYBOARD,
        NUMBERS: NUMBERS,
        
        // Individual keys (flat structure for convenience)
        LEFT: ALL_KEYS.LEFT,
        UP: ALL_KEYS.UP,
        RIGHT: ALL_KEYS.RIGHT,
        DOWN: ALL_KEYS.DOWN,
        ENTER: ALL_KEYS.ENTER,
        OK: ALL_KEYS.OK,
        BACK: ALL_KEYS.BACK,
        EXIT: ALL_KEYS.EXIT,
        RED: ALL_KEYS.RED,
        GREEN: ALL_KEYS.GREEN,
        YELLOW: ALL_KEYS.YELLOW,
        BLUE: ALL_KEYS.BLUE,
        PLAY: ALL_KEYS.PLAY,
        PAUSE: ALL_KEYS.PAUSE,
        PLAY_PAUSE: ALL_KEYS.PLAY_PAUSE,
        STOP: ALL_KEYS.STOP,
        REWIND: ALL_KEYS.REWIND,
        FAST_FORWARD: ALL_KEYS.FAST_FORWARD,
        FORWARD: ALL_KEYS.FAST_FORWARD, // Alias for FAST_FORWARD
        TRACK_PREVIOUS: ALL_KEYS.TRACK_PREVIOUS,
        TRACK_NEXT: ALL_KEYS.TRACK_NEXT,
        CHANNEL_UP: ALL_KEYS.CHANNEL_UP,
        CHANNEL_DOWN: ALL_KEYS.CHANNEL_DOWN,
        INFO: ALL_KEYS.INFO,
        MENU: ALL_KEYS.MENU,
        TOOLS: ALL_KEYS.TOOLS,
        CAPTION: ALL_KEYS.CAPTION,
        SPACE: ALL_KEYS.SPACE,
        ESCAPE: ALL_KEYS.ESCAPE,
        TAB: ALL_KEYS.TAB,
        BACKSPACE: ALL_KEYS.BACKSPACE,
        DELETE: ALL_KEYS.DELETE,
        ZERO: ALL_KEYS.ZERO,
        ONE: ALL_KEYS.ONE,
        TWO: ALL_KEYS.TWO,
        THREE: ALL_KEYS.THREE,
        FOUR: ALL_KEYS.FOUR,
        FIVE: ALL_KEYS.FIVE,
        SIX: ALL_KEYS.SIX,
        SEVEN: ALL_KEYS.SEVEN,
        EIGHT: ALL_KEYS.EIGHT,
        NINE: ALL_KEYS.NINE,
        
        // Utility functions
        isNavigationKey: isNavigationKey,
        isNumberKey: isNumberKey,
        getNumberValue: getNumberValue,
        getKeyName: getKeyName
    };
})();
