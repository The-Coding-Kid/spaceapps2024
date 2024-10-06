//1 unit = 1 AU
"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SearchBar from "./components/SearchBar";
import Shader from "./components/Shader";
import QuickActions from "./components/QuickActions";
import Navbar from "./components/Navbar";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import Title from "./components/Title";

const RA = [];
const azimuth = [];
let abs_mag = [];
let distances = [];
const N = 300;

//import these from backend
const R_pl = 1;
const R_st = 0.1;

for (let i = 0; i < N; i++) {
  abs_mag[i] = 6 * (Math.random() - 0.5);
}
for (let i = 0; i < N; i++) {
  RA.push(Math.PI * (Math.random() - 0.5));
}
for (let i = 0; i < N; i++) {
  azimuth.push(2 * Math.PI * Math.random());
}
for (let i = 0; i < N; i++) {
  distances.push(10 + 390 * Math.random());
}

//apparent magnitudes
let brightness = [];

for (let i = 0; i < N; i++) {
  brightness.push(Math.pow(10, -0.4 * abs_mag[i]) / Math.pow(distances[i], 2));
}

const R = 700;

export default function Home() {
  const [selectedStars, setSelectedStars] = useState([]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxDistance = 150;
    controls.enableZoom = true;

    const vertexShader = Shader.vertexShader;
    const fragmentShader = Shader.fragmentShader;

    const starData = {
      temperatureEstimate: {
        value: {
          quantity: 4500.0,
        },
      },
    };

    const sunGeometry = new THREE.SphereGeometry(R_st*215, 32, 32);
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
    sun.position.set(0, 0, 0);
    scene.add(sun);

    camera.position.set(0, 50, 0);
    camera.lookAt(0, 0, 0);

    const stars = [];
    const starOutlines = [];

    function Generate_Star(x, y, z, B) {
      const geometry = new THREE.SphereGeometry(60 * Math.sqrt(B), 32, 32); // Increase hitbox size
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const star = new THREE.Mesh(geometry, material);
      star.position.set(x, y, z);
      scene.add(star);
      stars.push(star);

      const outlineGeometry = new THREE.SphereGeometry(6, 32, 32);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.BackSide,
      });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outline.position.set(x, y, z);
      outline.visible = false;
      scene.add(outline);
      starOutlines.push(outline);
    }

    for (let i = 0; i < N; i++) {
      const x = R * Math.cos(RA[i]) * Math.cos(azimuth[i]);
      const y = R * Math.cos(RA[i]) * Math.sin(azimuth[i]);
      const z = R * Math.sin(RA[i]);
      Generate_Star(x, y, z, brightness[i]);
    }

    function Generate_exoplanet(a) {
      const geometry = new THREE.SphereGeometry(R_pl, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x085e53,
      });
      const exoplanet = new THREE.Mesh(geometry, material);
      scene.add(exoplanet);
      exoplanet.position.set(a, 0, 0);
      return exoplanet;
    }

    const exoplanet = Generate_exoplanet(25);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      3,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x929292 });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    const maxTrailLength = 100;
    const trailPositions = new Float32Array(maxTrailLength * 3);
    trailGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(trailPositions, 3)
    );

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x69ff9b });
    const constellationLines = [];

    function drawLine(start, end) {
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      constellationLines.push(line);
    }

    function onStarClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.params.Points.threshold = 5; // Increase hitbox size
      raycaster.params.Points.threshold = 10; // Increase hitbox size

      const intersects = raycaster.intersectObjects(stars);
      if (intersects.length > 0) {
        const selectedStar = intersects[0].object;
        setSelectedStars((prevSelectedStars) => {
          const newSelectedStars = [...prevSelectedStars, selectedStar];
          if (newSelectedStars.length === 2) {
            drawLine(
              newSelectedStars[0].position,
              newSelectedStars[1].position
            );
            return [];
          }
          return newSelectedStars;
        });

        // Outline the selected star
        const index = stars.indexOf(selectedStar);
        if (index !== -1) {
          starOutlines[index].visible = true;
          setTimeout(() => {
            starOutlines[index].visible = false;
          }, 1000); // Hide outline after 1 second
        }
      }

      const lineIntersects = raycaster.intersectObjects(constellationLines);
      if (lineIntersects.length > 0) {
        const selectedLine = lineIntersects[0].object;
        scene.remove(selectedLine);
        constellationLines.splice(constellationLines.indexOf(selectedLine), 1);
      }
    }

    window.addEventListener("click", onStarClick);

    let t = 0;
    let k = 0;

    const animate = function () {
      requestAnimationFrame(animate);

      sun.rotation.y += 0.01;
      sunMaterial.uniforms.time.value += 0.01;

      var T_orb = 2;
      var e = 0.85;
      var a = 100;
      var b = a * Math.sqrt(1 - Math.pow(e, 2));
      var M = ((2 * Math.PI) / T_orb) * t;
      k = Math.sqrt(
        Math.pow(exoplanet.position.x - a * e, 2) +
          Math.pow(exoplanet.position.z, 2)
      );
      sun.position.set(e * a, 0, 0);
      exoplanet.position.x = a * Math.cos(M);
      exoplanet.position.z = b * Math.sin(M);
      exoplanet.position.y = 0;

      trailPositions.copyWithin(3, 0, (maxTrailLength - 1) * 3);
      trailPositions.set(
        [exoplanet.position.x, exoplanet.position.y, exoplanet.position.z],
        0
      );
      trailGeometry.attributes.position.needsUpdate = true;

      t += 0.1 / k;

      controls.update();

      composer.render();
    };

    animate();

    return () => {
      document.body.removeChild(renderer.domElement);
      window.removeEventListener("click", onStarClick);
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
