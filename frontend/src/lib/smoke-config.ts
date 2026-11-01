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
  dyeDissipation: 0.962, // Faster graceful decay (~1.2s) so smoke does not accumulate
  curl: 20,
  splatRadius: 0.0018, // Delicate, elegant wisp instead of a dense cloud
  splatForce: 3400, // Reduced force for subtle motion
  maxOpacity: 0.24, // Reduced intensity: soft, translucent and non-intrusive
  spectrumTint: 0.75, // Rich rainbow hue
  idlePauseThreshold: 0.002,
  intensityByRoute: {
    home: 1.0,
    login: 0.7,
    app: 0.3,
  },
  dark: {
    dyeBase: [0.35, 0.38, 0.45], // Soft iridescent slate (never chalk white)
    opacityMult: 0.70, // Reduced intensity
    bloomGain: 0.75,
  },
  light: {
    inkBase: [0.08, 0.1, 0.14], // Deep navy ink mist
    opacityMult: 0.50, // Soft translucent ink on paper
    bloomGain: 0.80,
  },
};
