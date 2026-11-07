/**
 * "Lite" mode for phones / tablets / touch devices: skip WebGL scenes, canvas particle
 * loops and smooth-scroll hijacking so scrolling stays at a steady 60fps.
 * Desktop keeps the full cinematic experience.
 */
export const LITE_QUERY = "(max-width: 1023px), (pointer: coarse)";

export const isLite = () => typeof window !== "undefined" && window.matchMedia(LITE_QUERY).matches;
