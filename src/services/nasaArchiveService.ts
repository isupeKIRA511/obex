/**
 * NASA Exoplanet Archive TAP (Table Access Protocol) Client
 * 
 * Directly queries the official Caltech / NASA Exoplanet Archive TAP endpoint:
 * https://exoplanetarchive.ipac.caltech.edu/TAP/sync
 * 
 * Enriches data with:
 * 1. 3D Cartesian coordinates (X, Y, Z) in parsecs
 * 2. Scientific Kopparapu (2013) Habitable Zone classification
 * 3. Distance in light years
 * 4. Resilient offline fallback dataset containing TESS and benchmark targets
 */

import { NASAArchiveExoplanet } from '../types';
import { equatorialToCartesian, parsecsToLightYears } from '../utils/celestialCoordinates';
import { evaluatePlanetHabitability } from '../utils/habitableZone';

const NASA_TAP_API = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

// High-fidelity fallback dataset for offline stability
export const FALLBACK_NASA_EXOPLANETS: NASAArchiveExoplanet[] = [
  // --- Confirmed Habitable Zone Exoplanets (TESS & Benchmarks) ---
  {
    pl_name: 'TOI-700 d',
    hostname: 'TOI-700',
    disc_year: 2020,
    disc_facility: 'Transiting Exoplanet Survey Satellite (TESS)',
    discoverymethod: 'Transit',
    pl_rade: 1.14,
    pl_masse: 1.72,
    pl_orbper: 37.42,
    pl_orbsmax: 0.163,
    pl_orbeccen: 0.03,
    pl_eqt: 269,
    st_teff: 3480,
    st_rad: 0.42,
    st_mass: 0.42,
    st_spectype: 'M2 V',
    ra: 100.89,
    dec: -65.68,
    sy_dist: 31.13,
    sy_vmag: 13.15,
  },
  {
    pl_name: 'TOI-715 b',
    hostname: 'TOI-715',
    disc_year: 2024,
    disc_facility: 'Transiting Exoplanet Survey Satellite (TESS)',
    discoverymethod: 'Transit',
    pl_rade: 1.55,
    pl_masse: 3.02,
    pl_orbper: 19.29,
    pl_orbsmax: 0.083,
    pl_orbeccen: 0.00,
    pl_eqt: 280,
    st_teff: 3075,
    st_rad: 0.24,
    st_mass: 0.22,
    st_spectype: 'M4 V',
    ra: 113.62,
    dec: -74.19,
    sy_dist: 42.4,
    sy_vmag: 16.24,
  },
  {
    pl_name: 'TOI-2257 b',
    hostname: 'TOI-2257',
    disc_year: 2021,
    disc_facility: 'Transiting Exoplanet Survey Satellite (TESS)',
    discoverymethod: 'Transit',
    pl_rade: 2.20,
    pl_masse: 5.41,
    pl_orbper: 35.19,
    pl_orbsmax: 0.145,
    pl_orbeccen: 0.496,
    pl_eqt: 278,
    st_teff: 3430,
    st_rad: 0.31,
    st_mass: 0.33,
    st_spectype: 'M3 V',
    ra: 193.36,
    dec: 77.65,
    sy_dist: 57.8,
    sy_vmag: 15.2,
  },
  {
    pl_name: 'LHS 1140 b',
    hostname: 'LHS 1140',
    disc_year: 2017,
    disc_facility: 'MEarth Project',
    discoverymethod: 'Transit',
    pl_rade: 1.73,
    pl_masse: 5.60,
    pl_orbper: 24.74,
    pl_orbsmax: 0.0936,
    pl_orbeccen: 0.06,
    pl_eqt: 235,
    st_teff: 3216,
    st_rad: 0.21,
    st_mass: 0.18,
    st_spectype: 'M4.5 V',
    ra: 11.24,
    dec: -15.27,
    sy_dist: 14.99,
    sy_vmag: 14.18,
  },
  {
    pl_name: 'TRAPPIST-1 e',
    hostname: 'TRAPPIST-1',
    disc_year: 2017,
    disc_facility: 'La Silla Observatory',
    discoverymethod: 'Transit',
    pl_rade: 0.92,
    pl_masse: 0.69,
    pl_orbper: 6.10,
    pl_orbsmax: 0.029,
    pl_orbeccen: 0.005,
    pl_eqt: 251,
    st_teff: 2566,
    st_rad: 0.12,
    st_mass: 0.09,
    st_spectype: 'M8 V',
    ra: 346.62,
    dec: -5.04,
    sy_dist: 12.47,
    sy_vmag: 18.80,
  },
  {
    pl_name: 'Proxima Centauri b',
    hostname: 'Proxima Centauri',
    disc_year: 2016,
    disc_facility: 'European Southern Observatory',
    discoverymethod: 'Radial Velocity',
    pl_rade: 1.07,
    pl_masse: 1.17,
    pl_orbper: 11.19,
    pl_orbsmax: 0.0485,
    pl_orbeccen: 0.11,
    pl_eqt: 234,
    st_teff: 3042,
    st_rad: 0.15,
    st_mass: 0.12,
    st_spectype: 'M5.5 V',
    ra: 217.43,
    dec: -62.68,
    sy_dist: 1.30,
    sy_vmag: 11.13,
  },
  {
    pl_name: 'Kepler-452 b',
    hostname: 'Kepler-452',
    disc_year: 2015,
    disc_facility: 'Kepler',
    discoverymethod: 'Transit',
    pl_rade: 1.63,
    pl_masse: 3.29,
    pl_orbper: 384.84,
    pl_orbsmax: 1.046,
    pl_orbeccen: 0.03,
    pl_eqt: 265,
    st_teff: 5757,
    st_rad: 1.11,
    st_mass: 1.04,
    st_spectype: 'G2 V',
    ra: 296.00,
    dec: 44.28,
    sy_dist: 552.0,
    sy_vmag: 13.37,
  },

  // --- False Positive Sanity Check Demo Targets ---
  {
    pl_name: 'TOI-6478 b',
    hostname: 'TOI-6478',
    disc_year: 2024,
    disc_facility: 'Transiting Exoplanet Survey Satellite (TESS)',
    discoverymethod: 'Transit',
    pl_rade: 1.80,
    pl_masse: 4.10,
    pl_orbper: 28.5,
    pl_orbsmax: 0.1136,
    pl_orbeccen: 0.00,
    pl_eqt: 204, // Too Cold sanity check trigger!
    st_teff: 3250,
    st_rad: 0.23,
    st_mass: 0.25,
    st_spectype: 'M3.5 V',
    ra: 85.42,
    dec: -42.11,
    sy_dist: 68.2,
    sy_vmag: 15.8,
  },
  {
    pl_name: 'TOI-904 c',
    hostname: 'TOI-904',
    disc_year: 2023,
    disc_facility: 'Transiting Exoplanet Survey Satellite (TESS)',
    discoverymethod: 'Transit',
    pl_rade: 2.10,
    pl_masse: 5.20,
    pl_orbper: 83.9,
    pl_orbsmax: 0.312,
    pl_orbeccen: 0.05,
    pl_eqt: 217, // Too Cold sanity check trigger!
    st_teff: 3600,
    st_rad: 0.45,
    st_mass: 0.48,
    st_spectype: 'M1 V',
    ra: 135.25,
    dec: 22.84,
    sy_dist: 89.4,
    sy_vmag: 14.5,
  },

  // --- OBEX Platform 8 Primary Observed Targets ---
  {
    pl_name: 'TrES-5 b',
    hostname: 'TrES-5',
    disc_year: 2011,
    disc_facility: 'Trans-Atlantic Exoplanet Survey (TrES)',
    discoverymethod: 'Transit',
    pl_rade: 13.56,
    pl_radj: 1.209,
    pl_masse: 565.0,
    pl_massj: 1.778,
    pl_orbper: 1.4822,
    pl_orbsmax: 0.0246,
    pl_orbeccen: 0.00,
    pl_eqt: 1482,
    st_teff: 5171,
    st_rad: 0.87,
    st_mass: 0.89,
    st_spectype: 'G5 V',
    ra: 305.353,
    dec: 59.531,
    sy_dist: 360.3,
    sy_vmag: 13.72,
  },
  {
    pl_name: 'TrES-1 b',
    hostname: 'TrES-1',
    disc_year: 2004,
    disc_facility: 'Trans-Atlantic Exoplanet Survey (TrES)',
    discoverymethod: 'Transit',
    pl_rade: 12.11,
    pl_radj: 1.081,
    pl_masse: 242.0,
    pl_massj: 0.761,
    pl_orbper: 3.0300,
    pl_orbsmax: 0.0393,
    pl_orbeccen: 0.00,
    pl_eqt: 1141,
    st_teff: 5230,
    st_rad: 0.83,
    st_mass: 0.88,
    st_spectype: 'K0 V',
    ra: 286.177,
    dec: 62.161,
    sy_dist: 159.8,
    sy_vmag: 11.79,
  },
  {
    pl_name: 'TrES-3 b',
    hostname: 'TrES-3',
    disc_year: 2007,
    disc_facility: 'Trans-Atlantic Exoplanet Survey (TrES)',
    discoverymethod: 'Transit',
    pl_rade: 15.02,
    pl_radj: 1.341,
    pl_masse: 607.0,
    pl_massj: 1.910,
    pl_orbper: 1.3061,
    pl_orbsmax: 0.0228,
    pl_orbeccen: 0.00,
    pl_eqt: 1642,
    st_teff: 5650,
    st_rad: 0.81,
    st_mass: 0.90,
    st_spectype: 'G8 V',
    ra: 268.256,
    dec: 37.540,
    sy_dist: 231.5,
    sy_vmag: 12.40,
  },
  {
    pl_name: 'WASP-10 b',
    hostname: 'WASP-10',
    disc_year: 2008,
    disc_facility: 'SuperWASP',
    discoverymethod: 'Transit',
    pl_rade: 14.35,
    pl_radj: 1.280,
    pl_masse: 1004.0,
    pl_massj: 3.160,
    pl_orbper: 3.0927,
    pl_orbsmax: 0.0378,
    pl_orbeccen: 0.057,
    pl_eqt: 969,
    st_teff: 4675,
    st_rad: 0.77,
    st_mass: 0.75,
    st_spectype: 'K5 V',
    ra: 348.158,
    dec: 31.464,
    sy_dist: 141.0,
    sy_vmag: 12.70,
  },
  {
    pl_name: 'WASP-2 b',
    hostname: 'WASP-2',
    disc_year: 2006,
    disc_facility: 'SuperWASP',
    discoverymethod: 'Transit',
    pl_rade: 12.11,
    pl_radj: 1.081,
    pl_masse: 289.0,
    pl_massj: 0.910,
    pl_orbper: 2.1522,
    pl_orbsmax: 0.0314,
    pl_orbeccen: 0.00,
    pl_eqt: 1310,
    st_teff: 5150,
    st_rad: 0.84,
    st_mass: 0.88,
    st_spectype: 'K1 V',
    ra: 307.728,
    dec: 6.427,
    sy_dist: 153.3,
    sy_vmag: 11.98,
  },
  {
    pl_name: 'Qatar-1 b',
    hostname: 'Qatar-1',
    disc_year: 2010,
    disc_facility: 'Qatar Exoplanet Survey',
    discoverymethod: 'Transit',
    pl_rade: 13.04,
    pl_radj: 1.164,
    pl_masse: 423.0,
    pl_massj: 1.331,
    pl_orbper: 1.4200,
    pl_orbsmax: 0.0233,
    pl_orbeccen: 0.00,
    pl_eqt: 1418,
    st_teff: 4910,
    st_rad: 0.80,
    st_mass: 0.85,
    st_spectype: 'K3 V',
    ra: 303.351,
    dec: 51.157,
    sy_dist: 185.5,
    sy_vmag: 12.84,
  },
  {
    pl_name: 'CoRoT-2 b',
    hostname: 'CoRoT-2',
    disc_year: 2007,
    disc_facility: 'CoRoT',
    discoverymethod: 'Transit',
    pl_rade: 16.48,
    pl_radj: 1.465,
    pl_masse: 1052.0,
    pl_massj: 3.310,
    pl_orbper: 1.7429,
    pl_orbsmax: 0.0281,
    pl_orbeccen: 0.00,
    pl_eqt: 1544,
    st_teff: 5625,
    st_rad: 0.90,
    st_mass: 0.97,
    st_spectype: 'G7 V',
    ra: 291.785,
    dec: 1.468,
    sy_dist: 213.4,
    sy_vmag: 12.57,
  },
  {
    pl_name: 'WASP-11 b',
    hostname: 'HAT-P-10',
    disc_year: 2008,
    disc_facility: 'HATNet / SuperWASP',
    discoverymethod: 'Transit',
    pl_rade: 11.66,
    pl_radj: 1.040,
    pl_masse: 168.0,
    pl_massj: 0.530,
    pl_orbper: 3.7224,
    pl_orbsmax: 0.0439,
    pl_orbeccen: 0.00,
    pl_eqt: 953,
    st_teff: 4980,
    st_rad: 0.81,
    st_mass: 0.82,
    st_spectype: 'K3 V',
    ra: 46.124,
    dec: 30.514,
    sy_dist: 124.7,
    sy_vmag: 11.89,
  },
];

/**
 * Enriches a raw NASA TAP record with 3D Cartesian coordinates,
 * light year distances, and Kopparapu (2013) habitability classification.
 */
export function enrichNASAExoplanet(raw: Partial<NASAArchiveExoplanet>): NASAArchiveExoplanet {
  const distPc = raw.sy_dist || 50;
  const ra = raw.ra || 0;
  const dec = raw.dec || 0;

  // 3D Cartesian coordinates in parsecs
  const cartesian = equatorialToCartesian(ra, dec, distPc);

  // Habitability evaluation
  const habitability = evaluatePlanetHabitability(
    raw.pl_orbsmax,
    raw.pl_eqt,
    raw.st_rad,
    raw.st_teff
  );

  return {
    ...raw,
    pl_name: raw.pl_name || 'Unknown Planet',
    hostname: raw.hostname || 'Unknown Star',
    sy_dist: distPc,
    distance_ly: parsecsToLightYears(distPc),
    x: cartesian.x,
    y: cartesian.y,
    z: cartesian.z,
    habitability,
  };
}

// In-memory runtime cache
let cachedEnrichedPlanets: NASAArchiveExoplanet[] = FALLBACK_NASA_EXOPLANETS.map(enrichNASAExoplanet);

export const nasaArchiveService = {
  /**
   * Returns current cached or fallback exoplanets immediately.
   */
  getCachedPlanets: (): NASAArchiveExoplanet[] => {
    return cachedEnrichedPlanets;
  },

  /**
   * Fetches confirmed TESS and planetary systems directly from NASA Exoplanet Archive TAP API.
   * If network or CORS is blocked, gracefully returns the enriched scientific baseline.
   */
  fetchLiveTAPExoplanets: async (limit: number = 60): Promise<NASAArchiveExoplanet[]> => {
    const query = `select top ${limit} pl_name, hostname, disc_year, disc_facility, discoverymethod,
                   pl_rade, pl_radj, pl_masse, pl_massj, pl_orbper, pl_orbsmax, pl_orbeccen, pl_eqt,
                   st_teff, st_rad, st_mass, st_spectype, st_age, st_met, st_logg, ra, dec, sy_dist, sy_vmag
                   from ps
                   where default_flag = 1 and sy_dist is not null and pl_orbsmax is not null
                   order by sy_dist asc`;

    try {
      const url = `${NASA_TAP_API}?query=${encodeURIComponent(query)}&format=json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`NASA TAP response error: HTTP ${response.status}`);
      }

      const data: any[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const enriched = data.map(enrichNASAExoplanet);
        
        // Merge with our 8 OBEX benchmark planets so they're always accessible
        const combined = [...enriched];
        const existingNames = new Set(enriched.map(p => p.pl_name.toLowerCase()));
        
        for (const fallback of FALLBACK_NASA_EXOPLANETS.map(enrichNASAExoplanet)) {
          if (!existingNames.has(fallback.pl_name.toLowerCase())) {
            combined.push(fallback);
          }
        }

        cachedEnrichedPlanets = combined;
        return combined;
      }
    } catch (err) {
      console.warn('[NASA TAP Service] Direct query failed or CORS restricted, serving enriched catalog baseline:', err);
    }

    return cachedEnrichedPlanets;
  },

  /**
   * Queries specifically for Habitable Zone candidates
   */
  fetchHabitableCandidates: async (): Promise<NASAArchiveExoplanet[]> => {
    const all = await nasaArchiveService.fetchLiveTAPExoplanets(100);
    return all.filter((p) => p.habitability?.isHabitable);
  },

  /**
   * Searches for a planet or star by keyword
   */
  searchCatalog: (keyword: string, catalog?: NASAArchiveExoplanet[]): NASAArchiveExoplanet[] => {
    const pool = catalog || cachedEnrichedPlanets;
    if (!keyword.trim()) return pool;
    const lower = keyword.toLowerCase().trim();
    return pool.filter(
      (p) =>
        p.pl_name.toLowerCase().includes(lower) ||
        p.hostname.toLowerCase().includes(lower) ||
        (p.st_spectype && p.st_spectype.toLowerCase().includes(lower)) ||
        (p.disc_facility && p.disc_facility.toLowerCase().includes(lower))
    );
  },
};
