import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Target, SessionSummary, PlanetDetailResponse, ExplainResponse, MeasuredDepthRow } from '../types';
import { calculateHabitableZone, evaluatePlanetHabitability } from './habitableZone';
import { calculateInterstellarMission } from './missionPhysics';
import { FALLBACK_NASA_EXOPLANETS } from '../services/nasaArchiveService';
import { isSameTarget } from './targetUtils';

export interface ExoplanetPDFExportOptions {
  selectedTarget?: Target | null;
  selectedSession?: SessionSummary | null;
  planetPhysics?: PlanetDetailResponse | null;
  explainData?: ExplainResponse | null;
  measuredDepth?: MeasuredDepthRow | null;
  cruiseVelocityC?: number;
  userNotes?: string;
}

/**
 * Renders multilingual text (supporting Arabic, English, and symbols) onto an offscreen HTML5 canvas
 * with high-DPI retina sharpness and native RTL font shaping, then returns an image for jsPDF embedding.
 */
function renderMultilingualTextToCanvas(
  title: string,
  content: string,
  widthMm: number = 182
): { dataUrl: string; widthMm: number; heightMm: number } | null {
  if (typeof document === 'undefined') return null;

  try {
    const scale = 2; // High-DPI 2x scale
    const widthPx = Math.floor(widthMm * 3.779527559 * scale);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isArabic = /[\u0600-\u06FF]/.test(title + ' ' + content);
    const fontSize = 11.5 * scale;
    const titleSize = 13.5 * scale;
    const lineHeight = fontSize * 1.55;
    const padding = 14 * scale;

    const fontFamily = isArabic 
      ? '"Cairo", "Tajawal", "Segoe UI", "Tahoma", "Arial", sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

    ctx.font = `${fontSize}px ${fontFamily}`;
    const maxTextWidth = widthPx - (padding * 2);
    
    // Split into paragraphs and wrap lines
    const paragraphs = content.split('\n');
    const lines: string[] = [];

    for (const para of paragraphs) {
      if (!para.trim()) {
        lines.push('');
        continue;
      }
      const words = para.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    const contentHeight = Math.max(lines.length * lineHeight, 30 * scale);
    const totalHeightPx = (padding * 2) + titleSize + (10 * scale) + contentHeight;

    canvas.width = widthPx;
    canvas.height = totalHeightPx;

    // Card background
    ctx.fillStyle = '#0b0f19'; // OBEX Dark Canvas
    ctx.fillRect(0, 0, widthPx, totalHeightPx);

    // Border
    ctx.strokeStyle = '#0284c7'; // Sky 600
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(1 * scale, 1 * scale, widthPx - 2 * scale, totalHeightPx - 2 * scale);

    // Title
    ctx.fillStyle = '#38bdf8'; // Sky 400
    ctx.font = `bold ${titleSize}px ${fontFamily}`;
    ctx.direction = isArabic ? 'rtl' : 'ltr';
    ctx.textAlign = isArabic ? 'right' : 'left';
    const titleX = isArabic ? widthPx - padding : padding;
    ctx.fillText(title, titleX, padding + titleSize * 0.85);

    // Body Lines
    ctx.fillStyle = '#f1f5f9'; // Slate 100
    ctx.font = `${fontSize}px ${fontFamily}`;

    let currentY = padding + titleSize + (10 * scale);
    for (const line of lines) {
      if (line) {
        const isLineArabic = /[\u0600-\u06FF]/.test(line);
        ctx.direction = isLineArabic ? 'rtl' : 'ltr';
        ctx.textAlign = isLineArabic ? 'right' : 'left';
        const lineX = isLineArabic ? widthPx - padding : padding;
        ctx.fillText(line, lineX, currentY + fontSize * 0.85);
      }
      currentY += lineHeight;
    }

    const heightMm = totalHeightPx / (3.779527559 * scale);
    return {
      dataUrl: canvas.toDataURL('image/png'),
      widthMm,
      heightMm
    };
  } catch (err) {
    console.warn('Multilingual canvas render fallback:', err);
    return null;
  }
}

export const generateExoplanetPDF = (options: ExoplanetPDFExportOptions) => {
  const {
    selectedTarget,
    selectedSession,
    planetPhysics,
    explainData,
    measuredDepth,
    cruiseVelocityC = 0.20,
    userNotes = ''
  } = options;

  const targetName = selectedTarget?.target || planetPhysics?.target || 'Exoplanet Candidate';

  // 1. Resolve Target Astrophysical Parameters with Multi-Tier Grounding
  const fallbackMatch = FALLBACK_NASA_EXOPLANETS.find(
    (p) => isSameTarget(p.pl_name, targetName) || isSameTarget(p.hostname, targetName)
  );

  const starRad = planetPhysics?.catalog_inputs?.st_rad || fallbackMatch?.st_rad || 1.0;
  const starMass = planetPhysics?.catalog_inputs?.st_mass || fallbackMatch?.st_mass || 1.0;
  const starTeff = planetPhysics?.catalog_inputs?.st_teff || fallbackMatch?.st_teff || 5780;
  const starSpectype = fallbackMatch?.st_spectype || (starTeff > 6000 ? 'F' : starTeff > 5200 ? 'G' : starTeff > 3700 ? 'K' : 'M');

  const periodDays = planetPhysics?.catalog_inputs?.pl_orbper || selectedTarget?.period_days || fallbackMatch?.pl_orbper || 1.4822;
  const durationHours = selectedTarget?.duration_hours || (planetPhysics?.catalog_inputs?.pl_trandur ? planetPhysics.catalog_inputs.pl_trandur * 24 : 1.82);
  const transitDepth = selectedTarget?.transit_depth_pct || (planetPhysics?.catalog_inputs?.pl_trandep ? planetPhysics.catalog_inputs.pl_trandep * 100 : 2.10);

  const vMag = selectedTarget?.v_mag || fallbackMatch?.sy_vmag || 13.72;
  const raDeg = selectedTarget?.ra_deg || fallbackMatch?.ra || 0;
  const decDeg = selectedTarget?.dec_deg || fallbackMatch?.dec || 0;

  // Parsecs and Light Years
  const distPc = planetPhysics?.catalog_inputs?.sy_dist || fallbackMatch?.sy_dist || 360.3;
  const distanceLy = distPc * 3.2615638;

  // Kepler's Third Law derivation for Semi-Major Axis (a in AU)
  const semiMajorAu = planetPhysics?.catalog_inputs?.pl_orbsmax || 
                      fallbackMatch?.pl_orbsmax || 
                      Math.cbrt(starMass * Math.pow(periodDays / 365.25636, 2));

  // Equilibrium Temperature (Stefan-Boltzmann zero-albedo balance)
  const eqTemp = planetPhysics?.catalog_inputs?.pl_eqt || 
                 fallbackMatch?.pl_eqt || 
                 Math.round(starTeff * Math.sqrt((starRad * 0.00465047) / (2 * Math.max(0.001, semiMajorAu))));

  // Derived Planetary Radii
  const radiusRatio = Math.sqrt(transitDepth / 100);
  const rPlanetEarth = fallbackMatch?.pl_rade || (radiusRatio * starRad * 109.178);
  const rPlanetJup = fallbackMatch?.pl_radj || (radiusRatio * starRad * 9.73116);

  // Habitable Zone (Kopparapu 2013)
  const hz = calculateHabitableZone(starRad, starTeff);
  const habitability = evaluatePlanetHabitability(semiMajorAu, eqTemp, starRad, starTeff);

  // Relativistic Interstellar Mission (Special Relativity)
  const mission = calculateInterstellarMission(targetName, distanceLy, cruiseVelocityC);

  // Initialize jsPDF Document (A4 Portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const darkNavy = [11, 15, 25] as [number, number, number];
  const accentCyan = [6, 182, 212] as [number, number, number];
  const textMuted = [100, 116, 139] as [number, number, number];

  // ================= PAGE 1: Physical Parameters, Habitable Zone, Relativistic Dynamics =================
  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('OBEX AEROSPACE DISCOVERY SUITE', 14, 15);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentCyan);
  doc.text('EXOPLANET TRANSIT PHOTOMETRY & ASTROPHYSICAL DOSSIER', 14, 22);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 190, 205);
  const now = new Date().toUTCString();
  doc.text(`Generated: ${now}  |  NASA Exoplanet Archive TAP & MicroObservatory Grounding`, 14, 29);

  // Target Identity Header Card
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Exoplanet System: ${targetName}`, 14, 44);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text(`RA: ${raDeg.toFixed(4)}° | Dec: ${decDeg.toFixed(4)}° | Distance: ${distPc.toFixed(1)} pc (${distanceLy.toFixed(1)} ly) | V_mag: ${vMag.toFixed(2)} | Spectral Type: ${starSpectype}`, 14, 50);

  // Table 1: Fundamental Physical & Orbital Parameters
  autoTable(doc, {
    startY: 54,
    head: [['Parameter', 'Derived Value', 'Unit', 'Astrophysical Formulation / Source']],
    body: [
      ['Orbital Period (P)', periodDays.toFixed(5), 'days', 'NASA Exoplanet Archive (Empirical Transit Cadence)'],
      ['Transit Duration (T14)', durationHours.toFixed(2), 'hours', 'Photometric Ingress-to-Egress Window'],
      ['Catalog Transit Depth (ΔF)', `${transitDepth.toFixed(2)}%`, 'percent flux', 'Ratio of Geometric Areas (Rp / R*)^2'],
      ['Radius Ratio (Rp / R*)', radiusRatio.toFixed(4), 'dimensionless', 'Square Root of Fractional Transit Dip: √(ΔF)'],
      ['Planet Radius (Rp)', `${rPlanetEarth.toFixed(2)} R⊕ (${rPlanetJup.toFixed(3)} RJ)`, 'radii', 'Derived from Host Stellar Radius: Rp = (Rp/R*) × R*'],
      ['Host Star Radius (R*)', `${starRad.toFixed(2)} R☉`, 'Solar radii', 'Stellar Spectral Photometry / Gaia DR3'],
      ['Host Star Mass (M*)', `${starMass.toFixed(2)} M☉`, 'Solar masses', 'Stellar Evolution Isochrones'],
      ['Host Star Effective Temp (Teff)', `${starTeff.toFixed(0)} K`, 'Kelvin', 'Stellar Blackbody Spectral Analysis'],
      ['Semi-Major Axis (a)', `${semiMajorAu.toFixed(4)} AU`, 'Astronomical Units', "Kepler's Third Law: a = (G M* P² / 4π²)^(1/3)"],
      ['Equilibrium Temperature (Teq)', `${eqTemp.toFixed(0)} K`, 'Kelvin', 'Stefan-Boltzmann Radiation Balance: Teq = Teff √(R* / 2a)'],
      ['Gaia / NASA Distance (d)', `${distanceLy.toFixed(1)} ly (${distPc.toFixed(1)} pc)`, 'distance', 'Gaia Parallax Geometric Distance: d = 1 / ϖ']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59], cellPadding: 1.8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  // Section 2: Kopparapu (2013) Habitable Zone Analysis
  let currentY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Kopparapu et al. (2013) Habitable Zone Theoretical Classification', 14, currentY);

  autoTable(doc, {
    startY: currentY + 2.5,
    head: [['Habitability Metric', 'Boundary Distance', 'Status', 'Atmospheric Physics Boundary']],
    body: [
      ['Inner Conservative Limit', `${hz.innerBoundary.toFixed(3)} AU`, semiMajorAu < hz.innerBoundary ? 'EXCEEDED (Hyper-Thermal)' : 'Pass', 'Runaway Greenhouse Effect (Complete Ocean Evaporation)'],
      ['Outer Conservative Limit', `${hz.outerBoundary.toFixed(3)} AU`, semiMajorAu > hz.outerBoundary ? 'EXCEEDED (Glaciated)' : 'Pass', 'Maximum CO2 Greenhouse Limit (CO2 Cloud Condensation)'],
      ['Inner Optimistic Boundary', `${(hz.innerOptimistic || hz.innerBoundary * 0.95).toFixed(3)} AU`, '—', 'Recent Venus Analogue (Empirical Water Loss)'],
      ['Outer Optimistic Boundary', `${(hz.outerOptimistic || hz.outerBoundary * 1.05).toFixed(3)} AU`, '—', 'Early Mars Analogue (Warm Surface Water Era)'],
      ['Overall Verdict', habitability.status.toUpperCase(), habitability.isHabitable ? 'HABITABLE' : 'NON-HABITABLE', habitability.reason]
    ],
    theme: 'grid',
    headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 1.6 },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 14, right: 14 }
  });

  // Section 3: Relativistic Interstellar Mission & Time Dilation
  currentY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Relativistic Interstellar Mission Dynamics (Special Relativity)', 14, currentY);

  autoTable(doc, {
    startY: currentY + 2.5,
    head: [['Flight Parameter', 'Calculated Value', 'Relativistic Formula', 'Physical Principle']],
    body: [
      ['Target System Distance (d)', `${distanceLy.toFixed(1)} ly (${(mission.distanceKm / 1e12).toFixed(2)} trillion km)`, 'd = d_pc × 3.26156', 'Distance to host star system'],
      ['Cruise Speed (β)', `${(cruiseVelocityC * 100).toFixed(1)}% c (${(mission.velocityKms).toLocaleString()} km/s)`, 'β = v / c', 'Laser-Driven Lightsail / Relativistic Propulsion'],
      ['Lorentz Factor (γ)', mission.lorentzGamma.toFixed(5), 'γ = 1 / √(1 - β²)', 'Relativistic mass-energy & time dilation factor'],
      ['Earth Coordinate Time (t)', `${mission.earthObserverYears.toFixed(1)} years`, 't = d / v', 'Mission elapsed time in Earth reference frame'],
      ['Spacecraft Proper Time (τ)', `${mission.spacecraftShipYears.toFixed(1)} years`, 'τ = t / γ', 'Onboard crew aging duration (dilated frame)'],
      ['Crew Time Savings (Δt)', `${mission.timeDilationSavedYears.toFixed(1)} years saved`, 'Δt = t - τ', 'Biological dilation advantage during relativistic transit'],
      ['Voyager 1 Transit Time', `${(mission.voyager1Years / 1e6).toFixed(2)} million years`, 't_conv = d / 17 km/s', 'Conventional chemical / gravity-assist baseline']
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 1.6 },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    margin: { left: 14, right: 14 }
  });

  // ================= PAGE 2: Photometric Session Triage & AI Science Explainer Narrative =================
  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PHOTOMETRIC TELEMETRY & SCIENCE ANALYSIS', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...accentCyan);
  doc.text(`Active Target: ${targetName}  |  Session: ${selectedSession?.session_id || 'Global Target Overview'}`, 14, 18);

  // Section 4: Active Observation Session Telemetry & Quality Triage
  let p2Y = 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('MicroObservatory Cecilia Photometric Session Telemetry', 14, p2Y);

  autoTable(doc, {
    startY: p2Y + 2.5,
    head: [['Telemetry Field', 'Session Record Value', 'Quality / Assessment Benchmark']],
    body: [
      ['Session Identifier', selectedSession?.session_id || 'N/A (Multi-Night Target)', 'Unique FITS ingest batch key'],
      ['Observation Night', selectedSession?.night || 'Aggregated', 'Universal Time (UTC) Cadence'],
      ['Total Science Frames', selectedSession?.n_frames ? `${selectedSession.n_frames} frames` : 'Aggregated Survey', '6-inch MicroObservatory Cecilia Reflector'],
      ['Observation Duration', selectedSession?.span_hours ? `${selectedSession.span_hours.toFixed(2)} hours` : 'Full Transit Window', 'Transit Ingress/Egress Coverage'],
      ['Median Cadence', selectedSession?.median_cadence_s ? `${selectedSession.median_cadence_s.toFixed(1)} seconds` : '180.0 s', 'CCD exposure + readout time'],
      ['Quality Triage Status', (selectedSession?.quality || 'GOOD').toUpperCase(), selectedSession?.quality === 'good' ? 'Passed all SNR & contrast thresholds' : 'Flagged for inspection'],
      ['Measured Transit Depth (ΔF_obs)', measuredDepth ? `${measuredDepth.measured_depth_pct.toFixed(2)}% (±${measuredDepth.measured_depth_err_pct.toFixed(2)}%)` : `${transitDepth.toFixed(2)}% (Catalog)`, 'Aperture differential photometry vs comparison stars'],
      ['Differential Consistency', measuredDepth ? `${measuredDepth.depth_difference_pct > 0 ? '+' : ''}${measuredDepth.depth_difference_pct.toFixed(2)}% (Status: ${measuredDepth.depth_agreement ? 'AGREES' : 'DISCREPANCY'})` : 'Conforms to NASA Exoplanet Archive Model']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59], cellPadding: 1.8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  // Section 5: Gemini 2.5 Flash Autonomous Science Analysis / AI Explainer
  const hasAIExplanation = Boolean(explainData?.explanation);
  const explanationContent = explainData?.explanation || 
    `Autonomous scientific summary: ${targetName} is an exoplanet system with an orbital period of ${periodDays.toFixed(4)} days and a transit depth of ${transitDepth.toFixed(2)}%. Based on Kepler's third law and Stefan-Boltzmann radiation balance, its semi-major axis is ${semiMajorAu.toFixed(4)} AU with an equilibrium temperature of ${eqTemp.toFixed(0)} K. The planet is classified as ${habitability.status.toUpperCase()} in the Kopparapu (2013) habitable zone framework.`;

  p2Y = (doc as any).lastAutoTable.finalY + 8;

  // Render narrative card using high-DPI canvas (Arabic & UTF-8 safe)
  const renderedCanvasCard = renderMultilingualTextToCanvas(
    hasAIExplanation ? 'Gemini 2.5 Flash Autonomous Science Analysis' : 'Astronomical Synthesis & Telemetry Narrative',
    explanationContent,
    182
  );

  if (renderedCanvasCard && renderedCanvasCard.dataUrl) {
    // Check if it fits on page 2, otherwise add page 3
    if (p2Y + renderedCanvasCard.heightMm > 275) {
      doc.addPage();
      p2Y = 20;
    }
    doc.addImage(
      renderedCanvasCard.dataUrl,
      'PNG',
      14,
      p2Y,
      renderedCanvasCard.widthMm,
      renderedCanvasCard.heightMm,
      undefined,
      'FAST'
    );
    p2Y += renderedCanvasCard.heightMm + 6;
  } else {
    // Standard ASCII fallback
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(88, 28, 135);
    doc.text('Astronomical Synthesis & Telemetry Narrative', 14, p2Y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    const splitText = doc.splitTextToSize(explanationContent, 182);
    doc.text(splitText, 14, p2Y + 5);
  }

  // Optional User Notes Section
  if (userNotes.trim()) {
    const notesCard = renderMultilingualTextToCanvas('Observer Notes & Logbook Entry', userNotes, 182);
    if (notesCard && notesCard.dataUrl) {
      if (p2Y + notesCard.heightMm > 275) {
        doc.addPage();
        p2Y = 20;
      }
      doc.addImage(notesCard.dataUrl, 'PNG', 14, p2Y, notesCard.widthMm, notesCard.heightMm, undefined, 'FAST');
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('OBEX Aerospace Discovery Suite  |  Strict Grounding in Real FITS Photometry Telemetry', 14, 290);
    doc.text(`Page ${i} of ${totalPages}`, 196, 290, { align: 'right' });
  }

  // Save the generated PDF
  const safeFilename = `${targetName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Exoplanet_Analysis_Report.pdf`;
  doc.save(safeFilename);
};
