# OBEX — Exoplanet Transit Analysis & Observational Astrophysics Platform

OBEX is a modern, high-precision astronomical computing platform designed for exoplanetary transit detection, differential light curve analysis, CCD calibration, false-positive triage, and astrophysics validation.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**, the interface provides research-grade interactive data visualization, telemetry monitoring, and rigorous scientific workflow automation for ground-based astronomical observations.

---

## 🔭 Core Platform Modules & Features

### 1. Executive Telemetry & Mission Control
The platform features an executive KPI telemetry hub that continuously tracks and evaluates observational precision and physical consistency across all monitored targets:
* **Differential Photometry Gain**: Real-time measurement of signal-to-noise ratio (SNR) improvements achieved via ensemble comparison star normalization (typically >2.5× improvement).
* **Physics Agreement Index**: Quantitative assessment of empirical transit parameters against fundamental astrophysical equations (percentage of checks conforming within $|z| \le 2$).
* **Planetary Orbital Metrics**: Instant telemetry for orbital velocities, equilibrium temperatures, host star distances, and orbital periods.

---

### 2. High-Precision Transit Photometry Lab (`TransitLab`)
The Transit Analysis Lab delivers deep photometric analysis for target stars undergoing planetary transits:
* **Interactive Light Curve Visualizer**:
  * Precision plotting of normalized relative flux against Barycentric Julian Date in the Barycentric Dynamical Time standard ($\text{BJD}_{\text{TDB}}$).
  * Interactive data inspection tooltip displaying point-by-point normalized flux, raw target counts, comparison star sum, sky background level, and instantaneous airmass.
  * Shaded transit window overlay highlighting predicted Ingress, Mid-Transit, and Egress epochs.
* **Differential vs. Raw Flux Comparison**:
  * Toggle between uncorrected single-aperture target flux and ensemble-normalized differential light curves to demonstrate atmospheric extinction removal.
  * Real-time calculation of out-of-transit RMS scatter in parts-per-thousand (ppt) and improvement factors.
* **Phase Folding Engine**:
  * Multi-epoch phase folding algorithms that fold observations across known planetary periods $P$.
  * Binned phase curve rendering with standard error bars ($\pm 1\sigma$) centered on transit mid-point ($\phi = 0$).
* **Empirical Parameter Extraction & Benchmarks**:
  * Transit depth ($\delta\%$), transit duration ($T_{\text{dur}}$), and statistical detection significance ($\sigma$).
  * Side-by-side benchmarking against established catalog parameters for standard targets (e.g., TrES-5, TrES-1, TrES-3, WASP-10, WASP-2, Qatar-1, CoRoT-2, HAT-P-10).

---

### 3. FITS Astro-Imaging & Thermal Calibration Explorer (`FITSExplorer`)
A dedicated module for analyzing raw astronomical CCD detector frames and standard reduction pipelines:
* **CCD Frame Sequence Inspector**:
  * Multi-frame sequence browser with search and filtering by timestamp and frame index.
  * Real-time playback of time-series exposures capturing stellar fields.
* **Calibration Pipeline (Dark & Defect Subtraction)**:
  * Inspection of Raw Science Frames, Master Dark frames, and Calibrated reduced frames.
  * Bad and hot pixel identification with spatial defect masking.
* **Photometric Aperture Field Mapping**:
  * Interactive CCD Field-of-View (FOV) overlay highlighting target aperture alongside multiple selected reference/comparison stars.
* **FITS Header & Telemetry Inspection**:
  * Real-time header metadata display: Airmass ($X$), Telescope Altitude ($\text{TELALT}$), Sky Background Median & Sigma, Camera Sensor Temperature ($\text{CAMTEMP}$), Peak Contrast, and Saturated Pixel tally.

---

### 4. Diagnostic False-Positive Elimination Matrix (`FalsePositiveCases`)
A systematic 11-point diagnostic screening matrix to rule out astronomical and instrumental false positives mimicking exoplanetary transits:
1. **Eclipsing Binaries (EB)**: Detection of secondary eclipses and deep V-shaped geometric profiles.
2. **Background Blended Eclipsing Binaries (BEB)**: Identifying flux dilution from unresolved background sources.
3. **Grazing Eclipses**: Analysis of high-impact parameter grazing scenarios causing rounded dips.
4. **Stellar Spots & Rotational Variability**: Distinguishing quasi-periodic magnetic activity from transit ingress/egress.
5. **Airmass Extinction Correlation**: Correlation checks between flux drop and rising atmospheric airmass.
6. **Cloud & Atmospheric Transparency Fluctuations**: Cross-checking reference stars to isolate atmospheric attenuation.
7. **Mount Tracking Drift & Vignetting Jumps**: Monitoring centroid motion on detector boundaries.
8. **Thermal Hot Pixels**: Tracking static detector artifacts versus sidereal drifting targets.
9. **High-Energy Cosmic Ray Strikes**: Flagging single-frame high-intensity pixel spikes.
10. **Satellite & Debris Trails**: Identifying linear brightness streaks crossing photometric apertures.
11. **Twilight & Lunar Sky Background Gradients**: Correcting spatial sky gradient biases.

* **Interactive Source Cutout Classifier**:
  * Machine learning cutout classifier simulator providing instant classification (Star, Hot Pixel, Cosmic Ray, Satellite Trail) with confidence scoring and physical rationale.

---

### 5. Theoretical Astrophysics & Validation Hub (`AstrophysicsValidation`)
Automated validation of observational results against established astrophysical laws:
* **Cross-Validation Matrix**:
  * Statistical consistency checks measuring $z$-scores between measured transit parameters and theoretical models ($|z| \le 2$ considered fully consistent).
* **Mathematical Formulations & Equations**:
  * **Transit Depth & Radius Ratio**: $\delta = \left(\frac{R_p}{R_*}\right)^2$
  * **Kepler’s Third Law (Semi-Major Axis)**: $a = \left[\frac{G (M_* + M_p) P^2}{4\pi^2}\right]^{1/3}$
  * **Planetary Equilibrium Temperature**: $T_{\text{eq}} = T_{\text{eff}} \left(\frac{R_*}{2a}\right)^{1/2} (1 - A_B)^{1/4}$
  * **Stellar Mean Density from Transit Light Curves**: $\rho_* = \left(\frac{3\pi}{G P^2}\right) \left(\frac{a}{R_*}\right)^3$
  * **Transit Duration & Geometric Impact Parameter**: $b = \left(\frac{a}{R_*}\right) \cos(i)$, $\; T_{\text{dur}} = \frac{P}{\pi} \arcsin\left(\frac{R_*}{a} \sqrt{(1 + k)^2 - b^2}\right)$
  * **Habitable Zone Limits**: Inner runaway greenhouse and outer maximum greenhouse radiation boundaries.
  * **Roche Lobe Radius**: Eggleton gravitational tidal boundary calculation.
* **Exoplanetary Physical Catalog**:
  * Detailed physical parameters for confirmed targets: planetary mass, radius, surface gravity ($\log g$), host star effective temperature, and spectral classification.

---

### 6. Observational Quality Triage Hub (`QualityTriageHub`)
An auditing dashboard for observational datasets and environmental control samples:
* **Session Classification**:
  * Categorization of continuous observing sessions into **Good** (clean photometric transit), **Marginal** (partial phase or higher scatter), and **Unusable / Control Samples** (weather disruption or tracking failure).
* **Photometric Noise Floor & Sensitivity Limits**:
  * Scatter diagnostics analyzing atmospheric seeing (FWHM), airmass correlation, and comparison star variance.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technologies |
|---|---|
| **Core Framework** | React 18 (Hooks, Context, Functional Architecture) |
| **Language** | TypeScript (Strict Typing for Astro Data Models) |
| **Styling & Design System** | Tailwind CSS (Dark Astronomy Canvas Palette, Custom Badges, Glassmorphism) |
| **Icons** | Lucide React |
| **Build & Bundling** | Vite 6 (Lightning-fast HMR and optimized ES modules) |
| **State Management** | React State & Hash-based Routing (`#bento`, `#transit`, `#fits`, `#diagnostic`, `#physics`, `#quality`) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/isupeKIRA511/obex.git
   cd obex
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   # or
   yarn build
   ```

---

## 📊 Dataset & Targets

The application is pre-configured with observation profiles and calibration sessions for renowned exoplanetary systems, including:
* **TrES-5**: Hot Jupiter around a G-type star ($V = 13.72$, $P = 1.482\,\text{d}$, depth $\approx 2.1\%$).
* **TrES-1**: Classic benchmark transiting exoplanet ($V = 11.79$, $P = 3.030\,\text{d}$).
* **TrES-3**: Short-period hot Jupiter ($V = 12.40$, $P = 1.306\,\text{d}$).
* **WASP-10**: High-precision transit target ($V = 12.70$, $P = 3.093\,\text{d}$).
* **WASP-2, Qatar-1, CoRoT-2, HAT-P-10**: Precision photometric standards.

---

## 📄 License
This project is open-source under the MIT License.
