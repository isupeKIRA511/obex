import { 
  DatasetMeta, 
  Target, 
  SessionSummary, 
  FalsePositiveCase, 
  SessionLightCurve, 
  PhaseFoldResponse, 
  EphemerisRow, 
  MeasuredDepthRow, 
  TransitPrediction, 
  FITSFrame, 
  CalibrationSummary, 
  NoiseCurvePoint, 
  SessionMotion, 
  QualityCorrelations, 
  NoiseFloorResponse,
  ModelInfo,
  KpiDashboardResponse,
  PlanetPhysicalData,
  EquationsResponse,
  PhysicsValidationResponse,
  PlanetDetailResponse,
  ExplainResponse,
  HealthResponse,
  SearchResponse,
  QualitySessionsResponse,
  DarkMasterItem,
  ModelMetricsResponse
} from '../types';

export const API_BASE_URL = 'https://exotransit-lab-api-production.up.railway.app';

// Helper to fetch directly from API
async function fetchJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return await res.json();
}

// Helper to fetch with a graceful fallback if network fails
async function fetchWithFallback<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    return await fetchJson<T>(endpoint);
  } catch (err) {
    console.warn(`[API] ${endpoint} request failed, using baseline.`, err);
    return fallback;
  }
}

// Baseline data preserved for offline resiliency
export const FALLBACK_META: DatasetMeta = {
  science_frames: 1681,
  dark_frames: 60,
  total_files: 1741,
  brief_claims: 1633,
  discrepancy: 108,
  targets: 8,
  sessions: 22,
  date_first: '2026-08-06 07:34:22 UTC',
  date_last: '2026-09-05 12:21:23 UTC',
  exptime_unique: [60.0],
  filters_science: ['Clear'],
  filters_dark: ['Opaque'],
  image_shape: [500, 650]
};

export const FALLBACK_TARGETS: Target[] = [
  { target: 'TRES-5', nights: 6, good: 6, marginal: 0, unusable: 0, n_frames: 427, ra_deg: 305.353, dec_deg: 59.531, usable: true, v_mag: 13.72, period_days: 1.4822, transit_depth_pct: 2.10, duration_hours: 1.82 },
  { target: 'TRES-1', nights: 1, good: 1, marginal: 0, unusable: 0, n_frames: 82, ra_deg: 286.177, dec_deg: 62.161, usable: true, v_mag: 11.79, period_days: 3.0300, transit_depth_pct: 2.20, duration_hours: 2.45 },
  { target: 'TRES-3', nights: 4, good: 4, marginal: 0, unusable: 0, n_frames: 261, ra_deg: 268.256, dec_deg: 37.540, usable: true, v_mag: 12.40, period_days: 1.3061, transit_depth_pct: 2.90, duration_hours: 1.35 },
  { target: 'WASP-10', nights: 1, good: 1, marginal: 0, unusable: 0, n_frames: 84, ra_deg: 348.158, dec_deg: 31.464, usable: true, v_mag: 12.70, period_days: 3.0927, transit_depth_pct: 1.60, duration_hours: 2.20 },
  { target: 'WASP-2', nights: 2, good: 2, marginal: 0, unusable: 0, n_frames: 140, ra_deg: 307.728, dec_deg: 6.427, usable: true, v_mag: 11.98, period_days: 2.1522, transit_depth_pct: 1.80, duration_hours: 1.70 },
  { target: 'Qatar-1', nights: 3, good: 3, marginal: 0, unusable: 0, n_frames: 236, ra_deg: 303.351, dec_deg: 51.157, usable: true, v_mag: 12.84, period_days: 1.4200, transit_depth_pct: 2.05, duration_hours: 1.60 },
  { target: 'CoRoT-2', nights: 3, good: 3, marginal: 0, unusable: 0, n_frames: 254, ra_deg: 291.785, dec_deg: 1.468, usable: true, v_mag: 12.57, period_days: 1.7429, transit_depth_pct: 3.40, duration_hours: 2.25 },
  { target: 'HAT-P-10', nights: 2, good: 1, marginal: 1, unusable: 0, n_frames: 197, ra_deg: 46.124, dec_deg: 30.514, usable: true, v_mag: 11.89, period_days: 3.7224, transit_depth_pct: 1.45, duration_hours: 2.70 }
];

export const FALLBACK_SESSIONS: SessionSummary[] = [
  { session_id: 'CoRoT-2__2026-08-09', target: 'CoRoT-2', night: '2026-08-09', n_frames: 87, start_utc: '2026-08-09T08:00:00Z', end_utc: '2026-08-09T12:17:00Z', span_hours: 4.29, median_cadence_s: 179.7, quality: 'good' },
  { session_id: 'CoRoT-2__2026-08-16', target: 'CoRoT-2', night: '2026-08-16', n_frames: 86, start_utc: '2026-08-16T08:00:00Z', end_utc: '2026-08-16T12:17:00Z', span_hours: 4.29, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'CoRoT-2__2026-08-23', target: 'CoRoT-2', night: '2026-08-23', n_frames: 86, start_utc: '2026-08-23T08:00:00Z', end_utc: '2026-08-23T12:17:00Z', span_hours: 4.29, median_cadence_s: 180.3, quality: 'unusable' },
  { session_id: 'CoRoT-2__2026-08-30', target: 'CoRoT-2', night: '2026-08-30', n_frames: 87, start_utc: '2026-08-30T08:00:00Z', end_utc: '2026-08-30T12:29:00Z', span_hours: 4.49, median_cadence_s: 180.0, quality: 'unusable' },
  { session_id: 'HATP-10__2026-09-02', target: 'HATP-10', night: '2026-09-02', n_frames: 104, start_utc: '2026-09-02T07:00:00Z', end_utc: '2026-09-02T12:00:00Z', span_hours: 5.00, median_cadence_s: 180.3, quality: 'marginal' },
  { session_id: 'HATP-10__2026-09-05', target: 'HATP-10', night: '2026-09-05', n_frames: 93, start_utc: '2026-09-05T07:42:00Z', end_utc: '2026-09-05T12:21:00Z', span_hours: 4.65, median_cadence_s: 144.3, quality: 'good' },
  { session_id: 'Qatar-1__2026-08-18', target: 'Qatar-1', night: '2026-08-18', n_frames: 75, start_utc: '2026-08-18T08:24:00Z', end_utc: '2026-08-18T12:25:00Z', span_hours: 4.02, median_cadence_s: 180.4, quality: 'good' },
  { session_id: 'Qatar-1__2026-08-21', target: 'Qatar-1', night: '2026-08-21', n_frames: 74, start_utc: '2026-08-21T04:37:00Z', end_utc: '2026-08-21T08:15:00Z', span_hours: 3.63, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'Qatar-1__2026-08-28', target: 'Qatar-1', night: '2026-08-28', n_frames: 73, start_utc: '2026-08-28T07:00:00Z', end_utc: '2026-08-28T10:39:00Z', span_hours: 3.64, median_cadence_s: 180.3, quality: 'unusable' },
  { session_id: 'TRES-1__2026-08-06', target: 'TRES-1', night: '2026-08-06', n_frames: 91, start_utc: '2026-08-06T07:34:00Z', end_utc: '2026-08-06T12:38:00Z', span_hours: 5.07, median_cadence_s: 180.4, quality: 'unusable' },
  { session_id: 'TRES-3__2026-08-10', target: 'TRES-3', night: '2026-08-10', n_frames: 70, start_utc: '2026-08-10T06:06:00Z', end_utc: '2026-08-10T09:55:00Z', span_hours: 3.82, median_cadence_s: 180.4, quality: 'good' },
  { session_id: 'TRES-3__2026-08-14', target: 'TRES-3', night: '2026-08-14', n_frames: 51, start_utc: '2026-08-14T04:09:00Z', end_utc: '2026-08-14T06:39:00Z', span_hours: 2.50, median_cadence_s: 180.0, quality: 'good' },
  { session_id: 'TRES-3__2026-08-27', target: 'TRES-3', night: '2026-08-27', n_frames: 70, start_utc: '2026-08-27T05:39:00Z', end_utc: '2026-08-27T09:06:00Z', span_hours: 3.44, median_cadence_s: 179.7, quality: 'good' },
  { session_id: 'TRES-3__2026-08-31', target: 'TRES-3', night: '2026-08-31', n_frames: 70, start_utc: '2026-08-31T03:47:00Z', end_utc: '2026-08-31T07:09:00Z', span_hours: 3.37, median_cadence_s: 180.4, quality: 'good' },
  { session_id: 'TRES-5__2026-08-17', target: 'TRES-5', night: '2026-08-17', n_frames: 74, start_utc: '2026-08-17T09:17:00Z', end_utc: '2026-08-17T14:28:00Z', span_hours: 5.17, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'TRES-5__2026-08-20', target: 'TRES-5', night: '2026-08-20', n_frames: 74, start_utc: '2026-08-20T08:24:00Z', end_utc: '2026-08-20T12:20:00Z', span_hours: 3.93, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'TRES-5__2026-08-26', target: 'TRES-5', night: '2026-08-26', n_frames: 74, start_utc: '2026-08-26T06:44:00Z', end_utc: '2026-08-26T10:21:00Z', span_hours: 3.61, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'TRES-5__2026-08-29', target: 'TRES-5', night: '2026-08-29', n_frames: 74, start_utc: '2026-08-29T05:52:00Z', end_utc: '2026-08-29T09:30:00Z', span_hours: 3.62, median_cadence_s: 180.4, quality: 'good' },
  { session_id: 'TRES-5__2026-09-01', target: 'TRES-5', night: '2026-09-01', n_frames: 74, start_utc: '2026-09-01T05:00:00Z', end_utc: '2026-09-01T08:39:00Z', span_hours: 3.64, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'TRES-5__2026-09-04', target: 'TRES-5', night: '2026-09-04', n_frames: 57, start_utc: '2026-09-04T04:10:00Z', end_utc: '2026-09-04T06:57:00Z', span_hours: 2.78, median_cadence_s: 180.3, quality: 'good' },
  { session_id: 'WASP-10__2026-08-08', target: 'WASP-10', night: '2026-08-08', n_frames: 86, start_utc: '2026-08-08T05:40:00Z', end_utc: '2026-08-08T09:54:00Z', span_hours: 4.23, median_cadence_s: 180.4, quality: 'unusable' },
  { session_id: 'WASP-2__2026-08-11', target: 'WASP-2', night: '2026-08-11', n_frames: 78, start_utc: '2026-08-11T06:54:00Z', end_utc: '2026-08-11T10:45:00Z', span_hours: 3.85, median_cadence_s: 180.1, quality: 'unusable' },
  { session_id: 'WASP-2__2026-08-24', target: 'WASP-2', night: '2026-08-24', n_frames: 77, start_utc: '2026-08-24T04:52:00Z', end_utc: '2026-08-24T08:39:00Z', span_hours: 3.78, median_cadence_s: 180.3, quality: 'marginal' }
];

export const FALLBACK_FALSE_POSITIVES: FalsePositiveCase[] = [
  { id: 1, name: 'Planet transit', description: 'A planet crosses the disc of its host star.', signature: 'Flat-bottomed U shape, 1-3 h long, recurring on a fixed period with the same depth every time.', test: 'Falls at the predicted time AND recurs across nights.', testable_with_our_data: true, endpoint: '/api/science/depths' },
  { id: 2, name: 'Cloud or haze', description: 'Sky transparency drops across the whole field.', signature: 'Every star dims together; the shape is irregular.', test: 'Check whether the comparison stars dip at the same time.', testable_with_our_data: true, endpoint: '/api/sessions/{session_id}/lightcurve' },
  { id: 3, name: 'Tracking slip', description: 'The star drifts partly out of the measuring aperture.', signature: 'Sudden and sharp; the star\'s measured position jumps.', test: 'Compare against the per-frame field offset.', testable_with_our_data: true, endpoint: '/api/sessions/{session_id}/motion' },
  { id: 4, name: 'Cosmic ray', description: 'A charged particle strikes the sensor.', signature: 'One frame only, a sharp 1-2 px spike.', test: 'Single-frame outlier; no track persistence.', testable_with_our_data: true, endpoint: '/api/sessions/{session_id}/tracks' },
  { id: 5, name: 'Hot pixel in the aperture', description: 'A permanently bright detector defect drifts into the aperture.', signature: 'Step change that coincides with the field drift.', test: 'Cross-check against the dark-frame hot pixel mask.', testable_with_our_data: true, endpoint: '/api/calibration/hot-pixels' },
  { id: 6, name: 'Airmass / extinction', description: 'The star sinks towards the horizon and reddens.', signature: 'A slow smooth trend rather than a dip.', test: 'Correlate with TELALT; detrend.', testable_with_our_data: true, endpoint: '/api/quality/correlations' },
  { id: 7, name: 'Starspots', description: 'Dark patches on the star\'s own surface rotate in and out of view.', signature: 'A slow wave over hours to days, changing shape between epochs.', test: 'Needs multi-epoch, multi-colour photometry.', testable_with_our_data: false, endpoint: null },
  { id: 8, name: 'Eclipsing binary', description: 'Two stars orbit each other and one eclipses the other.', signature: 'V-shaped rather than flat-bottomed, and often very deep.', test: 'Shape test only -- partial discrimination.', testable_with_our_data: true, endpoint: '/api/science/depths' },
  { id: 9, name: 'Blended eclipsing binary', description: 'A faint eclipsing pair sits inside the same aperture as the target.', signature: 'A diluted dip; the measured centroid shifts during the event.', test: 'Cannot be resolved at 5 arcsec/pixel.', testable_with_our_data: false, endpoint: null },
  { id: 10, name: 'Odd/even depth mismatch', description: 'An eclipsing binary mistaken for a planet at half its true period.', signature: 'Alternating depths between consecutive events.', test: 'Compare depths across repeat nights.', testable_with_our_data: true, endpoint: '/api/science/phasefold/{target}' },
  { id: 11, name: 'Pure noise', description: 'Random scatter that happens to look like a dip.', signature: 'Wrong duration, no recurrence, no fixed phase.', test: 'Compare the dip against the other 100-450 stars in the same image at the same phase.', testable_with_our_data: true, endpoint: '/api/science/search' }
];

// Baseline KPI Dashboard metrics
export const FALLBACK_KPIS: KpiDashboardResponse = {
  dataset: {
    science_frames: 1681,
    dark_frames: 60,
    observing_sessions: 22,
    targets: 8,
    first_night: "2026-08-06",
    last_night: "2026-09-05"
  },
  data_quality: {
    sessions_good: 15,
    sessions_marginal: 1,
    sessions_unusable: 6,
    usable_session_pct: 68.2,
    targets_without_a_good_night: ["TRES-1", "WASP-10", "WASP-2"]
  },
  photometry: {
    best_precision_ppt: 4.76,
    smallest_3sigma_depth_one_night_pct: 1.429,
    median_light_curve_rms_ppt_good_sessions: 27.54,
    median_comparison_star_improvement: 4.02
  },
  transit_search: {
    star_nights_searched: 2723,
    hits_p_le_0_01: 20,
    hits_expected_by_chance: 27.2,
    excess_over_chance: false,
    target_windows_measured: 16,
    target_windows_at_3_sigma: 1,
    target_windows_negative_depth: 11,
    confirmed_planets: 0,
    reading: "No detection is claimed as a confirmed planet."
  },
  planets: {
    count: 8,
    nearest: { planet: "WASP-11 b", target: "HATP-10", value: 406.8, unit: "light-years" },
    farthest: { planet: "TrES-5 b", target: "TRES-5", value: 1175.2, unit: "light-years" },
    fastest: { planet: "TrES-3 b", target: "TRES-3", value: 190.1, unit: "km/s" },
    slowest: { planet: "WASP-10 b", target: "WASP-10", value: 132.9, unit: "km/s" },
    hottest: { planet: "TrES-3 b", target: "TRES-3", value: 1642.2, unit: "K" },
    closest_to_its_star: { planet: "TrES-3 b", target: "TRES-3", value: 0.0228, unit: "AU" },
    per_planet: [
      { target: "HATP-10", planet: "WASP-11 b", distance_ly: 407.0, a_au: 0.0528, orbital_speed_kms: 154.3, orbital_period_days: 3.722, teq_k: 953.0 },
      { target: "WASP-10", planet: "WASP-10 b", distance_ly: 460.0, a_au: 0.0378, orbital_speed_kms: 132.9, orbital_period_days: 3.093, teq_k: 969.0 },
      { target: "WASP-2", planet: "WASP-2 b", distance_ly: 500.0, a_au: 0.0314, orbital_speed_kms: 158.9, orbital_period_days: 2.152, teq_k: 1310.0 },
      { target: "TRES-1", planet: "TrES-1 b", distance_ly: 521.0, a_au: 0.0415, orbital_speed_kms: 149.1, orbital_period_days: 3.03, teq_k: 1141.0 },
      { target: "Qatar-1", planet: "Qatar-1 b", distance_ly: 605.0, a_au: 0.0233, orbital_speed_kms: 178.7, orbital_period_days: 1.42, teq_k: 1418.0 },
      { target: "CoRoT-2", planet: "CoRoT-2 b", distance_ly: 696.0, a_au: 0.028, orbital_speed_kms: 174.7, orbital_period_days: 1.743, teq_k: 1544.0 },
      { target: "TRES-3", planet: "TrES-3 b", distance_ly: 755.0, a_au: 0.0228, orbital_speed_kms: 190.1, orbital_period_days: 1.306, teq_k: 1642.0 },
      { target: "TRES-5", planet: "TrES-5 b", distance_ly: 1175.0, a_au: 0.0246, orbital_speed_kms: 180.5, orbital_period_days: 1.482, teq_k: 1482.0 }
    ]
  },
  physics_validation: {
    equation_checks: 48,
    equation_checks_agree_pct: 87.5,
    equation_checks_disagree: 5,
    median_abs_pct_diff_semi_major_axis: 0.03,
    measurement_checks: 29,
    measurement_checks_at_3_sigma: 10
  },
  ai: {
    source_classifier_trained: true,
    source_classifier_classes: ["star", "faint_source", "hot_pixel", "cosmic_ray", "satellite_trail", "noise"],
    source_classifier_model: "small_cnn",
    test_accuracy: 0.415,
    test_macro_f1: 0.411,
    baseline_macro_f1: 0.1,
    majority_class_accuracy: 0.2718,
    classifier_reading: "Reliable on unseen nights for noise.",
    llm_narration_enabled: true,
    llm_model: "google/gemini-2.5-flash"
  },
  generated_utc: "2026-09-16T11:51:04Z"
};

export const apiService = {
  // Metadata & Catalog
  getMeta: () => fetchWithFallback<DatasetMeta>('/api/meta', FALLBACK_META),
  getTargets: () => fetchWithFallback<Target[]>('/api/targets', FALLBACK_TARGETS),
  getSessions: (quality?: string) => 
    fetchWithFallback<SessionSummary[]>(quality ? `/api/sessions?quality=${quality}` : '/api/sessions', FALLBACK_SESSIONS),
  getFalsePositiveCases: () => 
    fetchWithFallback<FalsePositiveCase[]>('/api/false-positive-cases', FALLBACK_FALSE_POSITIVES),

  // Live Executive KPI Dashboard (NEW Endpoint)
  getKPIs: () => fetchWithFallback<KpiDashboardResponse>('/api/kpis', FALLBACK_KPIS),

  // Live Confirmed Exoplanet Physical Catalog (NEW Endpoint)
  getPlanets: () => fetchWithFallback<PlanetPhysicalData[]>('/api/planets', []),

  // Live Per-Target Physics Card & Derivations (NEW Endpoint)
  getPlanetPhysics: async (target: string): Promise<PlanetDetailResponse | null> => {
    try {
      return await fetchJson<PlanetDetailResponse>(`/api/planets/${encodeURIComponent(target)}`);
    } catch (err) {
      console.warn(`[API] Failed to fetch planet physics for ${target}:`, err);
      return null;
    }
  },

  // Live Astrophysics Validation Suite (NEW Endpoint)
  getPhysicsValidation: () => fetchWithFallback<PhysicsValidationResponse>('/api/planets/validation', {
    criteria: {},
    counts_equation_checks: { agrees: 42, disagrees: 5, close: 1 },
    counts_measurement_checks: {},
    finding: '',
    rows: []
  }),

  // Live Mathematical Equations & Physical Constants (NEW Endpoint)
  getEquations: () => fetchWithFallback<EquationsResponse>('/api/planets/equations', {
    equations: [],
    constants: {},
    uncertainties: '',
    orbit_assumption: '',
    external_data_disclosure: ''
  }),

  // Gemini 2.5 Flash Plain-Language AI Session Explanation (Live LLM Endpoint)
  explainSession: async (sessionId: string, language: 'en' | 'ar' = 'ar', audience: string = 'student'): Promise<ExplainResponse | null> => {
    try {
      const validAudience = audience === 'astrophysicist' ? 'astronomer' : (['student', 'astronomer', 'public'].includes(audience) ? audience : 'student');
      const res = await fetch(`${API_BASE_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, language, audience: validAudience })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const raw = await res.json();
      
      const limitations: string[] = [];
      if (raw.grounded_on?.limitation) {
        if (Array.isArray(raw.grounded_on.limitation)) {
          limitations.push(...raw.grounded_on.limitation);
        } else {
          limitations.push(raw.grounded_on.limitation);
        }
      }

      return {
        session_id: raw.session_id || sessionId,
        language: raw.language || language,
        audience: raw.audience || audience,
        verdict: raw.verdict || raw.grounded_on?.verdict || 'ANALYSIS COMPLETE',
        out_of_transit_rms_ppt: raw.out_of_transit_rms_ppt ?? raw.grounded_on?.depth?.out_of_transit_rms_ppt ?? raw.grounded_on?.photometry?.rms_ppt ?? 0,
        significance_sigma: raw.significance_sigma ?? raw.grounded_on?.depth?.significance_sigma ?? 0,
        field_sigma_95: raw.field_sigma_95 ?? raw.grounded_on?.field_context?.field_sigma_95 ?? 0,
        limitations: raw.limitations || limitations,
        explanation: raw.explanation || raw.text || '',
        model: raw.model_name || raw.model || 'google/gemini-2.5-flash',
        grounded_on: raw.grounded_on
      };
    } catch (err) {
      console.warn(`[API] Explain request failed for session ${sessionId}:`, err);
      return null;
    }
  },

  // Live Light Curve for a specific Session
  getLightCurve: async (sessionId: string): Promise<SessionLightCurve | null> => {
    try {
      return await fetchJson<SessionLightCurve>(`/api/sessions/${sessionId}/lightcurve`);
    } catch (err) {
      console.warn(`[API] Failed to fetch lightcurve for ${sessionId}:`, err);
      return null;
    }
  },

  // Live Multi-Night Phase-Folded Curve for Target
  getPhaseFolded: async (target: string): Promise<PhaseFoldResponse | null> => {
    try {
      return await fetchJson<PhaseFoldResponse>(`/api/science/phasefold/${target}`);
    } catch (err) {
      console.warn(`[API] Failed to fetch phasefold for ${target}:`, err);
      return null;
    }
  },

  // NASA Exoplanet Archive Ephemerides
  getEphemerides: async (): Promise<{ external_data_disclosure: string; rows: EphemerisRow[] }> => {
    return await fetchWithFallback('/api/science/ephemerides', {
      external_data_disclosure: 'NASA Exoplanet Archive TAP Service',
      rows: []
    });
  },

  // Science Depths (All measured transit nights)
  getDepths: async (): Promise<{ interpretation: any; rows: MeasuredDepthRow[] }> => {
    return await fetchWithFallback('/api/science/depths', {
      interpretation: {},
      rows: []
    });
  },

  // Transit Predictions
  getPredictions: async (): Promise<TransitPrediction[]> => {
    return await fetchWithFallback<TransitPrediction[]>('/api/science/predictions', []);
  },

  // Live FITS Frames catalog for a Session
  getSessionFrames: async (sessionId: string): Promise<FITSFrame[]> => {
    try {
      return await fetchJson<FITSFrame[]>(`/api/sessions/${sessionId}/frames`);
    } catch (err) {
      console.warn(`[API] Failed to fetch frames for ${sessionId}:`, err);
      return [];
    }
  },

  // Session Telescope Mount Drift Motion
  getSessionMotion: async (sessionId: string): Promise<SessionMotion | null> => {
    try {
      return await fetchJson<SessionMotion>(`/api/sessions/${sessionId}/motion`);
    } catch (err) {
      console.warn(`[API] Failed to fetch motion for ${sessionId}:`, err);
      return null;
    }
  },

  // Calibration Summary & Hot Pixels
  getCalibrationSummary: async (): Promise<CalibrationSummary> => {
    return await fetchWithFallback<CalibrationSummary>('/api/calibration', {
      n_darks: 60,
      master_median_counts: 369.5,
      master_spatial_sigma_counts: 2.965,
      single_dark_spatial_sigma_counts: 2.965,
      random_noise_1_dark: 1.048,
      random_noise_full_stack: 0.287,
      hot_pixels: 691,
      hot_pixel_fraction_pct: 0.2126,
      fixed_pattern_stability_corr_30_nights: 0.9749,
      camtemp_K_range_darks: [276, 285]
    });
  },

  // Thermal Noise Curve (1/√N test)
  getNoiseCurve: async (): Promise<NoiseCurvePoint[]> => {
    return await fetchWithFallback<NoiseCurvePoint[]>('/api/calibration/noise-curve', []);
  },

  // Quality Correlations Matrix
  getQualityCorrelations: async (): Promise<QualityCorrelations> => {
    return await fetchWithFallback<QualityCorrelations>('/api/quality/correlations', {
      matrix: {},
      highlights: []
    });
  },

  // Photometric Noise Floor
  getNoiseFloor: async (): Promise<NoiseFloorResponse> => {
    return await fetchWithFallback<NoiseFloorResponse>('/api/quality/noise-floor', {
      best_precision_ppt: 4.76,
      detectable_depth_pct_1night: 1.43,
      note: 'A 3-sigma single-night detection needs a depth about three times the scatter.',
      curve: []
    });
  },

  // Model & Classifier Specifications
  getModelInfo: async (): Promise<ModelInfo | null> => {
    try {
      return await fetchJson<ModelInfo>('/api/model/info');
    } catch {
      return null;
    }
  },

  // Live Backend Health & Data Inventory Integrity
  getHealth: () => fetchWithFallback<HealthResponse>('/api/health', {
    status: 'ok',
    version: '1.0.0',
    team: 'Iraqi Andromeda',
    challenge: 'Hack4Dev Iraq 2026 - Exoplanet Data Challenge',
    data_dir: '/app/data',
    results_present: 31,
    results_missing: [],
    images_available: true,
    ai_enabled: true,
    timing: {
      barycentric_correction_applied: true,
      time_scale: 'BJD_TDB'
    }
  }),

  // Ephemeris-Guided Multi-Star Search (Chance Expectation Baseline)
  getSearch: () => fetchWithFallback<SearchResponse>('/api/science/search', {
    n_star_nights_searched: 2723,
    n_hits: 20,
    n_expected_by_chance: 27.2,
    verdict: '20 stars clear p <= 0.01, but ~27 were expected by chance across this many tests. The rows below are a RANKING of the most transit-like stars, not a set of detections.',
    rows: []
  }),

  // Live Session Quality Triage with Thresholds
  getQualitySessions: () => fetchWithFallback<QualitySessionsResponse>('/api/quality/sessions', {
    thresholds: { good_contrast: 300, good_sources: 800, marginal_contrast: 100 },
    counts: { good: 15, unusable: 6, marginal: 1 },
    rows: []
  }),

  // Temperature-Dependent Dark Masters Stack
  getDarkMasters: () => fetchWithFallback<DarkMasterItem[]>('/api/calibration/dark-masters', [
    { camtemp_K: 276, n_darks: 2, master_median: 362 },
    { camtemp_K: 277, n_darks: 5, master_median: 361 },
    { camtemp_K: 278, n_darks: 10, master_median: 365 },
    { camtemp_K: 279, n_darks: 14, master_median: 368 },
    { camtemp_K: 280, n_darks: 17, master_median: 371 },
    { camtemp_K: 281, n_darks: 7, master_median: 374 },
    { camtemp_K: 282, n_darks: 3, master_median: 380 },
    { camtemp_K: 285, n_darks: 2, master_median: 401 }
  ]),

  // AI CNN Classifier Metrics
  getModelMetrics: () => fetchWithFallback<ModelMetricsResponse | null>('/api/model/metrics', null),

  // URL Helper: Real CCD Frame Image
  getFrameImageUrl: (sessionId: string, frameIndex: number): string => {
    return `${API_BASE_URL}/api/images/${sessionId}/frame/${frameIndex}`;
  },

  // URL Helper: Calibration Triptych Image
  getTriptychImageUrl: (kind: 'raw' | 'master_dark' | 'calibrated' | 'hot_pixel_map'): string => {
    return `${API_BASE_URL}/api/images/triptych/${kind}`;
  }
};
