/**
 * Celestial Coordinate Transformation Utilities
 * 
 * Converts equatorial celestial coordinates (RA, Dec, Distance)
 * to 3D Cartesian space (X, Y, Z) in parsecs / light-years.
 * 
 * Standard astronomical coordinate definition:
 * - X-axis: Points toward Vernal Equinox (RA = 0°, Dec = 0°)
 * - Y-axis: Points toward RA = 90°, Dec = 0° (East in the sky)
 * - Z-axis: Points toward North Celestial Pole (Dec = 90°)
 * - Origin (0, 0, 0): Our Solar System (Sun / Earth)
 */

export const PARSEC_TO_LIGHT_YEAR = 3.261563777;
export const LIGHT_YEAR_TO_KM = 9.460730472e12;
export const AU_TO_KM = 149597870.7;

export interface Cartesian3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts Right Ascension (deg), Declination (deg), and Distance (parsecs)
 * to 3D Cartesian coordinates (parsecs).
 */
export function equatorialToCartesian(
  raDeg: number,
  decDeg: number,
  distancePc: number
): Cartesian3D {
  const raRad = (raDeg * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;

  const x = distancePc * Math.cos(decRad) * Math.cos(raRad);
  const y = distancePc * Math.cos(decRad) * Math.sin(raRad);
  const z = distancePc * Math.sin(decRad);

  return { x, y, z };
}

/**
 * Converts parsecs to light years
 */
export function parsecsToLightYears(pc: number): number {
  return pc * PARSEC_TO_LIGHT_YEAR;
}

/**
 * Converts light years to parsecs
 */
export function lightYearsToParsecs(ly: number): number {
  return ly / PARSEC_TO_LIGHT_YEAR;
}

/**
 * Normalizes 3D coordinates for WebGL rendering at a comfortable visual scale.
 */
export function scaleCoordinatesFor3D(
  coords: Cartesian3D,
  scaleFactor: number = 0.1
): Cartesian3D {
  return {
    x: coords.x * scaleFactor,
    y: coords.y * scaleFactor,
    z: coords.z * scaleFactor,
  };
}
