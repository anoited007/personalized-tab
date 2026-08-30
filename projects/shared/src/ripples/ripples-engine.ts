/**
 * WebGL water-ripple effect for a full-cover background image.
 *
 * A framework-free TypeScript port of sirxemic/jquery.ripples (MIT) —
 * https://github.com/sirxemic/jquery.ripples — with the jQuery wrapper,
 * generic CSS background-position/size parsing, and background-attachment
 * handling stripped out, since this app always renders the image as a
 * `center / cover` background on the host element itself. The ripple
 * physics/shaders (drop, update, render programs) are unchanged.
 */

interface GlConfig {
  type: number;
  arrayType: (new (length: number) => ArrayLike<number>) | null;
  linearSupport: boolean;
  extensions: string[];
}

interface GlProgram {
  id: WebGLProgram;
  uniforms: Record<string, Float32Array>;
  locations: Record<string, WebGLUniformLocation | null>;
}

function loadConfig(): GlConfig | null {
  const canvas = document.createElement('canvas');
  const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  if (!gl) return null;

  const extensionNames = [
    'OES_texture_float',
    'OES_texture_half_float',
    'OES_texture_float_linear',
    'OES_texture_half_float_linear',
  ] as const;
  const extensions: Record<string, unknown> = {};
  for (const name of extensionNames) {
    const ext = gl.getExtension(name);
    if (ext) extensions[name] = ext;
  }
  if (!extensions['OES_texture_float']) return null;

  function createConfig(type: string, glType: number, arrayType: GlConfig['arrayType']): GlConfig {
    const name = `OES_texture_${type}`;
    const nameLinear = `${name}_linear`;
    const linearSupport = nameLinear in extensions;
    return { type: glType, arrayType, linearSupport, extensions: linearSupport ? [name, nameLinear] : [name] };
  }

  const configs: GlConfig[] = [createConfig('float', gl.FLOAT, Float32Array)];
  const halfFloat = extensions['OES_texture_half_float'] as { HALF_FLOAT_OES: number } | undefined;
  if (halfFloat) {
    // Array type should be Uint16Array, but that breaks on at least iOS — init with null data instead.
    configs.push(createConfig('half_float', halfFloat.HALF_FLOAT_OES, null));
  }

  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  for (const candidate of configs) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, candidate.type, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) return candidate;
  }
  return null;
}

const VERTEX_SHADER = `
  attribute vec2 vertex;
  varying vec2 coord;
  void main() {
    coord = vertex * 0.5 + 0.5;
    gl_Position = vec4(vertex, 0.0, 1.0);
  }
`;

const DROP_FRAGMENT_SHADER = `
  precision highp float;
  const float PI = 3.141592653589793;
  uniform sampler2D texture;
  uniform vec2 center;
  uniform float radius;
  uniform float strength;
  varying vec2 coord;
  void main() {
    vec4 info = texture2D(texture, coord);
    float drop = max(0.0, 1.0 - length(center * 0.5 + 0.5 - coord) / radius);
    drop = 0.5 - cos(drop * PI) * 0.5;
    info.r += drop * strength;
    gl_FragColor = info;
  }
`;

const UPDATE_FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D texture;
  uniform vec2 delta;
  varying vec2 coord;
  void main() {
    vec4 info = texture2D(texture, coord);
    vec2 dx = vec2(delta.x, 0.0);
    vec2 dy = vec2(0.0, delta.y);
    float average = (
      texture2D(texture, coord - dx).r +
      texture2D(texture, coord - dy).r +
      texture2D(texture, coord + dx).r +
      texture2D(texture, coord + dy).r
    ) * 0.25;
    info.g += (average - info.r) * 2.0;
    info.g *= 0.995;
    info.r += info.g;
    gl_FragColor = info;
  }
`;

const RENDER_VERTEX_SHADER = `
  precision highp float;
  attribute vec2 vertex;
  uniform vec2 topLeft;
  uniform vec2 bottomRight;
  uniform vec2 containerRatio;
  varying vec2 ripplesCoord;
  varying vec2 backgroundCoord;
  void main() {
    backgroundCoord = mix(topLeft, bottomRight, vertex * 0.5 + 0.5);
    backgroundCoord.y = 1.0 - backgroundCoord.y;
    ripplesCoord = vec2(vertex.x, -vertex.y) * containerRatio * 0.5 + 0.5;
    gl_Position = vec4(vertex.x, -vertex.y, 0.0, 1.0);
  }
`;

const RENDER_FRAGMENT_SHADER = `
  precision highp float;
  uniform sampler2D samplerBackground;
  uniform sampler2D samplerRipples;
  uniform vec2 delta;
  uniform float perturbance;
  varying vec2 ripplesCoord;
  varying vec2 backgroundCoord;
  void main() {
    float height = texture2D(samplerRipples, ripplesCoord).r;
    float heightX = texture2D(samplerRipples, vec2(ripplesCoord.x + delta.x, ripplesCoord.y)).r;
    float heightY = texture2D(samplerRipples, vec2(ripplesCoord.x, ripplesCoord.y + delta.y)).r;
    vec3 dx = vec3(delta.x, heightX - height, 0.0);
    vec3 dy = vec3(0.0, heightY - height, delta.y);
    vec2 offset = -normalize(cross(dy, dx)).xz;
    float specular = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);
    gl_FragColor = texture2D(samplerBackground, backgroundCoord + offset * perturbance) + specular;
  }
`;

export interface RipplesOptions {
  resolution?: number;
  dropRadius?: number;
  perturbance?: number;
}

/** True if this browser can run the ripple effect at all. */
export function ripplesSupported(): boolean {
  return loadConfig() !== null;
}

export class RipplesEngine {
  private readonly resolution: number;
  private readonly dropRadius: number;
  private perturbance: number;
  private readonly textureDelta: Float32Array;

  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly config: GlConfig;

  private readonly textures: WebGLTexture[] = [];
  private readonly framebuffers: WebGLFramebuffer[] = [];
  private bufferWriteIndex = 0;
  private bufferReadIndex = 1;

  private readonly quad: WebGLBuffer;
  private dropProgram!: GlProgram;
  private updateProgram!: GlProgram;
  private renderProgram!: GlProgram;
  private readonly backgroundTexture: WebGLTexture;

  // 1x1 until the real image loads, matching the placeholder texture above.
  private backgroundWidth = 1;
  private backgroundHeight = 1;

  private running = true;
  private destroyed = false;
  private rafId?: number;

  constructor(
    private readonly host: HTMLElement,
    imageUrl: string,
    options: RipplesOptions = {},
  ) {
    const config = loadConfig();
    if (!config) throw new Error('WebGL ripple effect is not supported in this browser.');
    this.config = config;

    this.resolution = options.resolution ?? 256;
    this.dropRadius = options.dropRadius ?? 20;
    this.perturbance = options.perturbance ?? 0.012;
    this.textureDelta = new Float32Array([1 / this.resolution, 1 / this.resolution]);

    const canvas = document.createElement('canvas');
    canvas.width = host.clientWidth;
    canvas.height = host.clientHeight;
    canvas.className = 'ripples-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.prepend(canvas);
    this.canvas = canvas;

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
    this.gl = gl;
    for (const name of config.extensions) gl.getExtension(name);

    const arrayType = config.arrayType;
    const textureData = arrayType ? new arrayType(this.resolution * this.resolution * 4) : null;

    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture()!;
      const framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, config.linearSupport ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, config.linearSupport ? gl.LINEAR : gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this.resolution,
        this.resolution,
        0,
        gl.RGBA,
        config.type,
        textureData as ArrayBufferView | null,
      );
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      this.textures.push(texture);
      this.framebuffers.push(framebuffer);
    }

    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);

    this.initShaders();

    this.backgroundTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Transparent placeholder so the texture is complete (and render() has
    // something valid to sample) for the few frames before the real image
    // finishes loading.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

    gl.clearColor(0, 0, 0, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.loadImage(imageUrl);
    this.loop();
  }

  /** Registers a ripple centered at host-element-relative pixel coordinates. */
  drop(x: number, y: number, radius: number, strength: number): void {
    if (this.destroyed) return;
    const gl = this.gl;
    const elWidth = this.host.clientWidth;
    const elHeight = this.host.clientHeight;
    const longestSide = Math.max(elWidth, elHeight);
    const normalizedRadius = radius / longestSide;

    const dropPosition = new Float32Array([(2 * x - elWidth) / longestSide, (elHeight - 2 * y) / longestSide]);

    gl.viewport(0, 0, this.resolution, this.resolution);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex]);
    this.bindTexture(this.textures[this.bufferReadIndex]);

    gl.useProgram(this.dropProgram.id);
    gl.uniform2fv(this.dropProgram.locations['center'], dropPosition);
    gl.uniform1f(this.dropProgram.locations['radius'], normalizedRadius);
    gl.uniform1f(this.dropProgram.locations['strength'], strength);
    this.drawQuad();
    this.swapBufferIndices();
  }

  /** How much a ripple visibly distorts the image — safe to change at any time. */
  setPerturbance(perturbance: number): void {
    this.perturbance = perturbance;
  }

  updateSize(): void {
    const width = this.host.clientWidth;
    const height = this.host.clientHeight;
    if (width !== this.canvas.width || height !== this.canvas.height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  pause(): void {
    this.running = false;
  }

  play(): void {
    this.running = true;
  }

  destroy(): void {
    this.destroyed = true;
    if (this.rafId !== undefined) cancelAnimationFrame(this.rafId);
    this.canvas.remove();
  }

  private loop(): void {
    const step = () => {
      if (this.destroyed) return;
      if (this.running) this.step();
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  private step(): void {
    this.computeTextureBoundaries();
    this.update();
    this.render();
  }

  private drawQuad(): void {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  private bindTexture(texture: WebGLTexture, unit = 0): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  private render(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.enable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.renderProgram.id);

    this.bindTexture(this.backgroundTexture, 0);
    this.bindTexture(this.textures[0], 1);

    gl.uniform1f(this.renderProgram.locations['perturbance'], this.perturbance);
    gl.uniform2fv(this.renderProgram.locations['topLeft'], this.renderProgram.uniforms['topLeft']);
    gl.uniform2fv(this.renderProgram.locations['bottomRight'], this.renderProgram.uniforms['bottomRight']);
    gl.uniform2fv(this.renderProgram.locations['containerRatio'], this.renderProgram.uniforms['containerRatio']);
    gl.uniform1i(this.renderProgram.locations['samplerBackground'], 0);
    gl.uniform1i(this.renderProgram.locations['samplerRipples'], 1);

    this.drawQuad();
    gl.disable(gl.BLEND);
  }

  private update(): void {
    const gl = this.gl;
    gl.viewport(0, 0, this.resolution, this.resolution);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[this.bufferWriteIndex]);
    this.bindTexture(this.textures[this.bufferReadIndex]);
    gl.useProgram(this.updateProgram.id);
    this.drawQuad();
    this.swapBufferIndices();
  }

  private swapBufferIndices(): void {
    this.bufferWriteIndex = 1 - this.bufferWriteIndex;
    this.bufferReadIndex = 1 - this.bufferReadIndex;
  }

  /** Assumes the image is rendered as a `center / cover` background of `host`. */
  private computeTextureBoundaries(): void {
    const containerWidth = this.host.clientWidth;
    const containerHeight = this.host.clientHeight;

    const scale = Math.max(containerWidth / this.backgroundWidth, containerHeight / this.backgroundHeight);
    const backgroundWidth = this.backgroundWidth * scale;
    const backgroundHeight = this.backgroundHeight * scale;
    const backgroundX = (containerWidth - backgroundWidth) / 2;
    const backgroundY = (containerHeight - backgroundHeight) / 2;

    const topLeft = new Float32Array([-backgroundX / backgroundWidth, -backgroundY / backgroundHeight]);
    const bottomRight = new Float32Array([
      topLeft[0] + containerWidth / backgroundWidth,
      topLeft[1] + containerHeight / backgroundHeight,
    ]);

    const maxSide = Math.max(this.canvas.width, this.canvas.height);
    const containerRatio = new Float32Array([this.canvas.width / maxSide, this.canvas.height / maxSide]);

    this.renderProgram.uniforms['topLeft'] = topLeft;
    this.renderProgram.uniforms['bottomRight'] = bottomRight;
    this.renderProgram.uniforms['containerRatio'] = containerRatio;
  }

  private initShaders(): void {
    this.dropProgram = this.createProgram(VERTEX_SHADER, DROP_FRAGMENT_SHADER);
    this.updateProgram = this.createProgram(VERTEX_SHADER, UPDATE_FRAGMENT_SHADER);
    this.gl.uniform2fv(this.updateProgram.locations['delta'], this.textureDelta);

    this.renderProgram = this.createProgram(RENDER_VERTEX_SHADER, RENDER_FRAGMENT_SHADER);
    this.gl.uniform2fv(this.renderProgram.locations['delta'], this.textureDelta);
  }

  private createProgram(vertexSource: string, fragmentSource: string): GlProgram {
    const gl = this.gl;

    function compile(type: number, source: string): WebGLShader {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Ripple shader compile error: ${info}`);
      }
      return shader;
    }

    const id = gl.createProgram()!;
    gl.attachShader(id, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(id, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(id);
    if (!gl.getProgramParameter(id, gl.LINK_STATUS)) {
      throw new Error(`Ripple program link error: ${gl.getProgramInfoLog(id)}`);
    }

    gl.useProgram(id);
    gl.enableVertexAttribArray(0);

    const locations: Record<string, WebGLUniformLocation | null> = {};
    const shaderCode = vertexSource + fragmentSource;
    const regex = /uniform (\w+) (\w+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(shaderCode)) !== null) {
      locations[match[2]] = gl.getUniformLocation(id, match[2]);
    }

    return { id, uniforms: {}, locations };
  }

  private loadImage(imageUrl: string): void {
    const gl = this.gl;
    const image = new Image();
    image.onload = () => {
      if (this.destroyed) return;
      const isPowerOfTwo = (x: number) => (x & (x - 1)) === 0;
      const wrapping = isPowerOfTwo(image.width) && isPowerOfTwo(image.height) ? gl.REPEAT : gl.CLAMP_TO_EDGE;

      gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapping);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapping);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      this.backgroundWidth = image.width;
      this.backgroundHeight = image.height;
    };
    image.src = imageUrl;
  }
}
