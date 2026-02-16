export default createUseBreakpoint;
/**
 * @param {object} options Hook configuration.
 * @param {() => Array<[string, number]>} [options.getBreakpoints] Breakpoint provider.
 * @param {() => object} [options.getEvents] Event emitter provider.
 * @param {string} [options.eventName] Event name for breakpoints.
 * @param {() => number} [options.getWindowWidth] Window width resolver override.
 * @param {boolean} [options.isExpo] Force Expo environment detection.
 * @param {object} [options.dimensions] Dimensions implementation override.
 * @returns {Function} Configured breakpoint hook.
 */
declare function createUseBreakpoint(options?: {
    getBreakpoints?: () => Array<[string, number]>;
    getEvents?: () => object;
    eventName?: string;
    getWindowWidth?: () => number;
    isExpo?: boolean;
    dimensions?: object;
}): Function;
