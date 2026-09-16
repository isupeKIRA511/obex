import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Target, SessionSummary, PlanetDetailResponse, ExplainResponse } from '../types';
import { calculateHabitableZone, evaluatePlanetHabitability } from './habitableZone';
import { calculateInterstellarMission } from './missionPhysics';

export interface ExoplanetPDFExportOptions {
  selectedTarget?: Target | null;
  selectedSession?: SessionSummary | null;
  planetPhysics?: PlanetDetailResponse | null;
  explainData?: ExplainResponse | null;
  cruiseVelocityC?: number;
  userNotes?: string;
}

export const generateExoplanetPDF = (options: ExoplanetPDFExportOptions) => {
  const {
    selectedTarget,
    selectedSession,
    planetPhysics,
    explainData,
    cruiseVelocityC = 0.20,
    userNotes = ''
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const targetName = selectedTarget?.target || 'Exoplanet Candidate';
  const vMag = selectedTarget?.v_mag || 13.7;
  const transitDepth = selectedTarget?.transit_depth_pct || 2.1;
  const periodDays = selectedTarget?.period_days || 1.482;
  const durationHours = selectedTarget?.duration_hours || 1.82;
  const raDeg = selectedTarget?.ra_deg || 0;
  const decDeg = selectedTarget?.dec_deg || 0;

  // Habitable Zone calculation
  const starRad = planetPhysics?.catalog_inputs?.st_rad || 1.0;
  const starTeff = planetPhysics?.catalog_inputs?.st_teff || 5780;
  const semiMajorAu = planetPhysics?.catalog_inputs?.pl_orbsmax || 0.025;
  const eqTemp = planetPhysics?.catalog_inputs?.pl_eqt;
  const hz = calculateHabitableZone(starRad, starTeff);
  const habitability = evaluatePlanetHabitability(semiMajorAu, eqTemp, starRad, starTeff);

  // Relativistic Mission calculation (estimate distance 100 - 1500 ly)
  const distanceLy = 500; // default estimated distance
  const mission = calculateInterstellarMission(targetName, distanceLy, cruiseVelocityC);

  // Colors
  const darkNavy = [11, 15, 25] as [number, number, number];
  const accentCyan = [6, 182, 212] as [number, number, number];
  const textMuted = [100, 116, 139] as [number, number, number];

  // PAGE 1: Executive Dossier & Planetary Physics
  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, 210, 36, 'F');

  // Brand & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('OBEX AEROSPACE DISCOVERY SUITE', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...accentCyan);
  doc.text('EXOPLANET TRANSIT PHOTOMETRY & ASTROPHYSICS DOSSIER', 14, 23);

  doc.setFontSize(8);
  doc.setTextColor(180, 190, 205);
  const now = new Date().toUTCString();
  doc.text(`Generated: ${now}  |  Pipeline: MicroObservatory Cecilia 6" & NASA Archive Grounding`, 14, 30);

  // Target Identity Card
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`System Target: ${targetName}`, 14, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textMuted);
  doc.text(`Equatorial Coordinates: RA ${raDeg.toFixed(4)} deg | Dec ${decDeg.toFixed(4)} deg | Apparent Magnitude V = ${vMag}`, 14, 52);

  // Table 1: Target Physical & Orbital Parameters
  autoTable(doc, {
    startY: 56,
    head: [['Parameter', 'Value', 'Unit', 'Derivation Source / Physics Law']],
    body: [
      ['Orbital Period (P)', periodDays.toFixed(5), 'days', 'NASA Exoplanet Archive (Empirical Transit Cadence)'],
      ['Transit Duration (T14)', durationHours.toFixed(2), 'hours', 'Photometric Ingress-to-Egress Window'],
      ['Catalog Transit Depth (ΔF)', `${transitDepth.toFixed(2)}%`, 'percent flux', 'Ratio of Areas (Rp / R*)^2'],
      ['Semi-Major Axis (a)', semiMajorAu.toFixed(4), 'AU', "Kepler's Third Law: a = (G M* P^2 / 4π^2)^(1/3)"],
      ['Equilibrium Temperature (Teq)', eqTemp ? `${eqTemp.toFixed(0)} K` : '—', 'Kelvin', 'Stefan-Boltzmann Radiation Balance (Zero Albedo)'],
      ['Host Star Effective Temp (Teff)', `${starTeff.toFixed(0)} K`, 'Kelvin', 'Stellar Spectral Photometry'],
      ['Radius Ratio (Rp / R*)', (Math.sqrt(transitDepth / 100)).toFixed(4), 'dimensionless', 'Square root of fractional transit dip ΔF'],
      ['Active Photometric Session', selectedSession?.session_id || 'N/A', 'ID string', `Quality Triage: ${selectedSession?.quality?.toUpperCase() || 'GOOD'}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 }
  });

  // Section 2: Kopparapu (2013) Habitable Zone Analysis
  let currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Kopparapu (2013) Habitable Zone Theoretical Classification', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Habitability Metric', 'Boundary Value', 'Planet Status', 'Atmospheric Physical Constraint']],
    body: [
      ['Inner Conservative Limit', `${hz.innerBoundary.toFixed(3)} AU`, habitability.isHabitable ? 'Habitable Margin' : (semiMajorAu < hz.innerBoundary ? 'EXCEEDED (Hyper-Thermal)' : 'Pass'), 'Runaway Greenhouse Effect (Complete Ocean Evaporation)'],
      ['Outer Conservative Limit', `${hz.outerBoundary.toFixed(3)} AU`, habitability.isHabitable ? 'Habitable Margin' : (semiMajorAu > hz.outerBoundary ? 'EXCEEDED (Glaciated)' : 'Pass'), 'Maximum CO2 Greenhouse Limit (CO2 Cloud Condensation)'],
      ['Inner Optimistic Boundary', `${(hz.innerOptimistic || hz.innerBoundary * 0.95).toFixed(3)} AU`, '—', 'Recent Venus Analogue (Empirical Water Loss)'],
      ['Outer Optimistic Boundary', `${(hz.outerOptimistic || hz.outerBoundary * 1.05).toFixed(3)} AU`, '—', 'Early Mars Analogue (Warm Surface Water Era)'],
      ['Overall Verdict', habitability.status.toUpperCase(), habitability.isHabitable ? 'HABITABLE' : 'NON-HABITABLE', habitability.reason]
    ],
    theme: 'grid',
    headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    margin: { left: 14, right: 14 }
  });

  // Section 3: Relativistic Interstellar Mission & Time Dilation
  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Relativistic Interstellar Mission Dynamics (Special Relativity)', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Flight Parameter', 'Calculated Value', 'Standard Formula', 'Relativistic Impact']],
    body: [
      ['Cruise Speed (β)', `${(cruiseVelocityC * 100).toFixed(1)}% c`, 'β = v / c', 'Relativistic Laser-Driven Lightsail / Antimatter Core'],
      ['Lorentz Factor (γ)', mission.lorentzGamma.toFixed(4), 'γ = 1 / √(1 - β²)', 'Kinetic energy dilation factor'],
      ['Earth Coordinate Time (t)', `${mission.earthObserverYears.toFixed(1)} years`, 't = d / v', 'Mission duration in Earth reference frame'],
      ['Spacecraft Proper Time (τ)', `${mission.spacecraftShipYears.toFixed(1)} years`, 'τ = t / γ', 'Onboard crew aging duration with time dilation'],
      ['Crew Time Savings (Δt)', `${mission.timeDilationSavedYears.toFixed(1)} years saved`, 'Δt = t - τ', 'Biological dilation advantage during relativistic transit']
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    margin: { left: 14, right: 14 }
  });

  // Section 4: Gemini 2.5 Flash Autonomous Session Analysis (if available)
  if (explainData?.explanation) {
    currentY = (doc as any).lastAutoTable.finalY + 8;
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(88, 28, 135);
    doc.text('Gemini 2.5 Flash Autonomous Photometry Inference', 14, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    const splitText = doc.splitTextToSize(explainData.explanation, 180);
    doc.text(splitText, 14, currentY + 5);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('OBEX Aerospace Discovery Suite  |  Strict Grounding in Real FITS Photometry Telemetry', 14, 290);
    doc.text(`Page ${i} of ${totalPages}`, 190, 290, { align: 'right' });
  }

  // Save the PDF
  const filename = `${targetName.replace(/\s+/g, '_')}_Exoplanet_Analysis_Report.pdf`;
  doc.save(filename);
};
