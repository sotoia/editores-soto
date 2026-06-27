"use client";
import { useEffect, useRef } from "react";

const PARAMS = {
  speed: 0.24,
  scale: 0.82,
  turbAmp: 1.50,
  turbFreq: 0.88,
  turbIter: 5,
  waveFreq: 1.73,
  jellify: 1.0,
  distBias: 0.21,
  grainAmount: 0.10,
  contrast: 1.31,
  saturation: 1.50,
  exposure: 0.71,
  seed: 50.55,
};

// Palette (normalized 0..1): #000, #2B2B2B, #454545, #212121
const PALETTE = [
  [0/255,   0/255,   0/255],
  [43/255,  43/255,  43/255],
  [69/255,  69/255,  69/255],
  [33/255,  33/255,  33/255],
];

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform float u_time;
uniform float u_speed;
uniform float u_scale;
uniform float u_turbAmp;
uniform float u_turbFreq;
uniform float u_waveFreq;
uniform float u_jellify;
uniform float u_distBias;
uniform float u_grainAmount;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_exposure;
uniform float u_seed;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

// Simplex-ish noise (cheap)
vec2 hash(vec2 p){
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float noise(in vec2 p){
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x+p.y)*K1);
  vec2 a = p - i + (i.x+i.y)*K2;
  vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0*K2;
  vec3 h = max(0.5 - vec3(dot(a,a),dot(b,b),dot(c,c)), 0.0);
  vec3 n = h*h*h*h * vec3(dot(a,hash(i)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p, int iter){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<8;i++){
    if(i>=iter) break;
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec3 mixPalette(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 a = mix(u_c0, u_c1, smoothstep(0.0, 0.33, t));
  vec3 b = mix(a, u_c2, smoothstep(0.33, 0.66, t));
  return mix(b, u_c3, smoothstep(0.66, 1.0, t));
}

vec3 grade(vec3 c){
  // exposure
  c *= u_exposure * 1.5;
  // contrast
  c = (c - 0.5) * u_contrast + 0.5;
  // saturation
  float g = dot(c, vec3(0.299,0.587,0.114));
  c = mix(vec3(g), c, u_saturation);
  return clamp(c, 0.0, 1.0);
}

void main(){
  vec2 uv = (v_uv - 0.5);
  uv.x *= u_res.x / u_res.y;
  vec2 p = uv / u_scale + vec2(u_seed*0.137, u_seed*0.091);

  float t = u_time * u_speed;
  vec2 flow = vec2(
    fbm(p*u_turbFreq + vec2(t, 0.0), 5),
    fbm(p*u_turbFreq + vec2(0.0, t), 5)
  ) * u_turbAmp;

  vec2 jelly = vec2(
    sin(p.y*u_waveFreq + t*1.7),
    cos(p.x*u_waveFreq + t*1.3)
  ) * 0.15 * u_jellify;

  vec2 q = p + flow + jelly;
  float field = fbm(q, 5) * 0.5 + 0.5;
  field += u_distBias * (uv.y);
  field = clamp(field, 0.0, 1.0);

  vec3 col = mixPalette(field);
  col = grade(col);

  // grain
  float n = fract(sin(dot(v_uv*u_res, vec2(12.9898,78.233)) + u_time)*43758.5453);
  col += (n - 0.5) * u_grainAmount;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || "shader compile error");
  }
  return s;
}

export default function LiquidGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("u_res");
    const uTime = u("u_time");

    gl.uniform1f(u("u_speed"), PARAMS.speed);
    gl.uniform1f(u("u_scale"), PARAMS.scale);
    gl.uniform1f(u("u_turbAmp"), PARAMS.turbAmp);
    gl.uniform1f(u("u_turbFreq"), PARAMS.turbFreq);
    gl.uniform1f(u("u_waveFreq"), PARAMS.waveFreq);
    gl.uniform1f(u("u_jellify"), PARAMS.jellify);
    gl.uniform1f(u("u_distBias"), PARAMS.distBias);
    gl.uniform1f(u("u_grainAmount"), PARAMS.grainAmount);
    gl.uniform1f(u("u_contrast"), PARAMS.contrast);
    gl.uniform1f(u("u_saturation"), PARAMS.saturation);
    gl.uniform1f(u("u_exposure"), PARAMS.exposure);
    gl.uniform1f(u("u_seed"), PARAMS.seed);
    gl.uniform3fv(u("u_c0"), new Float32Array(PALETTE[0]));
    gl.uniform3fv(u("u_c1"), new Float32Array(PALETTE[1]));
    gl.uniform3fv(u("u_c2"), new Float32Array(PALETTE[2]));
    gl.uniform3fv(u("u_c3"), new Float32Array(PALETTE[3]));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-screen h-screen"
      aria-hidden
    />
  );
}
