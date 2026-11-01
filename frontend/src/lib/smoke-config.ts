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
  dyeDissipation: 0.968, // slightly faster dissipation so smoke clears gracefully in ~1.5s
  curl: 22,
  splatRadius: 0.0022,
  splatForce: 5200,
  maxOpacity: 0.38,
  spectrumTint: 0.45, // Richer rainbow / spectrum tint
  idlePauseThreshold: 0.002,
  intensityByRoute: {
    home: 1.0,
    login: 0.7,
    app: 0.3,
  },
  dark: {
    // Darker greyish smoke base with cool charcoal/slate undertones (avoids blinding white)
    dyeBase: [0.22, 0.24, 0.28],
    opacityMult: 0.85,
    bloomGain: 0.75,
  },
  light: {
    inkBase: [0.08, 0.1, 0.14], // Deep navy ink mist
    opacityMult: 0.65, // Soft translucent ink on paper
    bloomGain: 0.85,
  },
};

