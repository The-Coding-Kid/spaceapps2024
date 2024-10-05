"use client";

import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function Home() {
  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Set background color to black
    document.body.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Dynamic vertex shader
    const vertexShader = `
      uniform float time;
      uniform float scale;

      varying vec3 vTexCoord3D;

      void main(void) {
        vTexCoord3D = scale * (position.xyz + vec3(time, time, time));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    // Noise-grainy fragment shader
    const fragmentShader = `
      varying vec3 vTexCoord3D;

      uniform float highTemp;
      uniform float lowTemp;
      uniform float time;

      vec4 permute(vec4 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 1.0 / 7.0;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      const int octaves = 4;

      float noise(vec3 position, float frequency, float persistence) {
        float total = 0.0;
        float maxAmplitude = 0.0;
        float amplitude = 1.0;
        for (int i = 0; i < octaves; i++) {
          total += snoise(position * frequency) * amplitude;
          frequency *= 2.0;
          maxAmplitude += amplitude;
          amplitude *= persistence;
        }
        return total / maxAmplitude;
      }

      void main(void) {
        float noiseBase = (noise(vTexCoord3D, 0.40, 0.7) + 1.0) / 2.0;

        float frequency = 0.04;
        float t1 = snoise(vTexCoord3D * frequency) * 2.7 - 1.9;
        float brightNoise = snoise(vTexCoord3D * 0.02) * 1.4 - 0.9;

        float ss = max(0.0, t1);
        float brightSpot = max(0.0, brightNoise);
        float total = noiseBase - ss + brightSpot;

        float temp = (highTemp * total + (1.0 - total) * lowTemp);

        float i = (temp - 800.0) * 0.035068;

        bool rbucket1 = i < 60.0;
        bool rbucket2 = i >= 60.0 && i < 236.0;
        bool rbucket3 = i >= 236.0 && i < 288.0;
        bool rbucket4 = i >= 288.0 && i < 377.0;
        bool rbucket5 = i >= 377.0 && i < 511.0;
        bool rbucket6 = i >= 511.0;

        bool gbucket1 = i < 60.0;
        bool gbucket2 = i >= 60.0 && i < 103.0;
        bool gbucket3 = i >= 103.0 && i < 133.0;
        bool gbucket4 = i >= 133.0 && i < 174.0;
        bool gbucket5 = i >= 174.0 && i < 236.0;
        bool gbucket6 = i >= 236.0 && i < 286.0;
        bool gbucket7 = i >= 286.0 && i < 367.0;
        bool gbucket8 = i >= 367.0 && i < 511.0;
        bool gbucket9 = i >= 511.0;

        bool bbucket1 = i < 103.0;
        bool bbucket2 = i >= 103.0 && i < 133.0;
        bool bbucket3 = i >= 133.0 && i < 173.0;
        bool bbucket4 = i >= 173.0 && i < 231.0;
        bool bbucket5 = i >= 231.0;

        float r =
          float(rbucket1) * (0.0 + i * 4.25) +
          float(rbucket2) * (255.0) +
          float(rbucket3) * (255.0 + (i - 236.0) * -2.442) +
          float(rbucket4) * (128.0 + (i - 288.0) * -0.764) +
          float(rbucket5) * (60.0 + (i - 377.0) * -0.4477) +
          float(rbucket6) * 0.0;

        float g =
          float(gbucket1) * (0.0) +
          float(gbucket2) * (0.0 + (i - 60.0) * 2.3255) +
          float(gbucket3) * (100.0 + (i - 103.0) * 4.433) +
          float(gbucket4) * (233.0 + (i - 133.0) * 0.53658) +
          float(gbucket5) * (255.0) +
          float(gbucket6) * (255.0 + (i - 236.0) * -1.24) +
          float(gbucket7) * (193.0 + (i - 286.0) * -0.7901) +
          float(gbucket8) * (129.0 + (i - 367.0) * -0.45138) +
          float(gbucket9) * (64.0 + (i - 511.0) * -0.06237);

        float b =
          float(bbucket1) * 0.0 +
          float(bbucket2) * (0.0 + (i - 103.0) * 7.0333) +
          float(bbucket3) * (211.0 + (i - 133.0) * 0.9) +
          float(bbucket4) * (247.0 + (i - 173.0) * 0.1379) +
          float(bbucket5) * 255.0;

        gl_FragColor = vec4(vec3(r / 255.0, g / 255.0, b / 255.0), 1.0);
      }
    `;

    // Example star data
    const starData = {
      temperatureEstimate: {
        value: {
          quantity: 4500.0 // Example temperature value for an orange star
        }
      }
    };

    // Add a sun to the scene with shaders
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32); // Increased size
    const sunMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        scale: { value: 1.0 },
        highTemp: { type: "f", value: starData.temperatureEstimate.value.quantity },
        lowTemp: { type: "f", value: starData.temperatureEstimate.value.quantity / 4 },
        time: { value: 0.0 }
      }
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0); // Center the sun
    scene.add(sun);

    camera.position.z = 10; // Adjusted camera position

    // Animation loop
    const animate = function () {
      requestAnimationFrame(animate);

      sun.rotation.y += 0.01; // Rotate the sun for some animation
      sunMaterial.uniforms.time.value += 0.01; // Update time uniform

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Clean up on component unmount
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
}
