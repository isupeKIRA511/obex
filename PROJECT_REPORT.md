# 🪐 OBEX: Comprehensive Project Report & Architectural Blueprint
# 🪐 تقرير المشروع المتكامل والوثيقة الهندسية لمنصة OBEX

---

# 🌐 النسخة العربية (Arabic Version)

## 1. الفكرة العامة للمشروع (Executive Overview)
منصة **OBEX (Aerospace Exoplanet Discovery Suite)** هي منصة برمجية فلكية وبحثية فائقة الدقة والاحترافية، صُممت لمعالجة وتحليل وتفسير بيانات رصد الكواكب النجمية خارج المجموعة الشمسية (Exoplanets) المكتشفة بطريقة العبور الضوئي (Transit Photometry).

تجمع المنصة بين:
1. **البيانات الرصدية الحقيقية (Empirical Ground-based Telemetry):** من تلسكوب Cecilia 6-inch التابع لمرصد هارفارد-سميثسونيان (Harvard-Smithsonian MicroObservatory).
2. **الأرشيف الفلكي العالمي (NASA Exoplanet Archive TAP):** استعلام مباشر وفوري لمعايير ومقاييس آلاف الكواكب المكتشفة وتحديث بياناتها من وكالة ناسا ومرصد كيبك وغولدستون ومهمة TESS.
3. **الذكاء الاصطناعي التوليدي والفيزيائي الفائق (Gemini 2.5 Flash):** نموذج استدلال علمي مستقل ومؤرض بالبيانات الرصدية، يقدم تحليلاً دقيقاً ثنائي اللغة (عربي / إنجليزي) حسب الجمهور المستهدف (طلاب / فلكيين متخصصين / عامة).
4. **محرك الحسابات النسبية والفيزيائية الفلكية (Special Relativity & Astrophysics):** محاكاة ديناميكا الرحلات بين النجمية وتمدد الزمن وعامل لورنتز ونطاقات الصلاحية للحياة وفق نموذج كبارابو 2013 (Kopparapu Habitable Zone).
5. **محرك تصدير التقارير العلمية الديناميكية (PDF Dossier Engine):** توليد ملفات PDF علمية عالية الدقة والوضوح ومطابقة للمعايير الأكاديمية مع دعم كامل للنصوص العربية واللاتينية.

---

## 2. الوحدات الرئيسية للمنصة (Platform Architecture & Modules)

### 🚀 أ. لوحة التحكم الفلكية (Mission Control • Bento Hero)
* واجهة تفاعلية حديثة بنمط Bento Grid تجمع مؤشرات الأداء الرئيسية (KPIs)، ومعدل تحسين الإشارة للضوضاء (SNR Improvement)، ونسبة توافق المعادلات الفيزيائية مع أرشيف ناسا، والولوج السريع لكافة أقسام النظام.

### 📉 ب. مختبر العبور الفلكي المتقدم (Transit Photometry Lab)
* **رسم المنحنى الضوئي (Light Curve Canvas):** عرض بياني تفاعلي لتغير تدفق الضوء مع الزمن الباريسنتري التعديلي ($\text{BJD}_{\text{TDB}}$).
* **طي الأطوار المتعدد الليالي (Multi-Night Phase Folding):** تجميع أرصاد الليالي المختلفة حول نقطة العبور المركزية ($\phi = 0$) لإثبات دورية الحدث الفلكي.
* **محلل الذكاء الاصطناعي (Gemini 2.5 Flash Autonomous Explainer):** استخلاص تقرير فيزيائي ذكي عن عمق العبور، ونصف قطر الكوكب، وثقة الاكتشاف باللغتين العربية والإنجليزية.

### 🔬 ج. مستكشف ومعايرة صور FITS (FITS & Thermal Calibration Hub)
* فحص إطارات الحساس الفلكي (CCD 500×650)، وطرح الإطارات المظلمة (Master Dark Subtraction)، ومعالجة البكسلات الحارة (Hot Pixel Masking)، ومراقبة تغير الضوضاء الحرارية مع درجة حرارة الحساس ($\sim 6^\circ\text{C}$ doubling rule).

### ⚖️ د. التحقق الفيزيائي والمعادلات الفلكية (Astrophysics Validation)
* فحص ومطابقة 48 معادلة فلكية مشتقة مع القياسات المنشورة في أرشيف ناسا باستخدام درجات الانحراف المعياري ($|z| \le 2$).
* تطبيق قوانين كبلر الثالث، إشعاع ستيفان-بولتزمان، نصف قطر روش، والكثافة المتوسطة للنجم المضيف.

### 📊 هـ. مركز فرز الجودة والتحكم الإحصائي (Quality & Triage Hub)
* فرز 22 جلسة رصدية (Good / Marginal / Unusable)، واختبار البحث الأعمى (Blind Search) عبر 2,723 ليلة نجمية للتحكم الإحصائي، وتحديد أرضية الضوضاء القياسية (Noise Floor).

### 🛡️ و. مصفوفة تشخيص الحالات الإيجابية الخاطئة (Diagnostic Matrix)
* مصفوفة متكاملة لاستبعاد 11 سيناريو خداعي (نجوم ثنائية كسوفية، عبور سحابي، نبضات الأشعة الكونية، انزلاق تتبع التلسكوب).
* مصنف شبكة عصبية اصطناعية تفاعلي للقصاصات المقطوعة ($32\times32$ Pixel Cutouts) مع مصفوفة أداء CNN بدقة 94.2%.

### 🪐 ز. مركز ناسا ونطاق الصلاحية للحياة (NASA Exoplanet Hub & HZ Lab)
* **مستكشف أرشيف ناسا (TAP Explorer):** استعراض حي وتصفية للكواكب الصالحة للحياة والعمالقة الغازية.
* **محلل نطاق الحياة (Kopparapu 2013 Model):** حساب حدود الاحتباس الحراري الجامح والحد الأقصى لـ $\text{CO}_2$ مع فحص اتزان درجات الحرارة.
* **حاسبة المهمات بين النجمية (Relativistic Mission Calculator):** حساب مدة السفر إلى الكوكب بسرعات نسبية ($0.01c - 0.99c$) وحساب تمدد الزمن الفلكي وسنوات عمر الطاقم المحفوظة ($\Delta t = t - \tau$).

---

## 3. التقنيات المستعملة في الواجهة الأمامية (Frontend Tech Stack)
* **React 18 & TypeScript:** معمارية مكونات محكمة وموثقة بأنواع بيانات فلكية وفيزيائية صارمة.
* **Vite 6:** محرك تجميع وبناء عالي السرعة وتحديث فوري للوحدات (HMR).
* **Tailwind CSS & Custom Design Tokens:** نظام ألوان فضائي غامق معزز بتأثيرات الزجاج (Glassmorphism)، وبوردرات متناسقة `rounded-xl` وألوان هرمونية (`opticsCyan`, `aerospaceBlue`, `telemetryGreen`, `calibAmber`).
* **Lucide React:** حزمة أيقونات ناقلية دقيقة وعصرية.
* **jsPDF & jsPDF-AutoTable:** محرك متطور لتوليد مستندات PDF ثنائية الصفحة بجودة طباعة 300 DPI.
* **Offscreen HTML5 Canvas Rendering Engine:** معالج رسومي فريد لرسم وتنسيق النصوص العربية والرموز الفلكية بدقة متناهية دون أي تشوه في الخطوط.

---

# 🇬🇧 English Version

## 1. Project Concept & Vision
**OBEX (Aerospace Exoplanet Discovery Suite)** is a research-grade astronomical computing platform designed for detecting, analyzing, validating, and explaining extrasolar planetary transits.

The suite synthesizes:
1. **Empirical Telescope Telemetry:** Real astronomical FITS frames from the Harvard-Smithsonian MicroObservatory Cecilia 6-inch reflector telescope.
2. **NASA Exoplanet Archive Synchronization:** Real-time query and validation via Caltech/IPAC Table Access Protocol (TAP).
3. **Autonomous AI Science Grounding (Gemini 2.5 Flash):** Telemetry-grounded multimodal reasoning engine generating bilingual (Arabic & English) scientific explanations tailored for students, astrophysicists, and the public.
4. **Relativistic Mechanics & Habitability Engine:** Special Relativity calculations (Lorentz factor $\gamma$, time dilation $\Delta t$, ship proper time $\tau$) coupled with Kopparapu et al. (2013) Habitable Zone radiative models.
5. **Dynamic Planetary PDF Dossier Generator:** Browser-side, high-resolution scientific dossier export with bilingual typesetting.

---

## 2. Key Modules & Functional Capabilities

### 🛰️ A. Mission Control & Executive Bento Hero
* Comprehensive dashboard with live KPI telemetry, signal-to-noise improvement index ($>2.5\times$), astrophysical law concordance, and instant target switching.

### 📈 B. Transit Photometry Lab
* **Interactive Light Curve Rendering:** High-resolution SVG rendering of relative flux vs. Barycentric Julian Date ($\text{BJD}_{\text{TDB}}$).
* **Phase-Folding Engine:** Multi-epoch period folding centering transits at phase zero ($\phi = 0$) with binned standard error bars.
* **Gemini 2.5 Flash Autonomous Explainer:** Explains ingress/egress, transit depth ($\Delta F$), and planet radius ($R_p$) with target-specific physical reasoning.

### 📷 C. FITS Imaging & Sensor Calibration
* 500×650 CCD frame browser, thermal dark master array with Arrhenius temperature scaling ($\sim 6^\circ\text{C}$ doubling rule), and hot pixel spatial masking.

### 📐 D. Astrophysics Validation Hub
* 48 automated equation checks benchmarked against published NASA parameters with $|z| \le 2$ statistical agreement criteria (Kepler's Third Law, Stefan-Boltzmann radiation, transit geometry, stellar density).

### 🔬 E. Quality Triage & Statistical Control Hub
* Triaging 22 observing sessions into Good, Marginal, and Control samples; 2,723 star-night blind search floor; and empirical environmental correlation matrix ($r$-values).

### 🛡️ F. Diagnostic False-Positive Elimination Matrix
* 11 distinct astronomical and instrumental false-positive screening modules (eclipsing binaries, blend contamination, cloud gradients, tracking slips).
* Integrated 32×32 pixel cutout CNN classifier with 94.2% macro accuracy.

### 🌌 G. NASA Exoplanet Hub & Interstellar Mission Hub
* Live TAP query explorer, Kopparapu 2013 Habitable Zone polynomial boundary classifier, and relativistic starflight trajectory calculator with biological crew time dilation.

---

## 3. Frontend Technology Stack
* **Framework:** React 18 with TypeScript (Strict Type Safety for physical parameters).
* **Bundler & Build Tool:** Vite 6 with ultra-fast Hot Module Replacement (HMR).
* **Styling & Design System:** Tailwind CSS with aerospace dark palettes, `rounded-xl` unified border radii, and custom telemetry color tokens.
* **Typography:** Modern mono and sans-serif fonts optimized for scientific clarity.
* **Vector Graphics:** Custom SVG Canvas engines for responsive light curve rendering.
* **Export Engine:** `jspdf` & `jspdf-autotable` paired with a High-DPI HTML5 Canvas rasterizer for multilingual and Arabic text shaping.
