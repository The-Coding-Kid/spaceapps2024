"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SearchBar from "./components/SearchBar";
import Shader from "./components/Shader";

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

  return (
    <div>
      <SearchBar />
    </div>
  );
}
