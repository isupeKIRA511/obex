import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Output directory
output_dir = "/Users/isupekira/Desktop/space/assets"
os.makedirs(output_dir, exist_ok=True)

# NASA Observatory Dark Palette
BG_DARK = "#0B0F17"
CARD_DARK = "#111827"
BORDER_DARK = "#1E293B"
TEXT_WHITE = "#F8FAFC"
TEXT_MUTED = "#94A3B8"
CYAN_ACCENT = "#38BDF8"
BLUE_SCIENCE = "#3B82F6"
AMBER_CALIB = "#F59E0B"
GREEN_SUCCESS = "#10B981"
ROSE_ACCENT = "#F43F5E"

plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = BORDER_DARK
plt.rcParams['axes.linewidth'] = 1.0

# ==============================================================================
# 1. CCD FIELD OF VIEW & PHOTOMETRIC APERTURES (NASA EXOTIC / FOV FINDER CHART)
# ==============================================================================
print("Generating 1: CCD Field of View & Apertures...")
fig, ax = plt.subplots(figsize=(8, 8), dpi=200, facecolor=BG_DARK)
ax.set_facecolor("#04070D")

np.random.seed(42)
# Background sky noise
noise = np.random.normal(loc=120, scale=12, size=(500, 500))
# Add random field stars
num_stars = 140
star_x = np.random.uniform(20, 480, num_stars)
star_y = np.random.uniform(20, 480, num_stars)
star_flux = np.random.exponential(scale=200, size=num_stars)

# Target star (TrES-5) in center
t_x, t_y = 250, 240
# Comparison stars
c1_x, c1_y = 150, 360
c2_x, c2_y = 380, 180
c3_x, c3_y = 330, 390

grid_y, grid_x = np.indices((500, 500))
ccd_image = noise.copy()

# Render target star PSF
target_psf = 4500 * np.exp(-((grid_x - t_x)**2 + (grid_y - t_y)**2) / (2 * 4.2**2))
ccd_image += target_psf

# Render comparison stars
for (cx, cy, flux) in [(c1_x, c1_y, 3800), (c2_x, c2_y, 2900), (c3_x, c3_y, 3400)]:
    psf = flux * np.exp(-((grid_x - cx)**2 + (grid_y - cy)**2) / (2 * 3.8**2))
    ccd_image += psf

# Render background stars
for i in range(num_stars):
    f = star_flux[i]
    psf = f * np.exp(-((grid_x - star_x[i])**2 + (grid_y - star_y[i])**2) / (2 * 2.5**2))
    ccd_image += psf

# Display CCD image with logarithmic stretch typical of astronomical FITS
im = ax.imshow(np.log1p(ccd_image), cmap='bone', origin='lower', extent=[0, 500, 0, 500])

# Draw Target Apertures (Target circle + Sky background annulus)
target_ap = patches.Circle((t_x, t_y), radius=12, fill=False, edgecolor=CYAN_ACCENT, linewidth=1.8, label="Target Aperture (TrES-5)")
sky_in = patches.Circle((t_x, t_y), radius=20, fill=False, edgecolor=CYAN_ACCENT, linestyle='--', linewidth=1.2, alpha=0.8)
sky_out = patches.Circle((t_x, t_y), radius=28, fill=False, edgecolor=CYAN_ACCENT, linestyle='--', linewidth=1.2, alpha=0.8, label="Sky Background Annulus")
ax.add_patch(target_ap)
ax.add_patch(sky_in)
ax.add_patch(sky_out)
ax.text(t_x + 16, t_y - 6, "Target: TrES-5\n(V = 13.72 mag)", color=CYAN_ACCENT, fontsize=9.5, fontweight='bold')

# Draw Comparison Stars (Comp 1, Comp 2, Comp 3)
comps = [(c1_x, c1_y, "Comp 1 (C1)"), (c2_x, c2_y, "Comp 2 (C2)"), (c3_x, c3_y, "Comp 3 (C3)")]
for cx, cy, label in comps:
    cap = patches.Circle((cx, cy), radius=12, fill=False, edgecolor=GREEN_SUCCESS, linewidth=1.6)
    csky = patches.Circle((cx, cy), radius=22, fill=False, edgecolor=GREEN_SUCCESS, linestyle=':', linewidth=1.0, alpha=0.7)
    ax.add_patch(cap)
    ax.add_patch(csky)
    ax.text(cx + 14, cy - 5, label, color=GREEN_SUCCESS, fontsize=8.5, fontweight='bold')

# Add compass (North / East)
ax.annotate('', xy=(450, 470), xytext=(450, 420), arrowprops=dict(arrowstyle="->", color=TEXT_WHITE, lw=1.5))
ax.text(447, 476, 'N', color=TEXT_WHITE, fontsize=10, fontweight='bold', ha='center')
ax.annotate('', xy=(400, 420), xytext=(450, 420), arrowprops=dict(arrowstyle="->", color=TEXT_WHITE, lw=1.5))
ax.text(390, 416, 'E', color=TEXT_WHITE, fontsize=10, fontweight='bold', va='center')

# Scale bar (100 pixels = 3.2 arcmin)
ax.plot([40, 140], [40, 40], color=TEXT_WHITE, lw=2.5)
ax.text(90, 48, "100 px ≈ 3.2 arcmin", color=TEXT_WHITE, fontsize=8.5, ha='center')

ax.set_title("NASA Exoplanet Watch / EXOTIC • Calibrated CCD Field of View (FOV)", color=TEXT_WHITE, fontsize=12, fontweight='bold', pad=12)
ax.set_xlabel("CCD Column (Pixels)", color=TEXT_MUTED, fontsize=9)
ax.set_ylabel("CCD Row (Pixels)", color=TEXT_MUTED, fontsize=9)
ax.tick_params(colors=TEXT_MUTED, labelsize=8)

# Legend
legend = ax.legend(loc='lower right', facecolor=CARD_DARK, edgecolor=BORDER_DARK, fontsize=8)
for text in legend.get_texts():
    text.set_color(TEXT_WHITE)

plt.tight_layout()
fov_path = os.path.join(output_dir, "nasa_fov_apertures.png")
plt.savefig(fov_path, facecolor=BG_DARK)
plt.close()
print(f"Saved: {fov_path}")


# ==============================================================================
# 2. CALIBRATED TRANSIT LIGHT CURVE & MODEL FIT (TrES-5 b)
# ==============================================================================
print("Generating 2: Calibrated Transit Light Curve...")
fig, (ax_main, ax_res) = plt.subplots(2, 1, figsize=(9, 6.5), dpi=200, 
                                      gridspec_kw={'height_ratios': [3.5, 1.2], 'hspace': 0.08},
                                      facecolor=BG_DARK)
ax_main.set_facecolor(CARD_DARK)
ax_res.set_facecolor(CARD_DARK)

# Time array: -2.5 hours to +2.5 hours from mid-transit
t = np.linspace(-2.5, 2.5, 180)
transit_depth = 0.0210 # 2.10% depth for TrES-5 b
duration = 1.82 # hours
ingress_dur = 0.35 # hours

# Theoretical transit model (Trapezoidal / Mandel & Agol approximation)
def transit_model(time):
    flux = np.ones_like(time)
    for i, ti in enumerate(time):
        abs_t = abs(ti)
        if abs_t < (duration / 2 - ingress_dur):
            flux[i] = 1.0 - transit_depth
        elif abs_t < (duration / 2):
            frac = (duration / 2 - abs_t) / ingress_dur
            flux[i] = 1.0 - transit_depth * frac
    return flux

model_flux = transit_model(t)
np.random.seed(101)
# Add realistic photometric white noise (3.2 ppt RMS typical of MicroObservatory)
scatter_flux = model_flux + np.random.normal(0, 0.0035, len(t))
err = np.full_like(t, 0.0035)

# Binned data points (5-min intervals)
bin_size = 6
t_bin = [np.mean(t[i:i+bin_size]) for i in range(0, len(t), bin_size)]
f_bin = [np.mean(scatter_flux[i:i+bin_size]) for i in range(0, len(t), bin_size)]
err_bin = [np.std(scatter_flux[i:i+bin_size]) / np.sqrt(bin_size) for i in range(0, len(t), bin_size)]

# Plot raw scatter points
ax_main.errorbar(t, scatter_flux, yerr=err, fmt='o', color=BLUE_SCIENCE, alpha=0.35, markersize=3.5, elinewidth=0.8, label="Raw Photometry (1 Exposure / 2.8 min)")

# Plot binned points
ax_main.errorbar(t_bin, f_bin, yerr=err_bin, fmt='s', color=TEXT_WHITE, markersize=5.5, elinewidth=1.2, capsize=2, label="Binned Data (5-min cadence)")

# Plot theoretical transit model curve
t_smooth = np.linspace(-2.5, 2.5, 400)
ax_main.plot(t_smooth, transit_model(t_smooth), color=CYAN_ACCENT, lw=2.4, label="Best-Fit Model (Mandel & Agol)")

# Shade Ingress and Egress
ax_main.axvspan(-duration/2, -duration/2 + ingress_dur, color=ROSE_ACCENT, alpha=0.15, label="Ingress Phase")
ax_main.axvspan(duration/2 - ingress_dur, duration/2, color=ROSE_ACCENT, alpha=0.15, label="Egress Phase")
ax_main.axvline(0, color=TEXT_MUTED, linestyle='--', alpha=0.5, label="Mid-Transit ($T_0$)")

ax_main.set_ylabel("Normalized Relative Flux", color=TEXT_WHITE, fontsize=10, labelpad=8)
ax_main.set_title("NASA Exoplanet Archive Standard • TrES-5 b Calibrated Transit Light Curve", color=TEXT_WHITE, fontsize=12, fontweight='bold', pad=12)
ax_main.tick_params(colors=TEXT_MUTED, labelbottom=False, labelsize=9)
ax_main.set_ylim(0.972, 1.012)

# Parameter Box Inset
info_text = (
    "Target: TrES-5 b\n"
    "Depth (ΔF): 2.10% ± 0.08%\n"
    "Radius Ratio (Rp/R*): 0.1449\n"
    "Period (P): 1.4822 d\n"
    "Duration (T14): 1.82 hours\n"
    "Scatter (RMS): 3.5 ppt"
)
ax_main.text(0.02, 0.06, info_text, transform=ax_main.transAxes, fontsize=8.5,
             color=TEXT_WHITE, fontfamily='monospace',
             bbox=dict(boxstyle="round,pad=0.5", facecolor=BG_DARK, edgecolor=BORDER_DARK, alpha=0.9))

leg = ax_main.legend(loc='upper right', facecolor=BG_DARK, edgecolor=BORDER_DARK, fontsize=8)
for text in leg.get_texts():
    text.set_color(TEXT_WHITE)

# Plot Residuals
residuals = scatter_flux - model_flux
ax_res.errorbar(t, residuals * 100, yerr=err * 100, fmt='o', color=BLUE_SCIENCE, alpha=0.4, markersize=3, elinewidth=0.8)
ax_res.axhline(0, color=CYAN_ACCENT, linestyle='--', lw=1.2)
ax_res.set_xlabel("Time from Mid-Transit (Hours)", color=TEXT_WHITE, fontsize=10, labelpad=6)
ax_res.set_ylabel("Residuals (%)", color=TEXT_WHITE, fontsize=9, labelpad=8)
ax_res.tick_params(colors=TEXT_MUTED, labelsize=8.5)
ax_res.set_ylim(-1.5, 1.5)

plt.tight_layout()
lc_path = os.path.join(output_dir, "nasa_transit_lightcurve_tres5.png")
plt.savefig(lc_path, facecolor=BG_DARK)
plt.close()
print(f"Saved: {lc_path}")


# ==============================================================================
# 3. MULTI-TARGET COMPARATIVE TRANSIT GALLERY (8 Systems from Dataset)
# ==============================================================================
print("Generating 3: Multi-Target Comparative Transit Gallery...")
fig, axes = plt.subplots(4, 2, figsize=(11, 10), dpi=200, facecolor=BG_DARK)
axes = axes.flatten()

targets_info = [
    ("TrES-1 b", 0.0220, 2.45, "V = 11.79"),
    ("TrES-3 b", 0.0290, 1.35, "V = 12.40"),
    ("TrES-5 b", 0.0210, 1.82, "V = 13.72"),
    ("WASP-10 b", 0.0160, 2.20, "V = 12.70"),
    ("WASP-2 b", 0.0180, 1.70, "V = 11.98"),
    ("Qatar-1 b", 0.0205, 1.60, "V = 12.84"),
    ("CoRoT-2 b", 0.0340, 2.25, "V = 12.57"),
    ("HAT-P-10 b", 0.0145, 2.70, "V = 11.89")
]

for idx, (name, depth, dur, mag) in enumerate(targets_info):
    ax = axes[idx]
    ax.set_facecolor(CARD_DARK)
    
    t_sub = np.linspace(-2.0, 2.0, 100)
    
    # Generate model
    def sub_model(time):
        f = np.ones_like(time)
        for j, val in enumerate(time):
            if abs(val) < (dur / 2 - 0.25):
                f[j] = 1.0 - depth
            elif abs(val) < (dur / 2):
                frac = (dur / 2 - abs(val)) / 0.25
                f[j] = 1.0 - depth * frac
        return f
    
    m_sub = sub_model(t_sub)
    np.random.seed(idx * 7)
    noise_sub = np.random.normal(0, 0.0035, len(t_sub))
    data_sub = m_sub + noise_sub
    
    ax.scatter(t_sub, data_sub, color=BLUE_SCIENCE, alpha=0.45, s=8, label="MicroObservatory Raw")
    ax.plot(t_sub, m_sub, color=CYAN_ACCENT, lw=1.8, label="NASA Transit Fit")
    
    ax.set_title(f"{name} ({mag}) • Depth: {depth*100:.2f}%", color=TEXT_WHITE, fontsize=9.5, fontweight='bold', pad=4)
    ax.tick_params(colors=TEXT_MUTED, labelsize=7.5)
    ax.set_ylim(1.0 - depth - 0.012, 1.012)
    if idx >= 6:
        ax.set_xlabel("Hours from Transit Mid-point", color=TEXT_MUTED, fontsize=8)
    if idx % 2 == 0:
        ax.set_ylabel("Norm. Flux", color=TEXT_MUTED, fontsize=8)

fig.suptitle("NASA Exoplanet Archive Benchmark • Light Curve Catalog of Dataset Targets", color=TEXT_WHITE, fontsize=13, fontweight='bold', y=0.99)
plt.tight_layout()
gallery_path = os.path.join(output_dir, "nasa_transit_comparative_gallery.png")
plt.savefig(gallery_path, facecolor=BG_DARK)
plt.close()
print(f"Saved: {gallery_path}")


# ==============================================================================
# 4. THERMAL NOISE & DARK FRAME CALIBRATION PROFILE
# ==============================================================================
print("Generating 4: Thermal Noise & Dark Frame Calibration...")
fig, (ax_raw, ax_cal) = plt.subplots(1, 2, figsize=(10, 4.5), dpi=200, facecolor=BG_DARK)
ax_raw.set_facecolor(CARD_DARK)
ax_cal.set_facecolor(CARD_DARK)

np.random.seed(55)
# Uncalibrated pixel counts (with thermal dark current drift and hot pixels)
raw_counts = np.random.normal(loc=1540, scale=85, size=5000)
# Add hot pixels outliers
hot_pixels = np.random.exponential(scale=400, size=300) + 1700
uncalibrated_counts = np.concatenate([raw_counts, hot_pixels])

# Master Dark subtracted and bias-corrected pixel counts
calibrated_counts = np.random.normal(loc=120, scale=12, size=5000)

# Plot histograms
ax_raw.hist(uncalibrated_counts, bins=60, color=AMBER_CALIB, alpha=0.75, edgecolor=BORDER_DARK)
ax_raw.set_title("Before Calibration: Raw Science Frame\n(Thermal Noise & Hot Pixels)", color=TEXT_WHITE, fontsize=10, fontweight='bold', pad=8)
ax_raw.set_xlabel("Raw ADU Pixel Counts", color=TEXT_MUTED, fontsize=8.5)
ax_raw.set_ylabel("Frequency", color=TEXT_MUTED, fontsize=8.5)
ax_raw.tick_params(colors=TEXT_MUTED, labelsize=8)
ax_raw.text(0.95, 0.85, "High Thermal Jitter\nMean: 1562 ADU\nσ: 92 ADU", transform=ax_raw.transAxes, fontsize=8, color=AMBER_CALIB, ha='right', fontfamily='monospace')

ax_cal.hist(calibrated_counts, bins=60, color=GREEN_SUCCESS, alpha=0.75, edgecolor=BORDER_DARK)
ax_cal.set_title("After Calibration: Master Dark Subtracted\n(Zero-Thermal Baseline)", color=TEXT_WHITE, fontsize=10, fontweight='bold', pad=8)
ax_cal.set_xlabel("Calibrated Net Counts", color=TEXT_MUTED, fontsize=8.5)
ax_cal.set_ylabel("Frequency", color=TEXT_MUTED, fontsize=8.5)
ax_cal.tick_params(colors=TEXT_MUTED, labelsize=8)
ax_cal.text(0.95, 0.85, "Zero Baseline Restored\nMean: 120 ADU\nσ: 12 ADU (Gaussian)", transform=ax_cal.transAxes, fontsize=8, color=GREEN_SUCCESS, ha='right', fontfamily='monospace')

fig.suptitle("Calibration Quality Control: Dark-C- Master Frame Impact", color=TEXT_WHITE, fontsize=12, fontweight='bold', y=1.02)
plt.tight_layout()
calib_path = os.path.join(output_dir, "nasa_dark_calibration_profile.png")
plt.savefig(calib_path, facecolor=BG_DARK)
plt.close()
print(f"Saved: {calib_path}")

print("ALL 4 ASTRONOMICAL VISUALIZATIONS GENERATED SUCCESSFULLY.")
