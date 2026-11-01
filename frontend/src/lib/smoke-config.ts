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
  velocityDissipation: 0.97,
  dyeDissipation: 0.985,
  curl: 22,
  splatRadius: 0.0025,
  splatForce: 5500,
  maxOpacity: 0.45,
  spectrumTint: 0.22,
  idlePauseThreshold: 0.002,
  intensityByRoute: {
    home: 1.0,
    login: 0.7,
    app: 0.3,
  },
  dark: {
    dyeBase: [0.94, 0.96, 0.98], // Soft silver/white mist
    opacityMult: 1.0,
    bloomGain: 1.1,
  },
  light: {
    inkBase: [0.08, 0.1, 0.14], // Deep navy ink mist
    opacityMult: 0.65, // Soft translucent ink on paper
    bloomGain: 0.85,
  },
};

