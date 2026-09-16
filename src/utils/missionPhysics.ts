/**
 * Relativistic Interstellar Mission Calculator & Trajectory Physics
 * 
 * Computes:
 * 1. Relativistic travel times at sub-light fractions (0.01c to 0.99c)
 * 2. Lorentz Factor γ = 1 / √(1 - v²/c²)
 * 3. Time Dilation: Ship Proper Time vs Earth Observer Coordinate Time
 * 4. Specific Relativistic Kinetic Energy: (γ - 1) * c²
 * 5. Comparison against Voyager 1 (17 km/s) and Chemical Propulsion (11.2 km/s)
 */

import { MissionCalculation } from '../types';
import { LIGHT_YEAR_TO_KM } from './celestialCoordinates';

export const SPEED_OF_LIGHT_KMS = 299792.458; // c in km/s
export const SPEED_OF_LIGHT_MS = 299792458; // c in m/s
export const VOYAGER_1_SPEED_KMS = 17.0; // km/s (0.0000567c)
export const CHEMICAL_ROCKET_SPEED_KMS = 11.2; // km/s (0.0000373c)

/**
 * Computes interstellar mission telemetry for a given target distance and velocity fraction (v/c).
 * 
 * @param targetName Name of the exoplanet / star system
 * @param distanceLy Distance in light years
 * @param velocityFractionC Fraction of speed of light (e.g. 0.1 for 10% c)
 */
export function calculateInterstellarMission(
  targetName: string,
  distanceLy: number,
  velocityFractionC: number
): MissionCalculation {
  // Clamp fraction between 0.00001 and 0.999
  const beta = Math.max(0.00001, Math.min(0.999, velocityFractionC));
  const velocityKms = beta * SPEED_OF_LIGHT_KMS;
  const distanceKm = distanceLy * LIGHT_YEAR_TO_KM;

  // Lorentz Factor γ = 1 / √(1 - β²)
  const lorentzGamma = 1 / Math.sqrt(1 - Math.pow(beta, 2));

  // Earth Observer Time (years) = Distance (ly) / (v / c)
  const earthObserverYears = distanceLy / beta;

  // Spacecraft Ship Time (Proper Time) = Earth Time / γ
  const spacecraftShipYears = earthObserverYears / lorentzGamma;

  // Time dilation savings
  const timeDilationSavedYears = earthObserverYears - spacecraftShipYears;

  // Conventional comparisons
  const voyager1Years = (distanceKm / VOYAGER_1_SPEED_KMS) / (365.25 * 86400);
  const chemicalRocketYears = (distanceKm / CHEMICAL_ROCKET_SPEED_KMS) / (365.25 * 86400);

  // Specific relativistic kinetic energy (J/kg) = (γ - 1) * c²
  const kineticEnergyJoulesPerKg = (lorentzGamma - 1) * Math.pow(SPEED_OF_LIGHT_MS, 2);

  // Feasibility Classification
  let feasibilityLevel: MissionCalculation['feasibilityLevel'] = 'Near-Future Relativistic';
  if (beta <= 0.001) {
    feasibilityLevel = 'Current Tech';
  } else if (beta <= 0.2) {
    feasibilityLevel = 'Near-Future Relativistic'; // Breakthrough Starshot laser sails
  } else if (beta <= 0.8) {
    feasibilityLevel = 'Advanced Relativistic'; // Fusion / Antimatter propulsion
  } else {
    feasibilityLevel = 'Extreme Deep Space'; // Relativistic ramjet / Dyson beam
  }

  return {
    targetName,
    distanceLy,
    distanceKm,
    velocityFractionC: beta,
    velocityKms,
    lorentzGamma,
    earthObserverYears,
    spacecraftShipYears,
    timeDilationSavedYears,
    chemicalRocketYears,
    voyager1Years,
    feasibilityLevel,
    kineticEnergyJoulesPerKg,
  };
}
