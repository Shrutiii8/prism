// PRISM — WebGL2/WebGL1 Navier-Stokes GPU Fluid Simulation Engine
// Self-contained, zero-dependency, ultra-lightweight and battery-efficient

import { SMOKE_CONFIG, SmokeConfig } from "./smoke-config";

interface PointerState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  deltaX: number;
  deltaY: number;
  moved: boolean;
  speed: number;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach(id: number): number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap(): void;
}

export class SmokeFluidEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  private isWebGL2 = false;
  private ext: any = {};
  private config: SmokeConfig;

  // Render State
  private isRunning = false;
  private isPaused = false;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private activeDyeEnergy = 1.0;
  private routeIntensity = 1.0;
  private targetRouteIntensity = 1.0;
  private suppressionGain = 1.0;
  private userSettingMultiplier = 1.0;
  private isDark = true;

  // Frame Timing for Adaptive Quality
  private frameCount = 0;
  private frameTimeSum = 0;
  private adaptiveDegraded = false;

  // 2D Canvas Fallback State
  private ctx2D: CanvasRenderingContext2D | null = null;
  private particles2D: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    decay: number;
    color: string;
  }> = [];

  // Pointer
  private pointer: PointerState = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    deltaX: 0,
    deltaY: 0,
    moved: false,
    speed: 0,
  };

  // Spectrum Stops for Light-Refracted Smoke
  private spectrumStops: [number, number, number][] = [
    [0.486, 0.227, 0.929], // violet (#7c3aed)
    [0.145, 0.388, 0.922], // blue (#2563eb)
    [0.024, 0.714, 0.831], // cyan (#06b6d4)
    [0.063, 0.725, 0.506], // green (#10b981)
    [0.961, 0.620, 0.043], // amber (#f59e0b)
    [0.976, 0.451, 0.086], // saffron (#f97316)
  ];
  private colorPhase = 0;

  // WebGL Buffers & Programs
  private quadBuffer: WebGLBuffer | null = null;
  private density!: DoubleFBO;
  private velocity!: DoubleFBO;
  private pressure!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;

  private splatProgram: any;
  private advectionProgram: any;
  private divergenceProgram: any;
  private curlProgram: any;
  private vorticityProgram: any;
  private pressureProgram: any;
  private gradSubtractProgram: any;
  private displayProgram: any;

  constructor(canvas: HTMLCanvasElement, customConfig?: Partial<SmokeConfig>) {
    this.canvas = canvas;
    this.config = { ...SMOKE_CONFIG, ...customConfig };

    // Check user preference
    this.syncUserSetting();

    // Check reduced motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.userSettingMultiplier = 0;
    }

    // Touch devices check
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      this.userSettingMultiplier = 0;
    }

    this.initContext();
    this.bindEvents();
    this.resize();
    this.start();
  }

  private syncUserSetting() {
    try {
      const saved = localStorage.getItem("prism_cursor_effects");
      if (saved === "off") {
        this.userSettingMultiplier = 0.0;
      } else if (saved === "reduced") {
        this.userSettingMultiplier = 0.45;
      } else {
        this.userSettingMultiplier = 1.0;
      }
    } catch {
      this.userSettingMultiplier = 1.0;
    }
  }

  public setUserSetting(setting: "on" | "reduced" | "off") {
    try {
      localStorage.setItem("prism_cursor_effects", setting);
    } catch {}
    this.syncUserSetting();
    if (this.userSettingMultiplier > 0 && this.isPaused) {
      this.resume();
    }
  }

  public setRouteIntensity(intensity: number) {
    this.targetRouteIntensity = Math.max(0, Math.min(1, intensity));
  }

  public setTheme(dark: boolean) {
    this.isDark = dark;
    if (this.isPaused) {
      this.resume();
    }
  }

  public setSuppressed(suppressed: boolean) {
    this.suppressionGain = suppressed ? 0.0 : 1.0;
  }

  private initContext() {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "default" as WebGLPowerPreference,
    };

    // Try WebGL2 first
    this.gl = this.canvas.getContext("webgl2", params) as WebGL2RenderingContext;
    if (this.gl) {
      this.isWebGL2 = true;
      this.ext.colorBufferFloat = this.gl.getExtension("EXT_color_buffer_float");
      this.ext.linearFloat = this.gl.getExtension("OES_texture_float_linear");
    } else {
      // Fallback to WebGL1
      this.gl = (this.canvas.getContext("webgl", params) ||
        this.canvas.getContext("experimental-webgl", params)) as WebGLRenderingContext;
      if (this.gl) {
        this.isWebGL2 = false;
        this.ext.halfFloat = this.gl.getExtension("OES_texture_half_float");
        this.ext.halfFloatLinear = this.gl.getExtension("OES_texture_half_float_linear");
      }
    }

    if (!this.gl) {
      // Graceful fallback to 2D Canvas particles
      this.ctx2D = this.canvas.getContext("2d");
      return;
    }

    const gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Create Quad Buffer
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );

    this.initPrograms();
    this.initFramebuffers();
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl!;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private createProgram(vertSrc: string, fragSrc: string) {
    const gl = this.gl!;
    const program = gl.createProgram();
    if (!program) return null;

    const vert = this.createShader(gl.VERTEX_SHADER, vertSrc);
    const frag = this.createShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vert || !frag) return null;

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(program));
      return null;
    }

    // Cache uniform locations
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
      }
    }

    return { program, uniforms };
  }

  private initPrograms() {
    const baseVert = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 uTexelSize;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(uTexelSize.x, 0.0);
        vR = vUv + vec2(uTexelSize.x, 0.0);
        vT = vUv + vec2(0.0, uTexelSize.y);
        vB = vUv - vec2(0.0, uTexelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Splat
    const splatFrag = `
      precision highp float;
      uniform sampler2D uTarget;
      uniform float uAspectRatio;
      uniform vec2 uPoint;
      uniform vec3 uColor;
      uniform float uRadius;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv - uPoint;
        p.x *= uAspectRatio;
        vec3 splat = exp(-dot(p, p) / max(1e-5, uRadius)) * uColor;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    // Advection
    const advectionFrag = `
      precision highp float;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 uTexelSize;
      uniform float uDt;
      uniform float uDissipation;
      varying vec2 vUv;
      void main() {
        vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
        gl_FragColor = uDissipation * texture2D(uSource, coord);
      }
    `;

    // Divergence
    const divergenceFrag = `
      precision highp float;
      uniform sampler2D uVelocity;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      void main() {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    // Curl
    const curlFrag = `
      precision highp float;
      uniform sampler2D uVelocity;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      void main() {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    // Vorticity Confinement
    const vorticityFrag = `
      precision highp float;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float uCurlStrength;
      uniform float uDt;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      void main() {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        float lenSq = max(1e-5, dot(force, force));
        force *= inversesqrt(lenSq);
        force *= uCurlStrength * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * uDt, 0.0, 1.0);
      }
    `;

    // Pressure Jacobi Solve
    const pressureFrag = `
      precision highp float;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float div = texture2D(uDivergence, vUv).x;
        float p = (L + R + T + B - div) * 0.25;
        gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
      }
    `;

    // Gradient Subtract
    const gradSubtractFrag = `
      precision highp float;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        vel -= vec2(R - L, T - B) * 0.5;
        gl_FragColor = vec4(vel, 0.0, 1.0);
      }
    `;

    // Display Pass with anti-banding dithering and adaptive dark/light blending
    const displayFrag = `
      precision highp float;
      uniform sampler2D uDye;
      uniform float uOpacity;
      uniform float uIsDark;
      varying vec2 vUv;

      float dither(vec2 uv) {
        return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.008;
      }

      void main() {
        vec3 dye = texture2D(uDye, vUv).rgb;
        float d = dither(gl_FragCoord.xy);
        dye += d;

        float maxVal = max(dye.r, max(dye.g, dye.b));
        if (maxVal < 0.001) {
          gl_FragColor = vec4(0.0);
          return;
        }

        float alpha = clamp(maxVal * uOpacity, 0.0, 1.0);

        if (uIsDark > 0.5) {
          // Luminous smoke trail on dark canvas
          gl_FragColor = vec4(dye, alpha);
        } else {
          // Ink mist on warm paper canvas
          vec3 ink = mix(vec3(0.06, 0.08, 0.12), dye * 0.75, 0.3);
          gl_FragColor = vec4(ink, alpha * 0.7);
        }
      }
    `;

    this.splatProgram = this.createProgram(baseVert, splatFrag);
    this.advectionProgram = this.createProgram(baseVert, advectionFrag);
    this.divergenceProgram = this.createProgram(baseVert, divergenceFrag);
    this.curlProgram = this.createProgram(baseVert, curlFrag);
    this.vorticityProgram = this.createProgram(baseVert, vorticityFrag);
    this.pressureProgram = this.createProgram(baseVert, pressureFrag);
    this.gradSubtractProgram = this.createProgram(baseVert, gradSubtractFrag);
    this.displayProgram = this.createProgram(baseVert, displayFrag);
  }

  private createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
    const gl = this.gl!;
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1.0 / w,
      texelSizeY: 1.0 / h,
      attach: (id: number) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  private createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      set read(val) {
        fbo1 = val;
      },
      get write() {
        return fbo2;
      },
      set write(val) {
        fbo2 = val;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  private initFramebuffers() {
    if (!this.gl) return;
    const gl = this.gl;

    const simRes = this.config.simResolution;
    const dyeRes = this.config.dyeResolution;

    let internalFormat: number = gl.RGBA;
    let format: number = gl.RGBA;
    let type: number = gl.UNSIGNED_BYTE;

    if (this.isWebGL2 && (this.gl as WebGL2RenderingContext).RGBA16F) {
      internalFormat = (this.gl as WebGL2RenderingContext).RGBA16F;
      type = (this.gl as WebGL2RenderingContext).HALF_FLOAT;
    } else if (this.ext.halfFloat) {
      type = this.ext.halfFloat.HALF_FLOAT_OES;
    }

    const filtering = (this.ext.linearFloat || this.ext.halfFloatLinear) ? gl.LINEAR : gl.NEAREST;

    this.density = this.createDoubleFBO(dyeRes, dyeRes, internalFormat, format, type, filtering);
    this.velocity = this.createDoubleFBO(simRes, simRes, internalFormat, format, type, filtering);
    this.pressure = this.createDoubleFBO(simRes, simRes, internalFormat, format, type, gl.NEAREST);
    this.divergence = this.createFBO(simRes, simRes, internalFormat, format, type, gl.NEAREST);
    this.curl = this.createFBO(simRes, simRes, internalFormat, format, type, gl.NEAREST);
  }

  private bindEvents() {
    if (typeof window === "undefined") return;

    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    window.addEventListener("resize", this.onResizeDebounced, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private onPointerMove = (e: PointerEvent) => {
    if (this.userSettingMultiplier <= 0) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    const dx = x - this.pointer.prevX;
    const dy = y - this.pointer.prevY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.deltaX = dx;
    this.pointer.deltaY = dy;
    this.pointer.speed = speed;
    this.pointer.moved = true;

    this.pointer.prevX = x;
    this.pointer.prevY = y;

    // Wake up if paused
    if (this.isPaused) {
      this.resume();
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    this.onPointerMove(e);
  };

  private resizeTimeout: any = null;
  private onResizeDebounced = () => {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.resize();
    }, 150);
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else if (this.userSettingMultiplier > 0) {
      this.resume();
    }
  };

  public resize() {
    if (typeof window === "undefined" || !this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  private renderQuad() {
    const gl = this.gl!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  private getSpectrumColor(phase: number, speed: number): [number, number, number] {
    const count = this.spectrumStops.length;
    const scaled = (phase % 1) * count;
    const idx1 = Math.floor(scaled) % count;
    const idx2 = (idx1 + 1) % count;
    const frac = scaled - Math.floor(scaled);

    const c1 = this.spectrumStops[idx1];
    const c2 = this.spectrumStops[idx2];

    const tintR = c1[0] + (c2[0] - c1[0]) * frac;
    const tintG = c1[1] + (c2[1] - c1[1]) * frac;
    const tintB = c1[2] + (c2[2] - c1[2]) * frac;

    // Mix base smoke with spectrum tint
    const base = this.isDark ? this.config.dark.dyeBase : this.config.light.inkBase;
    const tintAmount = Math.min(0.55, this.config.spectrumTint * (0.8 + speed * 12));

    return [
      base[0] * (1 - tintAmount) + tintR * tintAmount,
      base[1] * (1 - tintAmount) + tintG * tintAmount,
      base[2] * (1 - tintAmount) + tintB * tintAmount,
    ];
  }

  private splat(x: number, y: number, dx: number, dy: number, color: [number, number, number]) {
    const gl = this.gl!;
    const aspectRatio = this.canvas.width / this.canvas.height;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Dynamic radius scaled by pointer flick speed
    const radius = this.config.splatRadius * (1.0 + Math.min(2.5, speed * 60));

    // Splat Velocity
    gl.useProgram(this.splatProgram.program);
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.splatProgram.uniforms.uAspectRatio, aspectRatio);
    gl.uniform2f(this.splatProgram.uniforms.uPoint, x, y);
    gl.uniform3f(
      this.splatProgram.uniforms.uColor,
      dx * this.config.splatForce,
      dy * this.config.splatForce,
      0.0
    );
    gl.uniform1f(this.splatProgram.uniforms.uRadius, radius);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.renderQuad();
    this.velocity.swap();

    // Splat Dye
    gl.uniform1i(this.splatProgram.uniforms.uTarget, this.density.read.attach(0));
    gl.uniform3f(this.splatProgram.uniforms.uColor, color[0], color[1], color[2]);
    gl.uniform1f(this.splatProgram.uniforms.uRadius, radius * 1.2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.density.write.fbo);
    gl.viewport(0, 0, this.density.width, this.density.height);
    this.renderQuad();
    this.density.swap();

    this.activeDyeEnergy = 1.0;
  }

  private stepSimulation(dt: number) {
    const gl = this.gl!;

    // 1. Curl
    gl.useProgram(this.curlProgram.program);
    gl.uniform2f(this.curlProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.curl.fbo);
    gl.viewport(0, 0, this.curl.width, this.curl.height);
    this.renderQuad();

    // 2. Vorticity Confinement
    gl.useProgram(this.vorticityProgram.program);
    gl.uniform2f(this.vorticityProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.vorticityProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.vorticityProgram.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.vorticityProgram.uniforms.uCurlStrength, this.config.curl);
    gl.uniform1f(this.vorticityProgram.uniforms.uDt, dt);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.renderQuad();
    this.velocity.swap();

    // 3. Divergence
    gl.useProgram(this.divergenceProgram.program);
    gl.uniform2f(this.divergenceProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.divergenceProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.divergence.fbo);
    gl.viewport(0, 0, this.divergence.width, this.divergence.height);
    this.renderQuad();

    // 4. Pressure Solve (Jacobi)
    gl.useProgram(this.pressureProgram.program);
    gl.uniform2f(this.pressureProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.pressureProgram.uniforms.uDivergence, this.divergence.attach(1));
    const iterations = this.adaptiveDegraded ? 10 : this.config.pressureIterations;
    for (let i = 0; i < iterations; i++) {
      gl.uniform1i(this.pressureProgram.uniforms.uPressure, this.pressure.read.attach(0));
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pressure.write.fbo);
      gl.viewport(0, 0, this.pressure.width, this.pressure.height);
      this.renderQuad();
      this.pressure.swap();
    }

    // 5. Gradient Subtract
    gl.useProgram(this.gradSubtractProgram.program);
    gl.uniform2f(this.gradSubtractProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.gradSubtractProgram.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.gradSubtractProgram.uniforms.uVelocity, this.velocity.read.attach(1));
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.renderQuad();
    this.velocity.swap();

    // 6. Velocity Advection
    gl.useProgram(this.advectionProgram.program);
    gl.uniform2f(this.advectionProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.velocity.read.attach(0));
    gl.uniform1f(this.advectionProgram.uniforms.uDt, dt);
    gl.uniform1f(this.advectionProgram.uniforms.uDissipation, this.config.velocityDissipation);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.renderQuad();
    this.velocity.swap();

    // 7. Dye Advection
    gl.uniform2f(this.advectionProgram.uniforms.uTexelSize, this.velocity.read.texelSizeX, this.velocity.read.texelSizeY);
    gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.advectionProgram.uniforms.uSource, this.density.read.attach(1));
    gl.uniform1f(this.advectionProgram.uniforms.uDissipation, this.config.dyeDissipation);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.density.write.fbo);
    gl.viewport(0, 0, this.density.width, this.density.height);
    this.renderQuad();
    this.density.swap();

    this.activeDyeEnergy *= this.config.dyeDissipation;
  }

  private renderDisplay() {
    const gl = this.gl!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const effectiveOpacity =
      this.config.maxOpacity *
      this.routeIntensity *
      this.suppressionGain *
      this.userSettingMultiplier *
      (this.isDark ? this.config.dark.opacityMult : this.config.light.opacityMult);

    if (effectiveOpacity <= 0.001) return;

    gl.useProgram(this.displayProgram.program);
    gl.uniform1i(this.displayProgram.uniforms.uDye, this.density.read.attach(0));
    gl.uniform1f(this.displayProgram.uniforms.uOpacity, effectiveOpacity);
    gl.uniform1f(this.displayProgram.uniforms.uIsDark, this.isDark ? 1.0 : 0.0);

    this.renderQuad();
  }

  // 2D Fallback Render Step
  private update2DFallback(dt: number) {
    if (!this.ctx2D) return;
    const ctx = this.ctx2D;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.pointer.moved && this.pointer.speed > 0.0005) {
      const rect = this.canvas.getBoundingClientRect();
      const px = this.pointer.x * rect.width;
      const py = (1.0 - this.pointer.y) * rect.height;

      this.colorPhase += 0.04;
      const rgb = this.getSpectrumColor(this.colorPhase, this.pointer.speed);
      const colorStr = `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}`;

      this.particles2D.push({
        x: px,
        y: py,
        vx: this.pointer.deltaX * 350,
        vy: -this.pointer.deltaY * 350,
        radius: 18 + this.pointer.speed * 200,
        alpha: 0.35 * this.routeIntensity * this.suppressionGain * this.userSettingMultiplier,
        decay: 0.016,
        color: colorStr,
      });

      this.activeDyeEnergy = 1.0;
    }

    for (let i = this.particles2D.length - 1; i >= 0; i--) {
      const p = this.particles2D[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.radius += 24 * dt;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles2D.splice(i, 1);
        continue;
      }

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, `${p.color}, ${p.alpha})`);
      grad.addColorStop(0.5, `${p.color}, ${p.alpha * 0.4})`);
      grad.addColorStop(1, `${p.color}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.particles2D.length === 0 && !this.pointer.moved) {
      this.activeDyeEnergy = 0;
    }
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;

    if (!this.lastTime) this.lastTime = time;
    const dt = Math.min((time - this.lastTime) / 1000, 0.033);
    this.lastTime = time;

    // Adaptive Performance Monitor (first 60 frames)
    if (this.frameCount < 60) {
      this.frameCount++;
      this.frameTimeSum += dt;
      if (this.frameCount === 60) {
        const avgFrameMs = (this.frameTimeSum / 60) * 1000;
        if (avgFrameMs > 20) {
          this.adaptiveDegraded = true;
        }
      }
    }

    // Smooth route intensity transition
    this.routeIntensity += (this.targetRouteIntensity - this.routeIntensity) * 0.1;

    if (this.gl) {
      // Splat on pointer movement
      if (this.pointer.moved && this.pointer.speed > 0.0005) {
        this.colorPhase += 0.02 + this.pointer.speed * 0.5;
        const color = this.getSpectrumColor(this.colorPhase, this.pointer.speed);
        this.splat(this.pointer.x, this.pointer.y, this.pointer.deltaX, this.pointer.deltaY, color);
        this.pointer.moved = false;
      }

      this.stepSimulation(dt);
      this.renderDisplay();
    } else if (this.ctx2D) {
      this.update2DFallback(dt);
    }

    // Idle Pause Check: Stop RAF when dye has decayed and mouse is idle
    if (!this.pointer.moved && this.activeDyeEnergy < this.config.idlePauseThreshold) {
      this.pause();
      return;
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public pause() {
    this.isPaused = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public resume() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.activeDyeEnergy = 1.0;
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  public destroy() {
    this.isRunning = false;
    this.pause();

    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerdown", this.onPointerDown);
      window.removeEventListener("resize", this.onResizeDebounced);
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    if (this.gl) {
      const gl = this.gl;
      if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
      // Clean up WebGL resources
      const deleteFBO = (f: FBO) => {
        if (f.texture) gl.deleteTexture(f.texture);
        if (f.fbo) gl.deleteFramebuffer(f.fbo);
      };
      const deleteDoubleFBO = (df: DoubleFBO) => {
        deleteFBO(df.read);
        deleteFBO(df.write);
      };
      if (this.density) deleteDoubleFBO(this.density);
      if (this.velocity) deleteDoubleFBO(this.velocity);
      if (this.pressure) deleteDoubleFBO(this.pressure);
      if (this.divergence) deleteFBO(this.divergence);
      if (this.curl) deleteFBO(this.curl);
    }
  }
}
