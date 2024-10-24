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
import Rocky from "./components/Rocky";
const N = 400;
const rocky_colors = [
  0x8b4513, 0xd2b48c, 0xa9a9a9, 0xb22222, 0xff6347, 0xadd8e6, 0x4682b4, 0xa0522d, 0xc0c0c0, 0xcd5c5c
];
const gasgiant_colors = [
  0xadd8e6, 0x87cefa, 0x4682b4, 0x1e90ff, 0x5f9ea0, 0x800080, 0x6a5acd, 0xe6e6fa, 0xf0f8ff, 0xfaafff
];

function getStarValues() {
  fetch(`127.0.0.1:5000/`)
    .then(data => data.json())
  
}

//R*x/distance, R*y/distance, R*z/distance
const X = [];
const Y = [];
const Z = [];
let abs_mag = [];
let distances = [];

function color_from_gases(gases) {
  return 0x00aaff;
}

//NOTE: check if other planets are in the same system
//import these from backend
const pl_name = "planet3";
const has_atm = false; //check if plantet is in fulldata csv (otherwise use partialdata csv)
const R_pl = 3;
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
    COLOR = gasgiant_colors[10 * Math.floor(Math.random())];
  }
}

for (let i = 0; i < N; i++) {
  X.push(200*(Math.random()-0.5));
}
for (let i = 0; i < N; i++) {
  Y.push(200*(Math.random()-0.5));
}
for (let i = 0; i < N; i++) {
  Z.push(200*(Math.random()-0.5));
}
for (let i = 0; i < N; i++) {
  abs_mag.push(6*(Math.random()-0.5));
}
for (let i = 0; i < N; i++) {
  distances.push(Math.sqrt(Math.pow(X[i],2)+Math.pow(Y[i],2)+Math.pow(Z[i],2)));
}

//apparent magnitudes
let brightness = [];

for (let i = 0; i < N; i++) {
  brightness.push(Math.pow(10, -0.4 * abs_mag[i]) / Math.pow(distances[i], 2));
}

const R = 600;

export default function Home() {
  const [selectedStars, setSelectedStars] = useState([]);
  const [lockOnPlanet, setLockOnPlanet] = useState(false);
  const [surfaceView, setSurfaceView] = useState(false);

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

    const rockyVertexShader = Rocky.vertexShader;
    const rockyFragmentShader = Rocky.fragmentShader;

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
    const hitboxes = [];

    function Generate_Star(x, y, z, B) {
      const geometry = new THREE.SphereGeometry(60 * Math.sqrt(B), 32, 32); // Increase hitbox size
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const star = new THREE.Mesh(geometry, material);
      star.position.set(x, y, z);
      scene.add(star);

      const geometry2 = new THREE.SphereGeometry(20, 32, 32);
      const material2 = new THREE.MeshBasicMaterial({
        color: 0x03ffff,
        transparent: true,
        opacity: 0 // Adjust the opacity value as needed
      });
      const hitbox = new THREE.Mesh(geometry2, material2);
      hitbox.position.set(x, y, z);
      scene.add(hitbox);
      hitboxes.push(hitbox);

      const outlineGeometry = new THREE.SphereGeometry(10, 32, 32);
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        side: THREE.BackSide,
      });
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outline.position.set(x, y, z);
      outline.visible = false;
      scene.add(outline);
      starOutlines.push(outline);
    }

    for (let i = 0; i < N; i++) {
      const x = R * X[i]/distances[i];
      const y = R * Y[i]/distances[i];
      const z = R * Z[i]/distances[i];
      Generate_Star(x, y, z, brightness[i]);
    }

    function Generate_exoplanet(R, a, clr) {
      const geometry = new THREE.SphereGeometry(R, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: clr,
      });
      /*
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        color: clr,
      });
      */
      const exoplanet = new THREE.Mesh(geometry, material);
      scene.add(exoplanet);
      exoplanet.position.set(a, 0, 0);
      return exoplanet;
    }

    const exoplanet = Generate_exoplanet(R_pl, 25, COLOR);

    // Create terrain geometry and material
    const terrainGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const textureLoader = new THREE.TextureLoader();
    const rockyTexture = textureLoader.load('client\public\rockytexture.png'); // Replace with the path to your rocky texture
    const terrainMaterial = new THREE.MeshBasicMaterial({ map: rockyTexture });
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.position.set(100, 0, 0); // Adjust position as needed
    terrain.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
    terrain.visible = false; // Initially hidden
    scene.add(terrain);

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
    }

    function onStarClick(event) {
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; //hitbox bug might originate here

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitboxes);

      if (intersects.length > 0) {
        const selectedHitbox = intersects[0].object;
        console.log("Star clicked:", selectedHitbox); // Debugging log
        setSelectedStars((prevSelectedStars) => {
          const newSelectedStars = [...prevSelectedStars, selectedHitbox];
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
        const index = hitboxes.indexOf(selectedHitbox);
        if (index !== -1) {
          starOutlines[index].visible = true;
          setTimeout(() => {
            starOutlines[index].visible = false;
          }, 1000); // Hide outline after 1 second
        }
      } else {
        console.log("No star clicked"); // Debugging log
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

          var T_orb = 0.5;
          var e = 0.6;
          var a = 120;
          var b = a * Math.sqrt(1 - Math.pow(e, 2));
          var M = ((2 * Math.PI) / T_orb) * t
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
          if(lockOnPlanet)  {
            textMesh.visible = false;
          } else {
            textMesh.visible = true;
          }
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

          t += 0.25/k;

          // Update camera position based on the selected view
          if (lockOnPlanet) {
            camera.position.set(
              exoplanet.position.x - 10*R_pl,
              exoplanet.position.y + 5*R_pl,
              exoplanet.position.z - 10*R_pl

            );
            //camera.updateProjectionMatrix();
            //camera.target.set(exoplanet.position);
            //camera.lookAt(exoplanet.position);
            const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.maxDistance = 200;
    controls.enableZoom = true;
            controls.enableZoom = false;
            controls.update()
          } else if (surfaceView) {
            camera.position.set(
              terrain.position.x,
              terrain.position.y + 10, // Adjust height as needed
              terrain.position.z
            );
            //camera.lookAt(terrain.position.x, terrain.position.y, terrain.position.z);
            terrain.visible = true; // Show terrain
          } else {
            controls.enableZoom = true;
            controls.update();
            terrain.visible = false; // Hide terrain
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
  }, [lockOnPlanet, surfaceView]);

  return (
    <div>
      <Title title={"Exoplanet Interface"} />
      <Navbar setLockOnPlanet={setLockOnPlanet} lockOnPlanet={lockOnPlanet} />
      <QuickActions />
      <SearchBar />
      <button onClick={() => setSurfaceView(!surfaceView)}>
        {surfaceView ? "Exit Surface View" : "View Surface"}
      </button>
    </div>
  );
}
