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
  spectrumTint: number; // 0 = monochrome, 1 = full pure spectrum
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
  velocityDissipation: 0.95,
  dyeDissipation: 0.940, // Swift graceful decay (~0.75s) preventing dense cloud buildup
  curl: 18,
  splatRadius: 0.0013, // Delicate, elegant fine wisp
  splatForce: 2400,
  maxOpacity: 0.16, // Very low intensity
  spectrumTint: 1.0, // Full pure chromatic rainbow
  idlePauseThreshold: 0.002,
  intensityByRoute: {
    home: 1.0,
    login: 0.7,
    app: 0.3,
  },
  dark: {
    dyeBase: [0.0, 0.0, 0.0], // Strictly ZERO white/silver base
    opacityMult: 0.55, // Subtle, restrained intensity in dark mode
    bloomGain: 0.50,
  },
  light: {
    inkBase: [0.0, 0.0, 0.0], // Strictly ZERO white/grey base
    opacityMult: 0.65, // Subtle, restrained intensity in light mode
    bloomGain: 0.50,
  },
};
