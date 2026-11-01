// PRISM — Smoke Cursor Effect (Fluid Trail) Configuration
// Grounded in real-time GPU fluid simulation (Navier-Stokes)

export interface SmokeConfig {
  simResolution: number;
  dyeResolution: number;
  pressureIterations: number;
  velocityDissipation: number;
  dyeDissipation: number;
  curl: number; // vorticity strength
  splatRadius: number;
  splatForce: number;
  maxOpacity: number;
  spectrumTint: number; // 0 = pure white/ink smoke, 1 = full spectrum
  idlePauseThreshold: number;
  intensityByRoute: {
    home: number;
    login: number;
    app: number;
  };
  dark: {
    dyeBase: [number, number, number];
    opacityMult: number;
    bloomGain: number;
  };
  light: {
    inkBase: [number, number, number];
    opacityMult: number;
    bloomGain: number;
  };
}

export const SMOKE_CONFIG: SmokeConfig = {
  simResolution: 128,
  dyeResolution: 768,
  pressureIterations: 18,
  velocityDissipation: 0.96,
  dyeDissipation: 0.965, // Graceful decay (~1.2s)
  curl: 20,
  splatRadius: 0.0019, // Delicate, elegant wisp
  splatForce: 3600,
  maxOpacity: 0.25,
  spectrumTint: 0.55,
  idlePauseThreshold: 0.002,
  intensityByRoute: {
    home: 1.0,
    login: 0.7,
    app: 0.3,
  },
  dark: {
    dyeBase: [0.55, 0.58, 0.65], // Soft silver mist with a bit lesser rainbow shimmer
    opacityMult: 0.65, // Restrained, subtle intensity in dark mode
    bloomGain: 0.75,
  },
  light: {
    inkBase: [0.12, 0.15, 0.22], // Deep slate-ink mist
    opacityMult: 1.35, // Boosted visibility for light mode on warm paper canvas
    bloomGain: 0.90,
  },
};
