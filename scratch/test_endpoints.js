const API_BASE_URL = 'https://exotransit-lab-api-production.up.railway.app';

const endpoints = [
  '/api/health',
  '/api/meta',
  '/api/targets',
  '/api/sessions',
  '/api/kpis',
  '/api/planets',
  '/api/planets/TRES-5',
  '/api/planets/validation',
  '/api/planets/equations',
  '/api/false-positive-cases',
  '/api/model/info',
  '/api/model/metrics',
  '/api/science/search',
  '/api/science/ephemerides',
  '/api/science/depths',
  '/api/science/predictions',
  '/api/science/phasefold/TRES-5',
  '/api/calibration',
  '/api/calibration/dark-masters',
  '/api/calibration/noise-curve',
  '/api/quality/correlations',
  '/api/quality/noise-floor',
  '/api/quality/sessions',
  '/api/sessions/TRES-5__2026-08-17/lightcurve',
  '/api/sessions/TRES-5__2026-08-17/frames',
  '/api/sessions/TRES-5__2026-08-17/motion',
];

async function testAll() {
  console.log('Testing all backend endpoints...');
  const results = [];
  
  for (const ep of endpoints) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${API_BASE_URL}${ep}`);
      const dt = Date.now() - t0;
      const status = res.status;
      let data = null;
      let ok = res.ok;
      try {
        data = await res.json();
      } catch (e) {
        data = 'Non-JSON response';
      }
      results.push({ ep, status, dt, ok, sample: typeof data === 'object' ? Object.keys(data).slice(0, 4) : data });
      console.log(`[${status}] ${ep} (${dt}ms) -> ${ok ? 'SUCCESS' : 'FAILED'}`);
    } catch (err) {
      console.log(`[ERR] ${ep} -> ${err.message}`);
      results.push({ ep, status: 'ERROR', error: err.message, ok: false });
    }
  }

  // Also test POST /api/explain
  try {
    const t0 = Date.now();
    const res = await fetch(`${API_BASE_URL}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'TRES-5__2026-08-17',
        language: 'ar',
        audience: 'student'
      })
    });
    const dt = Date.now() - t0;
    const ok = res.ok;
    const data = await res.json().catch(() => null);
    console.log(`[${res.status}] POST /api/explain (ar, student) (${dt}ms) -> ${ok ? 'SUCCESS' : 'FAILED'}`);
    if (data?.explanation) {
      console.log(`Explain sample: ${data.explanation.substring(0, 100)}...`);
    }
  } catch (err) {
    console.log(`[ERR] POST /api/explain -> ${err.message}`);
  }

  // Test POST /api/explain (astronomer)
  try {
    const t0 = Date.now();
    const res = await fetch(`${API_BASE_URL}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: 'TRES-5__2026-08-17',
        language: 'en',
        audience: 'astronomer'
      })
    });
    const dt = Date.now() - t0;
    const ok = res.ok;
    const data = await res.json().catch(() => null);
    console.log(`[${res.status}] POST /api/explain (en, astronomer) (${dt}ms) -> ${ok ? 'SUCCESS' : 'FAILED'}`);
  } catch (err) {
    console.log(`[ERR] POST /api/explain -> ${err.message}`);
  }

  return results;
}

testAll();
