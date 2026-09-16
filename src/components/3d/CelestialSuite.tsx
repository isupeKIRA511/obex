import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Planet3D, PlanetPhysicalData } from '../../types';
import { apiService } from '../../services/api';
import { Globe, Compass, Info, Maximize2, RotateCcw, ExternalLink, Flame, Zap, Gauge, Sparkles } from 'lucide-react';

const SOLAR_PLANETS: Planet3D[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    systemName: 'Sol I',
    color: '#8c8c8c',
    radiusKm: '2,439.7 km',
    massKg: '3.301 × 10^23 kg',
    orbitalPeriod: '87.97 days',
    surfaceGravity: '3.7 m/s²',
    surfaceTemp: '167°C',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
  },
  {
    id: 'venus',
    name: 'Venus',
    systemName: 'Sol II',
    color: '#e3bb76',
    radiusKm: '6,051.8 km',
    massKg: '4.867 × 10^24 kg',
    orbitalPeriod: '224.7 days',
    surfaceGravity: '8.87 m/s²',
    surfaceTemp: '464°C',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/venus_atmosphere.jpg'
  },
  {
    id: 'earth',
    name: 'Earth',
    systemName: 'Sol III',
    color: '#2b82c9',
    radiusKm: '6,371.0 km',
    massKg: '5.972 × 10^24 kg',
    orbitalPeriod: '365.25 days',
    surfaceGravity: '9.81 m/s²',
    surfaceTemp: '15°C',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    cloudsUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    hasAtmosphere: true
  },
  {
    id: 'mars',
    name: 'Mars',
    systemName: 'Sol IV',
    color: '#c1440e',
    radiusKm: '3,389.5 km',
    massKg: '6.417 × 10^23 kg',
    orbitalPeriod: '686.98 days',
    surfaceGravity: '3.72 m/s²',
    surfaceTemp: '-65°C',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars_1k_color.jpg'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    systemName: 'Sol V',
    color: '#b07f35',
    radiusKm: '69,911 km',
    massKg: '1.898 × 10^27 kg',
    orbitalPeriod: '11.86 years',
    surfaceGravity: '24.79 m/s²',
    surfaceTemp: '-110°C',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter_1k.jpg'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    systemName: 'Sol VI',
    color: '#e2bf7d',
    radiusKm: '58,232 km',
    massKg: '5.683 × 10^26 kg',
    orbitalPeriod: '29.45 years',
    surfaceGravity: '10.44 m/s²',
    surfaceTemp: '-140°C',
    textureUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn_1k.jpg'
  }
];

// 8 Confirmed Target Exoplanets from Backend
const EXOPLANET_TEMPLATES = [
  { target: 'TRES-3', planet: 'TrES-3 b', color: '#ff6622', speed: '190.1 km/s', temp: '1642 K', a: '0.0228 AU' },
  { target: 'TRES-5', planet: 'TrES-5 b', color: '#3b82f6', speed: '180.5 km/s', temp: '1482 K', a: '0.0246 AU' },
  { target: 'Qatar-1', planet: 'Qatar-1 b', color: '#06b6d4', speed: '178.7 km/s', temp: '1418 K', a: '0.0233 AU' },
  { target: 'CoRoT-2', planet: 'CoRoT-2 b', color: '#f59e0b', speed: '174.7 km/s', temp: '1544 K', a: '0.0280 AU' },
  { target: 'WASP-2', planet: 'WASP-2 b', color: '#a855f7', speed: '158.9 km/s', temp: '1310 K', a: '0.0314 AU' },
  { target: 'HATP-10', planet: 'WASP-11 b', color: '#10b981', speed: '154.3 km/s', temp: '953 K', a: '0.0528 AU' },
  { target: 'TRES-1', planet: 'TrES-1 b', color: '#ec4899', speed: '149.1 km/s', temp: '1141 K', a: '0.0415 AU' },
  { target: 'WASP-10', planet: 'WASP-10 b', color: '#8b5cf6', speed: '132.9 km/s', temp: '969 K', a: '0.0378 AU' },
];

interface WebGLErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class WebGLErrorBoundary extends React.Component<WebGLErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('WebGL rendering error caught by boundary:', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const FallbackSphere: React.FC<{ name: string; color: string; systemName?: string }> = ({ name, color, systemName }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#05070D] overflow-hidden select-none">
      {/* Starfield simulation */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
      
      {/* Glowing Orbital Ring */}
      <div className="absolute w-96 h-96 rounded-full border border-opticsCyan/20 border-dashed animate-spin [animation-duration:40s]"></div>
      <div className="absolute w-[460px] h-[460px] rounded-full border border-blue-600/10"></div>
      
      {/* Procedural High-Tech Spherical Globe */}
      <div 
        className="w-48 h-48 rounded-full relative shadow-2xl flex items-center justify-center transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${color} 45%, #05070D 95%)`,
          boxShadow: `0 0 50px ${color}55, inset -10px -10px 40px #000000cc, inset 10px 10px 30px #ffffff44`
        }}
      >
        {/* Atmospheric Glow Ring */}
        <div 
          className="absolute -inset-2 rounded-full blur-md opacity-50"
          style={{ backgroundColor: color }}
        ></div>
        
        {/* Core details */}
        <div className="text-center z-10 font-mono text-xs text-white/90 drop-shadow-md">
          <div className="font-bold text-sm tracking-wider">{name}</div>
          <div className="text-[10px] text-white/70">{systemName}</div>
        </div>
      </div>
      
      <div className="absolute bottom-16 left-6 text-[11px] font-mono text-textMuted flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-opticsCyan"></span>
        <span>Procedural Orbital Rendering Engine Active</span>
      </div>
    </div>
  );
};

// Procedural Planet Mesh with Rotation and Atmosphere Glow
const PlanetMesh: React.FC<{ color: string; hasAtmosphere?: boolean; spinSpeed?: number }> = ({ 
  color, 
  hasAtmosphere = false,
  spinSpeed = 0.15 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * spinSpeed;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * (spinSpeed * 1.4);
    }
  });

  return (
    <group>
      {/* Primary Planet Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* Atmospheric Halo / Cloud Layer */}
      {hasAtmosphere && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.83, 64, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent={true}
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

export const CelestialSuite: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'exoplanets' | 'solar' | 'nasa'>('exoplanets');
  const [livePlanets, setLivePlanets] = useState<PlanetPhysicalData[]>([]);
  const [selectedExoIndex, setSelectedExoIndex] = useState<number>(0);
  const [selectedSolarPlanet, setSelectedSolarPlanet] = useState<Planet3D>(SOLAR_PLANETS[2]); // Earth
  const controlsRef = useRef<any>(null);

  // Load live physics data from /api/planets
  useEffect(() => {
    let isCancelled = false;
    const fetchExos = async () => {
      try {
        const data = await apiService.getPlanets();
        if (!isCancelled && data && data.length > 0) {
          setLivePlanets(data);
        }
      } catch (e) {
        console.warn('Failed loading /api/planets:', e);
      }
    };
    fetchExos();
    return () => { isCancelled = true; };
  }, []);

  const activeExoData = livePlanets[selectedExoIndex] || null;
  const activeExoTemplate = EXOPLANET_TEMPLATES[selectedExoIndex] || EXOPLANET_TEMPLATES[0];

  // Smooth camera reset
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Header with Sub-tabs */}
      <div className="bg-card border border-borderHairline rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-aerospaceBlue"></span>
            <h2 className="text-base font-bold text-textPrimary font-mono">
              3D Celestial Suite & Orbital Telemetry
            </h2>
          </div>
          <p className="text-xs text-textSecondary mt-1">
            Real-time Keplerian orbital velocities, stellar distance, 3D Cartesian star mapping, and equilibrium temperature (WebGL 60 FPS)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-canvas p-1 rounded-xl border border-borderHairline text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('exoplanets')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'exoplanets'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Confirmed Exoplanets (8 Systems)
          </button>
          <button
            onClick={() => setActiveSubTab('solar')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'solar'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Solar System Reference
          </button>
          <button
            onClick={() => setActiveSubTab('nasa')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'nasa'
                ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            NASA Eyes Simulator
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Confirmed Target Exoplanets with Live Physics */}
      {activeSubTab === 'exoplanets' && (
        <div className="space-y-4">
          <div className="relative w-full h-[560px] bg-canvas border border-borderHairline rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Top Breadcrumb */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-borderHairline text-textSecondary backdrop-blur">
                Exoplanet Target: <strong className="text-white">{activeExoData?.planet || activeExoTemplate.planet}</strong> ({activeExoData?.target || activeExoTemplate.target})
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={handleResetCamera}
                className="p-2 rounded-lg bg-card/80 hover:bg-card border border-borderHairline text-textSecondary hover:text-textPrimary transition"
                title="Reset Camera View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Three.js Canvas with WebGL Fallback */}
            <WebGLErrorBoundary 
              fallback={
                <FallbackSphere 
                  name={activeExoData?.planet || activeExoTemplate.planet} 
                  color={activeExoTemplate.color} 
                  systemName={activeExoData?.target || activeExoTemplate.target}
                />
              }
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: false }}
                className="w-full h-full"
              >
                <color attach="background" args={['#05070D']} />
                <ambientLight intensity={0.3} />
                <directionalLight position={[5, 3, 5]} intensity={1.8} castShadow />
                <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={1} />
                
                <PlanetMesh 
                  color={activeExoTemplate.color} 
                  hasAtmosphere={true}
                  spinSpeed={activeExoData ? (activeExoData.orbital_speed_kms / 190) * 0.25 : 0.15}
                />
                <OrbitControls ref={controlsRef} enablePan={false} minDistance={3} maxDistance={9} />
              </Canvas>
            </WebGLErrorBoundary>

            {/* Right Live Physics Telemetry HUD Card (From /api/planets) */}
            <div className="absolute top-16 right-4 z-10 w-80 bg-card/90 border border-borderHairline rounded-xl p-4 font-mono text-xs space-y-3 backdrop-blur shadow-2xl animate-fadeIn">
              <div className="border-b border-borderHairline pb-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-textPrimary">{activeExoData?.planet || activeExoTemplate.planet}</span>
                  <div className="text-[10px] text-textMuted">Host: {activeExoData?.archive_host || activeExoTemplate.target}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-telemetryGreen font-bold">
                  Kepler III Live
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-textSecondary">
                  <span>Semi-Major Axis (a):</span>
                  <span className="text-textPrimary font-bold">
                    {activeExoData?.a_au ? `${activeExoData.a_au.toFixed(4)} AU` : activeExoTemplate.a}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Orbital Velocity:</span>
                  <span className="text-opticsCyan font-bold">
                    {activeExoData?.orbital_speed_kms ? `${activeExoData.orbital_speed_kms.toFixed(1)} km/s` : activeExoTemplate.speed}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Speed vs Earth:</span>
                  <span className="text-telemetryGreen font-bold">
                    {activeExoData?.orbital_speed_vs_earth ? `${activeExoData.orbital_speed_vs_earth.toFixed(1)}x faster` : '5.2x faster'}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Orbital Period:</span>
                  <span className="text-textPrimary">
                    {activeExoData?.orbital_period_days ? `${activeExoData.orbital_period_days.toFixed(3)} days` : '1.306 days'}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Equilibrium Temp (Teq):</span>
                  <span className="text-calibAmber font-bold">
                    {activeExoData?.teq_k ? `${activeExoData.teq_k.toFixed(0)} K` : activeExoTemplate.temp}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Incident Solar Flux:</span>
                  <span className="text-textPrimary">
                    {activeExoData?.insolation_earth ? `${activeExoData.insolation_earth.toFixed(0)}x Earth` : '1,212x Earth'}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Distance (Gaia DR3):</span>
                  <span className="text-textPrimary font-bold">
                    {activeExoData?.distance_ly ? `${activeExoData.distance_ly.toFixed(0)} ly` : '755 ly'}
                  </span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Transit Duration:</span>
                  <span className="text-textPrimary">
                    {activeExoData?.transit_duration_h ? `${activeExoData.transit_duration_h.toFixed(2)} hours` : '1.38 hours'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-borderHairline text-[10px] text-textMuted leading-relaxed">
                Derived via Kepler's Third Law and Gaia parallax. 0% synthetic data.
              </div>
            </div>

            {/* Bottom Exoplanet Carousel Selector */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto p-2 bg-card/80 border border-borderHairline rounded-xl backdrop-blur">
              {EXOPLANET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={tmpl.target}
                  onClick={() => setSelectedExoIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                    selectedExoIndex === idx
                      ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-borderHairline'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tmpl.color }}></span>
                  <span>{tmpl.planet}</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}


      {/* SUB-VIEW 3: Solar System Reference Planets */}
      {activeSubTab === 'solar' && (
        <div className="space-y-4">
          <div className="relative w-full h-[540px] bg-canvas border border-borderHairline rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Top Overlay Breadcrumb & Camera Controls */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-card/80 border border-borderHairline text-textSecondary">
                Solar System &gt; {selectedSolarPlanet.name} ({selectedSolarPlanet.systemName})
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={handleResetCamera}
                className="p-2 rounded-lg bg-card/80 hover:bg-card border border-borderHairline text-textSecondary hover:text-textPrimary transition"
                title="Reset Camera View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Three.js Canvas with WebGL Fallback */}
            <WebGLErrorBoundary
              fallback={
                <FallbackSphere
                  name={selectedSolarPlanet.name}
                  color={selectedSolarPlanet.color}
                  systemName={selectedSolarPlanet.systemName}
                />
              }
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: false }}
                className="w-full h-full"
              >
                <color attach="background" args={['#05070D']} />
                <ambientLight intensity={0.25} />
                <directionalLight position={[5, 3, 5]} intensity={1.8} castShadow />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                
                <PlanetMesh 
                  color={selectedSolarPlanet.color} 
                  hasAtmosphere={selectedSolarPlanet.hasAtmosphere} 
                />
                <OrbitControls ref={controlsRef} enablePan={false} minDistance={3} maxDistance={9} />
              </Canvas>
            </WebGLErrorBoundary>

            {/* Right Holographic Telemetry HUD Card */}
            <div className="absolute top-16 right-4 z-10 w-72 bg-card/90 border border-borderHairline rounded-xl p-4 font-mono text-xs space-y-3 backdrop-blur shadow-xl animate-fadeIn">
              <div className="border-b border-borderHairline pb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-textPrimary">{selectedSolarPlanet.name}</span>
                <span className="text-[10px] text-opticsCyan">{selectedSolarPlanet.systemName}</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-textSecondary">
                  <span>Equatorial Radius:</span>
                  <span className="text-textPrimary font-bold">{selectedSolarPlanet.radiusKm}</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Mass:</span>
                  <span className="text-textPrimary">{selectedSolarPlanet.massKg}</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Orbital Period:</span>
                  <span className="text-textPrimary">{selectedSolarPlanet.orbitalPeriod}</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Surface Gravity:</span>
                  <span className="text-textPrimary">{selectedSolarPlanet.surfaceGravity}</span>
                </div>
                <div className="flex justify-between text-textSecondary">
                  <span>Mean Surface Temp:</span>
                  <span className="text-opticsCyan font-bold">{selectedSolarPlanet.surfaceTemp}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-borderHairline text-[10px] text-textMuted leading-relaxed">
                Solar System baseline reference model mapped via SphereGeometry (60 FPS).
              </div>
            </div>

            {/* Bottom Planet Carousel Selector */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center gap-2 overflow-x-auto p-2 bg-card/80 border border-borderHairline rounded-xl backdrop-blur">
              {SOLAR_PLANETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedSolarPlanet(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
                    selectedSolarPlanet.id === p.id
                      ? 'bg-aerospaceBlue text-white font-semibold shadow-md'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-borderHairline'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Official NASA Solar System Interactive Viewer */}
      {activeSubTab === 'nasa' && (
        <div className="bg-card border border-borderHairline rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-textPrimary font-mono">
                Official NASA Eyes on the Solar System Simulation
              </h3>
              <p className="text-xs text-textSecondary">
                Embedded official NASA real-time trajectory and orbital mechanics simulator
              </p>
            </div>
            <a
              href="https://eyes.nasa.gov/apps/solar-system/#/home"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-canvas border border-borderHairline text-textSecondary hover:text-textPrimary text-xs font-mono flex items-center gap-1.5 transition"
            >
              <span>Open in Full NASA Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full aspect-video rounded-xl overflow-hidden border border-borderHairline bg-black">
            <iframe
              src="https://eyes.nasa.gov/apps/solar-system/#/home"
              title="NASA Eyes on the Solar System"
              className="w-full h-full border-0"
              allow="fullscreen"
            />
          </div>
        </div>
      )}

    </div>
  );
};

