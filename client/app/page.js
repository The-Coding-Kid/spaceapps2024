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
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
const N = 400;
const rocky_colors = [
  0x8b4513, 0xd2b48c, 0xa9a9a9, 0xb22222, 0xff6347, 0xadd8e6, 0x4682b4,
  0xa0522d, 0xc0c0c0, 0xcd5c5c,
];

const RA = [];
const azimuth = [];
let abs_mag = [];
let distances = [];

function color_from_gases() {
  return 0x085e53;
}



/*
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

// Load the ambient music file
audioLoader.load('file:///Users/ibrahim/Downloads/The%20sweet,%20sour,%20salty,%20and%20savory%20sigma.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5); // Set volume as needed
    sound.play(); // Play the music
});

*/





//NOTE: check if other planets are in the same system
//import these from backend
const pl_name = "planet";
const has_atm = false; //check if plantet is in fulldata csv (otherwise use partialdata csv)
const R_pl = 1;
const R_st = 0.1;
const gases = ["H", "He", "O", "NO4", "NH4"];

let COLOR = color_from_gases(gases);

if (has_atm) {
  //planet main color
  COLOR = color_from_gases(gases);
} else {
  if (R_pl < 2.2) {
    //terrestrial planet
    COLOR = rocky_colors[10 * Math.floor(Math.random())];
  } else {
    //gas giant
    COLOR = rocky_colors[10 * Math.floor(Math.random())];
  }
}

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

const R = 600;

export default function Home() {
  const [, setSelectedStars] = useState([]);
  const [lockOnPlanet, setLockOnPlanet] = useState(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );



    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();

// Load the ambient music file
    audioLoader.load('The sweet, sour, salty, and savory sigma.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5); // Set volume as needed
      sound.play(); // Play the music
    });





    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxDistance = 200;
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

    const sunGeometry = new THREE.SphereGeometry(R_st * 215, 32, 32);
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
      const geometry = new THREE.SphereGeometry(10 * Math.sqrt(B), 32, 32); // Increase hitbox size
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
      // scene.add(outline);
      starOutlines.push(outline);
    }

    for (let i = 0; i < N; i++) {
      const x = R * Math.cos(RA[i]) * Math.cos(azimuth[i]);
      const y = R * Math.cos(RA[i]) * Math.sin(azimuth[i]);
      const z = R * Math.sin(RA[i]);
      Generate_Star(x, y, z, brightness[i]);
    }

    function Generate_exoplanet(a, clr) {
      const geometry = new THREE.SphereGeometry(R_pl, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: clr,
      });
      const exoplanet = new THREE.Mesh(geometry, material);
      scene.add(exoplanet);
      exoplanet.position.set(a, 0, 0);
      return exoplanet;
    }

    const exoplanet = Generate_exoplanet(25, COLOR);

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

    const maxTrailLength = 200;
    const trailLifespan = 100; // Lifespan of each trail segment
    const trailPositions = new Float32Array(maxTrailLength * 3);
    const trailTimes = new Float32Array(maxTrailLength).fill(trailLifespan);
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

      // Remove the previous line if it exists
      if (constellationLines.length > 1) {
        const oldLine = constellationLines.shift();
        scene.remove(oldLine);
      }
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
    // Removed unused variable 'v'

    // Load font and create text label
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const textGeometry = new TextGeometry(pl_name, {
          font: font,
          size: 3,
          height: 2,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        scene.add(textMesh);

        const animate = function () {
          requestAnimationFrame(animate);

          sun.rotation.y += 0.01;
          sunMaterial.uniforms.time.value += 0.01;

          var T_orb = 2;
          var e = 0.4;
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

          // Update text label position and make it face the camera
          textMesh.position.set(
            exoplanet.position.x + 2,
            exoplanet.position.y + 2,
            exoplanet.position.z
          );
          textMesh.lookAt(camera.position);

          // Update trail positions and times
          for (let i = trailPositions.length - 3; i > 2; i -= 3) {
            trailPositions[i] = trailPositions[i - 3];
            trailPositions[i + 1] = trailPositions[i - 2];
            trailPositions[i + 2] = trailPositions[i - 1];
            trailTimes[i / 3] = trailTimes[i / 3 - 1];
          }
          trailPositions[0] = exoplanet.position.x;
          trailPositions[1] = exoplanet.position.y;
          trailPositions[2] = exoplanet.position.z;
          trailTimes[0] = trailLifespan;

          // Reduce trail segment lifespans
          for (let i = 0; i < trailTimes.length; i++) {
            trailTimes[i] -= 1;
            if (trailTimes[i] <= 0) {
              trailPositions[i * 3] = trailPositions[i * 3 + 1] = trailPositions[i * 3 + 2] = NaN;
            }
          }

          trailGeometry.attributes.position.needsUpdate = true;

          t += 0.25 / k;

          // Update camera position based on the selected view
          if (lockOnPlanet) {
            camera.position.set(
              exoplanet.position.x + 10,
              exoplanet.position.y + 10,
              exoplanet.position.z + 10
            );
            camera.lookAt(exoplanet.position);
          } else {
            controls.update();
          }

          composer.render();
        };

        animate();
      }
    );

    return () => {
      document.body.removeChild(renderer.domElement);
      window.removeEventListener("click", onStarClick);
    };
  }, [lockOnPlanet]);

  return (
    <div>
      <Title title={"Exoplanet Interface"} />
      <Navbar />
      <QuickActions />
      <SearchBar />
      <button onClick={() => setLockOnPlanet(!lockOnPlanet)}>
        {lockOnPlanet ? "Unlock View" : "Lock on Planet"}
      </button>
    </div>
  );
}
