export interface DatasetMeta {
  science_frames: number;
  dark_frames: number;
  total_files: number;
  brief_claims: number;
  discrepancy: number;
  targets: number;
  sessions: number;
  date_first: string;
  date_last: string;
  exptime_unique: number[];
  filters_science: string[];
  filters_dark: string[];
  image_shape: [number, number];
}

export interface Target {
  target: string;
  nights: number;
  good: number;
  marginal: number;
  unusable: number;
  n_frames: number;
  ra_deg: number;
  dec_deg: number;
  usable: boolean;
  v_mag?: number;
  period_days?: number;
  transit_depth_pct?: number;
  duration_hours?: number;
}

export interface SessionSummary {
  session_id: string;
  target: string;
  night: string;
  n_frames: number;
  start_utc: string;
  end_utc: string;
  span_hours: number;
  median_cadence_s: number;
  quality: 'good' | 'marginal' | 'unusable';
  median_contrast?: number;
  median_sources?: number;
  median_weather?: number;
}

export interface LightCurvePoint {
  frame_index: number;
  t_utc: string;
  bjd_tdb: number;
  target_flux: number;
  comp_flux_sum: number;
  norm_flux: number;
  target_only_norm: number;
  airmass: number;
  sky_level: number;
  WEATHER: number;
}

export interface TransitPrediction {
  session_id: string;
  target: string;
  host: string;
  epoch: number;
  pred_mid_bjd: number;
  pred_ingress_bjd: number;
  pred_egress_bjd: number;
  obs_start_bjd: number;
  obs_end_bjd: number;
  duration_h: number;
  expected_depth_pct: number | null;
  coverage_frac: number;
  mid_in_window: boolean;
  ephemeris_source: string;
}

export interface SessionLightCurve {
  session_id: string;
  target: string;
  quality: string;
  n_points: number;
  rms_ppt: number;
  rms_target_only_ppt: number;
  improvement_factor: number;
  target_saturated: boolean;
  prediction: TransitPrediction | null;
  points: LightCurvePoint[];
}

export interface PhaseFoldPoint {
  target: string;
  phase_hours: number;
  flux: number;
  err: number;
  n: number;
  n_nights: number;
}

export interface PhaseFoldResponse {
  target: string;
  binned: boolean;
  n_points: number;
  points: PhaseFoldPoint[];
}

export interface EphemerisRow {
  hostname: string;
  pl_name: string | null;
  pl_orbper: number | null;
  pl_tranmid: number | null;
  pl_trandur: number | null;
  pl_trandep: number | null;
  default_flag: number | null;
  source: string;
}

export interface MeasuredDepthRow {
  session_id: string;
  target: string;
  epoch: number;
  coverage_frac: number;
  expected_depth_pct: number | null;
  n_in: number;
  n_out: number;
  depth_pct: number;
  depth_err_pct: number;
  significance_sigma: number;
  out_of_transit_rms_ppt: number;
}

export interface FITSFrame {
  session_id: string;
  frame_index: number;
  t_utc: string;
  target: string;
  airmass: number;
  TELALT: number;
  WEATHER: number;
  sky_level: number;
  sky_sigma: number;
  peak_contrast: number;
  n_source_px: number;
  n_saturated: number;
  CAMTEMP: number;
}

export interface CalibrationSummary {
  n_darks: number;
  master_median_counts: number;
  master_spatial_sigma_counts: number;
  single_dark_spatial_sigma_counts: number;
  random_noise_1_dark: number;
  random_noise_full_stack: number;
  hot_pixels: number;
  hot_pixel_fraction_pct: number;
  fixed_pattern_stability_corr_30_nights: number;
  camtemp_K_range_darks: [number, number];
}

export interface NoiseCurvePoint {
  n_darks: number;
  random_noise_counts: number;
  theory_1_over_sqrt_n: number;
}

export interface SessionMotion {
  session_id: string;
  total_drift_px: number;
  max_single_step_px: number;
  points: Array<{
    frame_index: number;
    offset_dx: number;
    offset_dy: number;
    cum_dx: number;
    cum_dy: number;
  }>;
}

export interface QualityCorrelations {
  matrix: Record<string, Record<string, number>>;
  highlights: Array<{
    pair: [string, string];
    r: number;
    note: string;
  }>;
}

export interface NoiseFloorCurvePoint {
  n_stars: number;
  median_flux: number;
  median_rms_ppt: number;
  best_rms_ppt: number;
}

export interface NoiseFloorResponse {
  best_precision_ppt: number;
  detectable_depth_pct_1night: number;
  note: string;
  curve: NoiseFloorCurvePoint[];
}

export interface FalsePositiveCase {
  id: number;
  name: string;
  description: string;
  signature: string;
  test: string;
  testable_with_our_data: boolean;
  endpoint: string | null;
}

export interface ModelInfo {
  task: string;
  classes: string[];
  trained: boolean;
  artifacts_present: {
    weights: boolean;
    metrics: boolean;
    card: boolean;
  };
  label_provenance: string;
  validation_protocol: string;
  metrics_note: string;
  baseline: string;
}

export interface Planet3D {
  id: string;
  name: string;
  systemName: string;
  color: string;
  radiusKm: string;
  massKg: string;
  orbitalPeriod: string;
  surfaceGravity: string;
  surfaceTemp: string;
  textureUrl: string;
  bumpUrl?: string;
  cloudsUrl?: string;
  nightLightsUrl?: string;
  hasAtmosphere?: boolean;
}

// --- Live OpenAPI /api/kpis Definitions ---
export interface KpiDataset {
  science_frames: number;
  dark_frames: number;
  observing_sessions: number;
  targets: number;
  first_night: string;
  last_night: string;
  detail?: string;
}

export interface KpiDataQuality {
  sessions_good: number;
  sessions_marginal: number;
  sessions_unusable: number;
  usable_session_pct: number;
  targets_without_a_good_night: string[];
  detail?: string;
}

export interface KpiPhotometry {
  best_precision_ppt: number;
  smallest_3sigma_depth_one_night_pct: number;
  median_light_curve_rms_ppt_good_sessions: number;
  median_comparison_star_improvement: number;
  detail?: string;
}

export interface KpiTransitSearch {
  star_nights_searched: number;
  hits_p_le_0_01: number;
  hits_expected_by_chance: number;
  excess_over_chance: boolean;
  target_windows_measured: number;
  target_windows_at_3_sigma: number;
  target_windows_negative_depth: number;
  confirmed_planets: number;
  reading: string;
}

export interface KpiPlanetSuperlative {
  planet: string;
  target: string;
  value: number;
  unit: string;
}

export interface KpiPlanetSummaryItem {
  target: string;
  planet: string;
  distance_ly: number;
  a_au: number;
  orbital_speed_kms: number;
  orbital_period_days: number;
  teq_k: number;
}

export interface KpiPlanetsSection {
  count: number;
  nearest: KpiPlanetSuperlative;
  farthest: KpiPlanetSuperlative;
  fastest: KpiPlanetSuperlative;
  slowest: KpiPlanetSuperlative;
  hottest: KpiPlanetSuperlative;
  closest_to_its_star: KpiPlanetSuperlative;
  per_planet: KpiPlanetSummaryItem[];
  basis?: string;
}

export interface KpiPhysicsValidation {
  equation_checks: number;
  equation_checks_agree_pct: number;
  equation_checks_disagree: number;
  median_abs_pct_diff_semi_major_axis: number;
  measurement_checks: number;
  measurement_checks_at_3_sigma: number;
}

export interface KpiAI {
  source_classifier_trained: boolean;
  source_classifier_classes: string[];
  source_classifier_model: string;
  test_accuracy: number;
  test_macro_f1: number;
  baseline_macro_f1: number;
  majority_class_accuracy: number;
  classifier_reading: string;
  llm_narration_enabled: boolean;
  llm_model: string;
}

export interface KpiDashboardResponse {
  dataset: KpiDataset;
  data_quality: KpiDataQuality;
  photometry: KpiPhotometry;
  transit_search: KpiTransitSearch;
  planets: KpiPlanetsSection;
  physics_validation: KpiPhysicsValidation;
  ai: KpiAI;
  generated_utc: string;
}

// --- Live OpenAPI /api/planets Definitions ---
export interface PlanetPhysicalData {
  target: string;
  planet: string;
  archive_host: string;
  orbital_period_days: number;
  a_au: number;
  a_au_err?: number;
  orbit_in_mercury_orbits: number;
  orbit_circumference_million_km: number;
  orbital_speed_kms: number;
  orbital_speed_kms_err?: number;
  orbital_speed_vs_earth: number;
  a_over_rstar: number;
  a_over_rstar_err?: number;
  transit_duration_h: number;
  transit_duration_h_err?: number;
  teq_k: number;
  teq_k_err?: number;
  insolation_earth: number;
  insolation_earth_err?: number;
  rp_from_catalog_depth_rjup: number;
  rp_from_catalog_depth_rjup_err?: number;
  distance_pc: number;
  distance_pc_err?: number;
  distance_ly: number;
  distance_ly_err?: number;
  star_vmag: number;
  header_pointing_offset_arcmin?: number;
  header_pointing_offset_px?: number;
  catalog_source?: string;
  distance_source?: string;
  speed_distance_basis?: string;
}

// --- Live OpenAPI /api/planets/equations Definitions ---
export interface EquationItem {
  quantity: string;
  name?: string;
  formula: string;
  inputs: string[];
  assumption?: string;
}

export interface EquationsResponse {
  equations: EquationItem[];
  constants: Record<string, string>;
  uncertainties: string;
  orbit_assumption: string;
  external_data_disclosure: string;
}

// --- Live OpenAPI /api/planets/validation Definitions ---
export interface ValidationRow {
  target: string;
  planet: string;
  quantity: string;
  unit: string;
  derived: number;
  derived_err?: number | null;
  published: number;
  published_err?: number | null;
  pct_diff: number;
  z_score: number;
  status: 'agrees' | 'close' | 'disagrees' | 'inconclusive (below 3 sigma)' | 'null (star brightened)';
  equation: string;
  uses_our_data: boolean;
  note?: string | null;
}

export interface PhysicsValidationResponse {
  criteria: Record<string, string>;
  counts_equation_checks: {
    agrees: number;
    disagrees: number;
    close: number;
  };
  counts_measurement_checks: Record<string, number>;
  finding: string;
  rows: ValidationRow[];
}

// --- Live OpenAPI /api/planets/{target} Definitions ---
export interface PlanetCatalogInputs {
  target: string;
  hostname: string;
  pl_name: string;
  pl_orbper?: number;
  pl_orbsmax?: number;
  pl_radj?: number;
  pl_bmassj?: number;
  pl_orbincl?: number;
  pl_imppar?: number;
  pl_ratdor?: number;
  pl_ratror?: number;
  pl_trandep?: number;
  pl_trandur?: number;
  pl_eqt?: number;
  pl_insol?: number;
  pl_dens?: number;
  st_mass?: number;
  st_rad?: number;
  st_teff?: number;
  sy_dist?: number;
  sy_vmag?: number;
  ra?: number;
  dec?: number;
  catalog_source?: string;
}

export interface PlanetDetailResponse {
  target: string;
  planet: string;
  summary: string;
  catalog_inputs: PlanetCatalogInputs;
  derivations?: any[];
  validation?: ValidationRow[];
}

// --- Live OpenAPI /api/explain (Gemini 2.5 Flash) Definitions ---
export interface ExplainResponse {
  session_id: string;
  language?: string;
  audience?: string;
  verdict: string;
  out_of_transit_rms_ppt: number;
  significance_sigma: number;
  field_sigma_95: number;
  limitations: string[];
  explanation: string;
  model?: string;
  raw_text?: string;
  grounded_on?: any;
}

// --- NASA Exoplanet Archive & Habitable Zone Hub Definitions ---
export type HabitabilityStatus = 'habitable' | 'too_hot' | 'too_cold' | 'unknown';

export interface HabitableZoneBoundaries {
  innerBoundary: number; // AU (Runaway Greenhouse)
  outerBoundary: number; // AU (Maximum Greenhouse)
  innerOptimistic?: number; // AU (Recent Venus)
  outerOptimistic?: number; // AU (Early Mars)
  luminosity: number; // Solar luminosities (L_sun)
  stellarRadius: number; // Solar radii (R_sun)
  stellarTemp: number; // Kelvin
}

export interface HabitabilityClassification {
  status: HabitabilityStatus;
  isHabitable: boolean;
  reason: string;
  boundaries: HabitableZoneBoundaries | null;
  equilibriumTempK?: number;
  semiMajorAxisAU?: number;
  passedSanityCheck: boolean;
}

export interface NASAArchiveExoplanet {
  pl_name: string;
  hostname: string;
  disc_year?: number;
  disc_facility?: string;
  discoverymethod?: string;
  pl_rade?: number; // Earth radii
  pl_radj?: number; // Jupiter radii
  pl_masse?: number; // Earth masses
  pl_massj?: number; // Jupiter masses
  pl_orbper?: number; // Days
  pl_orbsmax?: number; // AU
  pl_orbeccen?: number;
  pl_eqt?: number; // Kelvin
  st_teff?: number; // Kelvin
  st_rad?: number; // Solar radii
  st_mass?: number; // Solar masses
  st_spectype?: string;
  st_age?: number; // Gyr
  st_met?: number; // Metallicity [dex]
  st_logg?: number; // Surface gravity [log(cm/s²)]
  ra?: number; // Right Ascension [deg]
  dec?: number; // Declination [deg]
  sy_dist?: number; // Distance in parsecs
  sy_vmag?: number; // Visual magnitude
  // Derived 3D coordinates & habitability
  x?: number; // Parsecs
  y?: number; // Parsecs
  z?: number; // Parsecs
  distance_ly?: number; // Light years
  habitability?: HabitabilityClassification;
}

export interface MissionCalculation {
  targetName: string;
  distanceLy: number;
  distanceKm: number;
  velocityFractionC: number;
  velocityKms: number;
  lorentzGamma: number;
  earthObserverYears: number;
  spacecraftShipYears: number;
  timeDilationSavedYears: number;
  chemicalRocketYears: number;
  voyager1Years: number;
  feasibilityLevel: 'Current Tech' | 'Near-Future Relativistic' | 'Advanced Relativistic' | 'Extreme Deep Space';
  kineticEnergyJoulesPerKg: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  team: string;
  challenge: string;
  data_dir: string;
  results_present: number;
  results_missing: string[];
  images_available: boolean;
  ai_enabled: boolean;
  timing: {
    barycentric_correction_applied: boolean;
    time_scale: string;
  };
}

export interface SearchRow {
  target: string;
  session_id: string;
  night: string;
  track_id: number;
  period_days: number;
  epoch: number;
  depth_pct: number;
  depth_err_pct: number;
  significance_sigma: number;
  p_value: number;
  p_le_0_01: boolean;
  score: number;
  is_target_star: boolean;
}

export interface SearchResponse {
  n_star_nights_searched: number;
  n_hits: number;
  n_expected_by_chance: number;
  verdict: string;
  rows: SearchRow[];
}

export interface QualitySessionRow {
  session_id: string;
  target: string;
  n_frames: number;
  median_contrast: number;
  median_sources: number;
  min_sources: number;
  median_sky: number;
  max_sky: number;
  median_sky_sigma: number;
  median_weather: number;
  median_airmass: number;
  quality: 'good' | 'marginal' | 'unusable';
  sky_swing: number;
}

export interface QualitySessionsResponse {
  thresholds: {
    good_contrast: number;
    good_sources: number;
    marginal_contrast: number;
  };
  counts: {
    good: number;
    unusable: number;
    marginal: number;
  };
  rows: QualitySessionRow[];
}

export interface DarkMasterItem {
  camtemp_K: number;
  n_darks: number;
  master_median: number;
}

export interface ModelMetricsResponse {
  generated_utc: string;
  classes: string[];
  n_cutouts: number;
  split: {
    strategy: string;
    train_sessions: string[];
    val_sessions: string[];
    test_sessions: string[];
  };
  test_metrics: {
    accuracy: number;
    macro_f1: number;
    weighted_f1: number;
    per_class: Record<string, {
      precision: number;
      recall: number;
      f1: number;
      support: number;
    }>;
  };
  baselines: Record<string, number>;
}



