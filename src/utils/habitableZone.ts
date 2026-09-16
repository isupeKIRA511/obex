/**
 * Habitable Zone (HZ) Calculation Engine
 * 
 * Based on the peer-reviewed model by Kopparapu et al. (2013):
 * "Habitable Zones Around Main-Sequence Stars: New Estimates",
 * The Astrophysical Journal, 765(2), 131.
 * DOI: 10.1088/0004-637X/765/2/131
 * 
 * Includes:
 * 1. Stefan-Boltzmann Stellar Luminosity
 * 2. 4th-Order Polynomial Effective Flux (Seff) boundaries
 * 3. Distance boundaries in Astronomical Units (AU)
 * 4. Dual-Stage Sanity Check using Equilibrium Temperature (Teq)
 */

import { 
  HabitableZoneBoundaries, 
  HabitabilityClassification, 
  HabitabilityStatus 
} from '../types';

export const SUN_TEMP_K = 5778; // Sun's effective surface temperature
export const SUN_REF_OFFSET_K = 5780; // Kopparapu reference temperature offset

// Equilibrium Temperature limits for liquid water viability with greenhouse atmosphere
export const MIN_HABITABLE_TEMP_K = 235; // -38°C (Mars is ~210K, outer limit)
export const MAX_HABITABLE_TEMP_K = 350; // 77°C (Earth is 255K eq / 288K surface, Venus 737K)

interface PolynomialCoeffs {
  s0: number;
  a: number;
  b: number;
  c: number;
  d: number;
}

// Kopparapu et al. (2013) Table 3 Coefficients
const COEFFS = {
  runawayGreenhouse: { // Inner Conservative Boundary
    s0: 1.107,
    a: 1.332e-4,
    b: 1.580e-8,
    c: -8.308e-12,
    d: -1.931e-15,
  },
  maximumGreenhouse: { // Outer Conservative Boundary
    s0: 0.356,
    a: 6.171e-5,
    b: 1.698e-9,
    c: -3.198e-12,
    d: -5.575e-16,
  },
  recentVenus: { // Inner Optimistic Boundary
    s0: 1.776,
    a: 2.136e-4,
    b: 2.533e-8,
    c: -1.332e-11,
    d: -3.097e-15,
  },
  earlyMars: { // Outer Optimistic Boundary
    s0: 0.3207,
    a: 5.547e-5,
    b: 1.526e-9,
    c: -2.874e-12,
    d: -5.011e-16,
  },
};

function calculateSeff(tStar: number, c: PolynomialCoeffs): number {
  return (
    c.s0 +
    c.a * tStar +
    c.b * Math.pow(tStar, 2) +
    c.c * Math.pow(tStar, 3) +
    c.d * Math.pow(tStar, 4)
  );
}

/**
 * Calculates conservative and optimistic Habitable Zone boundaries for a given host star.
 * 
 * @param stellarRadius Solar radii (R_sun)
 * @param stellarTemp Effective temperature (Kelvin)
 */
export function calculateHabitableZone(
  stellarRadius: number = 1.0,
  stellarTemp: number = 5778
): HabitableZoneBoundaries {
  // Ensure valid physical ranges
  const r = Math.max(0.05, Math.min(100, stellarRadius));
  const t = Math.max(2000, Math.min(30000, stellarTemp));

  // 1. Stefan-Boltzmann Stellar Luminosity relative to Sun
  const luminosity = Math.pow(r, 2) * Math.pow(t / SUN_TEMP_K, 4);

  // 2. Temperature offset from Solar reference (5780 K)
  const tStar = t - SUN_REF_OFFSET_K;

  // 3. Effective stellar flux for each boundary
  const seffInner = calculateSeff(tStar, COEFFS.runawayGreenhouse);
  const seffOuter = calculateSeff(tStar, COEFFS.maximumGreenhouse);
  const seffInnerOpt = calculateSeff(tStar, COEFFS.recentVenus);
  const seffOuterOpt = calculateSeff(tStar, COEFFS.earlyMars);

  // 4. Boundary distances in AU (d = sqrt(L / Seff))
  const innerBoundary = Math.sqrt(luminosity / Math.max(0.001, seffInner));
  const outerBoundary = Math.sqrt(luminosity / Math.max(0.001, seffOuter));
  const innerOptimistic = Math.sqrt(luminosity / Math.max(0.001, seffInnerOpt));
  const outerOptimistic = Math.sqrt(luminosity / Math.max(0.001, seffOuterOpt));

  return {
    innerBoundary,
    outerBoundary,
    innerOptimistic,
    outerOptimistic,
    luminosity,
    stellarRadius: r,
    stellarTemp: t,
  };
}

/**
 * Classifies an exoplanet's habitability status using dual-stage scientific verification.
 * 
 * Step 1: Check equilibrium temperature Teq (Primary physical ground truth)
 * Step 2: Check orbital distance vs Kopparapu HZ boundaries
 * Step 3: Flag data inconsistencies / false positives
 */
export function evaluatePlanetHabitability(
  semiMajorAxisAU?: number,
  equilibriumTempK?: number,
  stellarRadius?: number,
  stellarTemp?: number
): HabitabilityClassification {
  if (!semiMajorAxisAU && !equilibriumTempK) {
    return {
      status: 'unknown',
      isHabitable: false,
      reason: 'Insufficient orbital or thermal telemetry',
      boundaries: null,
      passedSanityCheck: false,
    };
  }

  const boundaries = (stellarRadius && stellarTemp) 
    ? calculateHabitableZone(stellarRadius, stellarTemp) 
    : null;

  // Has equilibrium temperature
  if (equilibriumTempK && equilibriumTempK > 0) {
    const isTempHabitable = equilibriumTempK >= MIN_HABITABLE_TEMP_K && equilibriumTempK <= MAX_HABITABLE_TEMP_K;

    // Check spatial alignment if boundaries exist
    if (boundaries && semiMajorAxisAU && semiMajorAxisAU > 0) {
      const isSpatialHabitable = semiMajorAxisAU >= boundaries.innerBoundary && semiMajorAxisAU <= boundaries.outerBoundary;

      // False Positive Catch: If spatial bounds say yes, but Teq is frozen (<235K) or boiling (>350K)
      if (isSpatialHabitable && !isTempHabitable) {
        return {
          status: equilibriumTempK < MIN_HABITABLE_TEMP_K ? 'too_cold' : 'too_hot',
          isHabitable: false,
          reason: `Filtered by Sanity Check: Teq (${equilibriumTempK.toFixed(0)} K) contradicts geometric HZ due to noisy stellar parameters`,
          boundaries,
          equilibriumTempK,
          semiMajorAxisAU,
          passedSanityCheck: false,
        };
      }

      if (isSpatialHabitable && isTempHabitable) {
        return {
          status: 'habitable',
          isHabitable: true,
          reason: `Confirmed in Conservative HZ (${boundaries.innerBoundary.toFixed(3)}-${boundaries.outerBoundary.toFixed(3)} AU) with Teq = ${equilibriumTempK.toFixed(0)} K`,
          boundaries,
          equilibriumTempK,
          semiMajorAxisAU,
          passedSanityCheck: true,
        };
      }
    }

    // Pure temperature classification
    if (equilibriumTempK < MIN_HABITABLE_TEMP_K) {
      return {
        status: 'too_cold',
        isHabitable: false,
        reason: `Sub-freezing equilibrium temperature (${equilibriumTempK.toFixed(0)} K < ${MIN_HABITABLE_TEMP_K} K)`,
        boundaries,
        equilibriumTempK,
        semiMajorAxisAU,
        passedSanityCheck: true,
      };
    }

    if (equilibriumTempK > MAX_HABITABLE_TEMP_K) {
      return {
        status: 'too_hot',
        isHabitable: false,
        reason: `Superheated equilibrium temperature (${equilibriumTempK.toFixed(0)} K > ${MAX_HABITABLE_TEMP_K} K)`,
        boundaries,
        equilibriumTempK,
        semiMajorAxisAU,
        passedSanityCheck: true,
      };
    }

    return {
      status: 'habitable',
      isHabitable: true,
      reason: `Equilibrium temperature (${equilibriumTempK.toFixed(0)} K) supports liquid surface water`,
      boundaries,
      equilibriumTempK,
      semiMajorAxisAU,
      passedSanityCheck: true,
    };
  }

  // Fallback to purely orbital geometric calculations
  if (boundaries && semiMajorAxisAU && semiMajorAxisAU > 0) {
    if (semiMajorAxisAU < boundaries.innerBoundary) {
      return {
        status: 'too_hot',
        isHabitable: false,
        reason: `Inside inner boundary (a = ${semiMajorAxisAU.toFixed(3)} AU < ${boundaries.innerBoundary.toFixed(3)} AU)`,
        boundaries,
        semiMajorAxisAU,
        passedSanityCheck: true,
      };
    }
    if (semiMajorAxisAU > boundaries.outerBoundary) {
      return {
        status: 'too_cold',
        isHabitable: false,
        reason: `Beyond outer boundary (a = ${semiMajorAxisAU.toFixed(3)} AU > ${boundaries.outerBoundary.toFixed(3)} AU)`,
        boundaries,
        semiMajorAxisAU,
        passedSanityCheck: true,
      };
    }
    return {
      status: 'habitable',
      isHabitable: true,
      reason: `Within calculated conservative HZ (${boundaries.innerBoundary.toFixed(3)} - ${boundaries.outerBoundary.toFixed(3)} AU)`,
      boundaries,
      semiMajorAxisAU,
      passedSanityCheck: true,
    };
  }

  return {
    status: 'unknown',
    isHabitable: false,
    reason: 'Insufficient stellar or orbital data for complete classification',
    boundaries,
    passedSanityCheck: false,
  };
}
