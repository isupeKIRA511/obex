# 🪐 OBEX — Aerospace Exoplanet Discovery & Analysis Suite

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OBEX (Aerospace Exoplanet Discovery Suite)** is a research-grade, high-precision astronomical computing platform designed for exoplanetary transit detection, differential light curve analysis, CCD thermal calibration, diagnostic false-positive triage, theoretical astrophysics validation, and relativistic mission mechanics.

---

## 🌟 Key Highlights & Innovations

1. **🔬 Real Telescope Telemetry Grounding:**
   Directly ingests and processes calibrated FITS science and dark frames from the Harvard-Smithsonian MicroObservatory Cecilia 6-inch reflector telescope.
2. **🛰️ NASA Exoplanet Archive Synchronization:**
   Live Table Access Protocol (TAP) integration querying official Caltech/IPAC parameters for confirmed exoplanet candidates and benchmark targets.
3. **🤖 Autonomous Gemini 2.5 Flash Explainer:**
   Telemetry-grounded multimodal AI reasoning engine generating instant, bilingual (Arabic & English) scientific narratives customized for students, astrophysicists, and public observers.
4. **🚀 Relativistic Interstellar Mission Calculator:**
   Special Relativity mission dynamics calculating Lorentz factor ($\gamma$), coordinate Earth time ($t$), and crew proper time ($\tau$) with biological time dilation savings ($\Delta t = t - \tau$).
5. **📄 Dynamic Planetary PDF Dossier Generator:**
   Browser-side, high-resolution multi-page PDF generation engine with High-DPI canvas text rasterization for Arabic and Latin typography.

---

## 🔭 Platform Architecture & Exploration Modules

| Module | Route Hash | Core Functionality |
|---|---|---|
| **Mission Control** | `#bento` | Executive Bento Hero dashboard, live KPI telemetry, and target system selector. |
| **Transit Photometry Lab** | `#transit` | Interactive normalized flux light curves, BJD_TDB timing, multi-night phase folding, and Gemini AI inference. |
| **FITS & Sensor Catalog** | `#fits` | CCD frame browser, thermal dark master arrays with Arrhenius scaling, and hot-pixel spatial masking. |
| **Astrophysics Validation** | `#physics` | 48 automated equation checks benchmarked against NASA parameters ($|z| \le 2$ statistical agreement). |
| **Quality & Triage Hub** | `#quality` | Triaging 22 observing sessions, 2,723 star-night statistical search control, and correlation matrices. |
| **Diagnostic Matrix** | `#diagnostic` | 11-point false-positive screening matrix and interactive 32×32 pixel cutout CNN classifier (94.2% accuracy). |
| **NASA Exoplanet Hub** | `#exoplanethub` | TAP query explorer, Kopparapu (2013) Habitable Zone modeling, and relativistic travel simulation. |

---

## 🛠️ Frontend Technologies & Architecture

* **Core Framework:** `React 18.3` (Hooks, Context, Functional Components, Error Boundaries).
* **Language:** `TypeScript 5.5` with strict typing for physical parameters, celestial coordinates, and photometric datasets.
* **Build System & Bundler:** `Vite 6` with optimized ES module bundling and fast Hot Module Replacement (HMR).
* **Styling & Theme:** `Tailwind CSS` customized with an aerospace dark palette, unified `rounded-xl` borders, and telemetry color tokens (`opticsCyan`, `aerospaceBlue`, `telemetryGreen`, `calibAmber`, `alertRose`).
* **Icons:** `Lucide React` for consistent vector iconography.
* **Document Engine:** `jspdf` & `jspdf-autotable` with high-DPI HTML5 canvas text shaping for Arabic / English bilingual report generation.
* **Vector Graphics:** Native responsive SVG chart engines for differential light curve plotting and phase binning.

---

## 🚀 Getting Started & Local Development

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** or **yarn**

### 1. Clone the repository
```bash
git clone https://github.com/isupeKIRA511/obex.git
cd obex
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the platform.

### 4. Build for production
```bash
npm run build
```
Generates optimized, minified production assets in the `dist/` directory.

---

## 🪐 Standard Benchmark Targets

The platform includes verified empirical data and benchmark profiles for key transiting exoplanets:
* **TrES-5 b:** Hot Jupiter orbiting a G-type star ($V = 13.72$, $P = 1.4822\,\text{d}$, depth $\approx 2.10\%$, $d = 1,175.1\,\text{ly}$).
* **TrES-1 b:** Classic transit benchmark ($V = 11.79$, $P = 3.0300\,\text{d}$, depth $\approx 2.20\%$).
* **TrES-3 b:** Extremely short-period gas giant ($V = 12.40$, $P = 1.3061\,\text{d}$, depth $\approx 2.90\%$).
* **WASP-10 b & WASP-2 b:** High-precision SuperWASP photometric standard targets.
* **Qatar-1 b & CoRoT-2 b:** Deep geometric ingress/egress profiles.
* **TOI-700 d, TOI-715 b, LHS 1140 b:** Verified Habitable Zone terrestrial candidates.

---

## 📄 Documentation & Project Report

For a complete in-depth scientific and architectural report in both **Arabic** and **English**, please refer to:
* [PROJECT_REPORT.md](PROJECT_REPORT.md)

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
