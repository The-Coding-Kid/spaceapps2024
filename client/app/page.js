"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SearchBar from "./components/SearchBar";
import Shader from "./components/Shader";
import QuickActions from "./components/QuickActions";
import Navbar from "./components/Navbar";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import Title from "./components/Title";

const RA = [];
const azimuth = [];

for (let i = 0; i < 100; i++) {
  RA.push(Math.PI * (Math.random() - 0.5));
}
for (let i = 0; i < 100; i++) {
  azimuth.push(2 * Math.PI * Math.random());
}

const R = 1000;

export default function Home() {
  useEffect(() => {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Set background color to black
    document.body.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    // if zoom is above a limit turn it off
    controls.maxDistance = 100;
    controls.enableZoom = true;

    // Dynamic vertex shader
    const vertexShader = Shader.vertexShader;

    // Noise-grainy fragment shader
    const fragmentShader = Shader.fragmentShader;

    // Example star data
    const starData = {
      temperatureEstimate: {
        value: {
          quantity: 4500.0, // Example temperature value for an orange star
        },
      },
    };

    // Add a sun to the scene with shaders
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32); // Increased size
    const sunMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        scale: { value: 1.0 },
        highTemp: {
          type: "f",
          value: starData.temperatureEstimate.value.quantity,
        },
        lowTemp: {
          type: "f",
          value: starData.temperatureEstimate.value.quantity / 4,
        },
        time: { value: 0.0 },
      },
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0); // Center the sun
    scene.add(sun);

    // Set the camera to a top-down view
    camera.position.set(0, 50, 0); // Position the camera above the scene
    camera.lookAt(0, 0, 0); // Point the camera at the center of the scene

    function Generate_Star(x, y, z) {
      const geometry = new THREE.SphereGeometry(3 * Math.random(), 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const star = new THREE.Mesh(geometry, material);
      star.position.set(x, y, z);
      scene.add(star);
    }

    for (let i = 0; i < 100; i++) {
      const x = R * Math.cos(RA[i]) * Math.cos(azimuth[i]);
      const y = R * Math.cos(RA[i]) * Math.sin(azimuth[i]);
      const z = R * Math.sin(RA[i]);
      Generate_Star(x, y, z);
    }

    function Generate_exoplanet(a) {
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x085e53,
      });
      const exoplanet = new THREE.Mesh(geometry, material);
      scene.add(exoplanet);
      exoplanet.position.set(a,0,0);
      return exoplanet;
    }

    const exoplanet = Generate_exoplanet(25); // Example semi-major (and eccentricity)

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      3, // strength
      0.4, // radius
      0.85 // threshold
    );
    composer.addPass(bloomPass);

    // Create trail geometry
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x929292 });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    const maxTrailLength = 100; // Maximum number of points in the trail
    const trailPositions = new Float32Array(maxTrailLength * 3); // 3 coordinates per point
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    let trailIndex = 0;

    // Animation loop
    let t = 0;
    let k = 0;
    
    const animate = function () {
      requestAnimationFrame(animate);

      sun.rotation.y += 0.01; // Rotate the sun for some animation
      sunMaterial.uniforms.time.value += 0.01; // Update time uniform

      // Update exoplanet position
      var T_orb = 2; // Example orbital period
      var e = 0.5
      var a = 25
      var b = a * (Math.sqrt(1-(Math.pow(e,2))))
      var M = ((2*Math.PI)/T_orb)*t;
      k = Math.sqrt(Math.pow(exoplanet.position.x,2)+Math.pow(exoplanet.position.z,2))
      sun.position.set(e*a, 0, 0); 
      exoplanet.position.x = a * Math.cos(M);
      exoplanet.position.z = b * Math.sin(M);
      exoplanet.position.y = 0;

      // Update trail
      trailPositions.copyWithin(3, 0, (maxTrailLength - 1) * 3);
      trailPositions.set([exoplanet.position.x, exoplanet.position.y, exoplanet.position.z], 0);
      trailGeometry.attributes.position.needsUpdate = true;

      t += 0.25/k; // Increment time

      controls.update();

      composer.render();
    };

    animate();

    // Clean up on component unmount
    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <Title />
      <Navbar />
      <QuickActions />
      <SearchBar />
    </div>
  );
}
