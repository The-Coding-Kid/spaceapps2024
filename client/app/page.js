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

const rocky_colors = [0x8b4513, 0xd2b48c, 0xa9a9a9, 0xb22222, 0xff6347, 0xadd8e6, 0x4682b4, 0xa0522d, 0xc0c0c0, 0xcd5c5c];
const gas_colors = [0xadd8e6, 0x87feca, 0x4f82c4, 0x1f90ff, 0x509ea0,0x80f0c0, 0x6a5acd, 0xe6e6fa, 0xf0f8ff, 0x0fbfa];

const H_color = [0, 0, 2, 2, 9, 9]
const He_color = [14, 13, 9, 7, 9, 1]
const O_color = [8, 3, 12, 11, 14, 6]
const NO4_color = [12, 1, 8, 2, 4, 12]
const NH4_color = [2, 6, 5, 11, 15, 15]
const CO2_color = [8, 0, 7, 6, 6, 1]

function getStarValues() {
  console.log("HELLO WORLD");
  
  return fetch(`http://localhost:3500/`)
    .then(response => response.json())  // Convert response to JSON
    .then(data => {
      console.log(data);  // Log the data from the server
      Object.keys(data)
      return { x: data.x, y: data.y, z: data.z, a: data.a, d: data.d};
      // Access x, y, z values from data
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      return { x: 0, y: 0, z: 0, a: 0, d: 0};  // Return default values in case of error
    });
}

let X = [];
let Y = [];
let Z = [];
let abs_mag = [];
let distances = [];

const { x, y, z, a: mag, d} = await getStarValues()

X = x;
Y = y;
Z = z;
abs_mag = mag;
distances = d;

// for (let i=0;i<X.length;i++) {
//   if (!(Math.log(abs_mag[i]) < 0) || X[i]==0) {
//     console.log(i, ": ", X[i], ", ", Y[i], ", ", Z[i], " | magnitude: ", abs_mag[i], "  | distance: ", distances[i]);
//     X.splice(i, 1);
//     Y.splice(i, 1);
//     Z.splice(i, 1);
//     abs_mag.splice(i, 1);
//     distances.splice(i, 1);
//   }
// }

// console.log("X", X)
// console.log("Y", Y)
// console.log("Z", Z)
// console.log("A", abs_mag)
// console.log("D", distances)


let N = X.length;
console.log(typeof N)
console.log("VALUE OF N", N)

// function getStarValues() {
//   console.log("HELLO WORLD");
//   fetch(`http://localhost:3500/`)
//   .then(d => {
//     console.log(d.json())
//     return d;
//   })
//   .then(a => {
//     console.log(a)
//     return {x: a["x"], y: a["y"], y: a["z"]}
//   })
//   return {x: 0, y: 0, z: 0}
// }




//R*x/distance, R*y/distance, R*z/distance
// const N = 400;

// for (let i = 0; i < N; i++) {
//   X.push(200*(Math.random()-0.5));
// }
// for (let i = 0; i < N; i++) {
//   Y.push(200*(Math.random()-0.5));
// }
// for (let i = 0; i < N; i++) {
//   Z.push(200*(Math.random()-0.5));
// }
// for (let i = 0; i < N; i++) {
//   abs_mag.push(5*(Math.random()-0.25));
// }
// for (let i = 0; i < N; i++) {
//   distances.push(Math.sqrt(Math.pow(X[i],2)+Math.pow(Y[i],2)+Math.pow(Z[i],2)));
// }




function color_from_gases(GASES) {
  const composite_color = [0,0,0,0,0,0]
  var num = 0;

  if (GASES.includes("H")) {
    for (let i=0; i<6; i++) {composite_color[i] += (H_color[i])}
    num++
  } 
  if (GASES.includes("He")) {
    for (let i=0; i<6; i++) {composite_color[i] += (He_color[i])}
    num++
  } 
  if (GASES.includes("O")) {
    for (let i=0; i<6; i++) {composite_color[i] += (O_color[i])}
    num++
  }
  if (GASES.includes("NO4")) {
    for (let i=0; i<6; i++) {composite_color[i] += (NO4_color[i])}
    num++
  } 
  if (GASES.includes("NH4")) {
    for (let i=0; i<6; i++) {composite_color[i] += (NH4_color[i])}
    num++
  } 
  if (GASES.includes("CO2")) {
    for (let i=0; i<6; i++) {composite_color[i] += (CO2_color[i])}
    num++
  } 

  let final_val = 0;
  for (let i=0; i<6; i++) {composite_color[i] = Math.floor(composite_color[i]/num); final_val += composite_color[i]*Math.pow(16,5-i);}

  return "0x"+final_val.toString(16);
  //return 0x085e53;
}

var T_orb = 1.5;
var e = 0.4;
var a = 100;

var looking = false;

//NOTE: check if other planets are in the same system
//import these from backend
const pl_name = "Kepler-44b";
const st_name = "Kepler-44";
const has_atm = false; //check if plantet is in fulldata csv (otherwise use partialdata csv)
const R_pl = 2.3;
const R_st = 0.05;
const T_st = 4800;
const gases = ["H", "He", "O", "NO4", "NH4"]; //H adds dark blue, He adds light pink & yellow, O adds light blue, NO4 adds orange, NH4 adds indigo

var COLOR;

if (has_atm) {
  //planet main color
  COLOR = color_from_gases(gases);
} else {
  if (R_pl < 2.2) {
    //terrestrial planet
    COLOR = rocky_colors[Math.floor(10 * Math.random())];
  } else {
    //gas giant
    COLOR = gas_colors[Math.floor(10 * Math.random())];
  }
}

//apparent magnitudes
let brightness = [];

for (let i = 0; i < N; i++) {
  //console.log(abs_mag[i])
  brightness.push(Math.pow(10, -0.4 * abs_mag[i]) / Math.pow(distances[i], 2));
}


const R = 500;


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);


class CustomCameraControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    class CustomCameraControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    
    this.rotateSpeed = 0.02;
    this.moveSpeed = 0.1;
    
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.keyState = {};
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }
  
  onMouseDown(event) {
    this.mouseDown = true;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
  
  onMouseUp() {
    this.mouseDown = false;
  }
  
  onMouseMove(event) {
    if (!this.mouseDown) return;
    
    const deltaX = event.clientX - this.mouseX;
    const deltaY = event.clientY - this.mouseY;
    
    this.rotateCamera(deltaX, deltaY);
    
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
  
  onKeyDown(event) {
    this.keyState[event.code] = true;
  }
  
  onKeyUp(event) {
    this.keyState[event.code] = false;
  }
  
  rotateCamera(deltaX, deltaY) {
    this.camera.rotation.y -= deltaX * this.rotateSpeed;
    this.camera.rotation.x -= deltaY * this.rotateSpeed;
    
    // Clamp vertical rotation to avoid flipping
    this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
  }
  
  moveCamera() {
    const direction = new THREE.Vector3();
    const rotation = this.camera.rotation.clone();
    
    if (this.keyState['KeyW']) direction.z -= 1;
    if (this.keyState['KeyS']) direction.z += 1;
    if (this.keyState['KeyA']) direction.x -= 1;
    if (this.keyState['KeyD']) direction.x += 1;
    if (this.keyState['Space']) direction.y += 1;
    if (this.keyState['ShiftLeft']) direction.y -= 1;
    
    direction.applyEuler(rotation);
    direction.multiplyScalar(this.moveSpeed);
    
    this.camera.position.add(direction);
  }
  
  update() {
    this.moveCamera();
  }
}
    this.rotateSpeed = 0.002;
    this.moveSpeed = 0.1;
    
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.keyState = {};
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
  }
  
  onMouseDown(event) {
    this.mouseDown = true;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
  
  onMouseUp() {
    this.mouseDown = false;
  }
  
  onMouseMove(event) {
    if (!this.mouseDown) return;
    
    const deltaX = event.clientX - this.mouseX;
    const deltaY = event.clientY - this.mouseY;
    
    this.rotateCamera(deltaX, deltaY);
    
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
  
  onKeyDown(event) {
    this.keyState[event.code] = true;
  }
  
  onKeyUp(event) {
    this.keyState[event.code] = false;
  }
  
  rotateCamera(deltaX, deltaY) {
    this.camera.rotation.y -= deltaX * this.rotateSpeed;
    this.camera.rotation.x -= deltaY * this.rotateSpeed;
    
    // Clamp vertical rotation to avoid flipping
    this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
  }
  
  moveCamera() {
    const direction = new THREE.Vector3();
    const rotation = this.camera.rotation.clone();
    direction.applyEuler(rotation);
    direction.multiplyScalar(this.moveSpeed);
    
    this.camera.position.add(direction);
  }
  
  update() {
    this.moveCamera();
  }
}

var renderer;
var stream = "sigma.mp3";

// init
function init() {
    // scene
    scene.fog = new THREE.FogExp2(0x01131e, 0.025);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    renderer.setClearColor("#01131E");
    document.body.appendChild(renderer.domElement);

    // AUDIO
    var audioLoader = new THREE.AudioLoader();
    var listener = new THREE.AudioListener();
    var audio = new THREE.Audio(listener);
    audioLoader.load(stream, function(buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.play();
    });
}

init();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}


const ctrl = new CustomCameraControls(camera, renderer.domElement);

export default function Home() {
  const [selectedStars, setSelectedStars] = useState([]);
  const [lockOnPlanet, setLockOnPlanet] = useState(false);
  //let [toggled] = useState(false);
  
  const [surfaceView, setSurfaceView] = useState(false);
  // const [star, setStar] = useState({
  //   x: [],
  //   y: [],
  //   z: [],
  //   a: [],
  //   d: []
  // })


  useEffect(() => {;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      global.window.innerWidth / global.window.innerHeight,
      0.1,
      1000
    );

    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    console.log("in here");

    // Load the ambient music file
    audioLoader.load('../public/sigma.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5); // Set volume as needed
      sound.play(); // Play the music
    });

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(global.window.innerWidth, global.window.innerHeight);
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
          quantity: T_st,
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
      //console.log("BRIGHTNESS", B)
      let r = 3*Math.pow(B,0.04);
      if (!(r<2)) {r = 0.8}
      const geometry = new THREE.SphereGeometry(r, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const star = new THREE.Mesh(geometry, material);
      //console.log(x, y, z)
      star.position.set(x, y, z);
      scene.add(star);

      const geometry2 = new THREE.SphereGeometry(25, 32, 32);
      const material2 = new THREE.MeshBasicMaterial({
        color: 0x03ffff,
        transparent: true,
        opacity: 0 // Adjust the opacity value as needed
      });
      const hitbox = new THREE.Mesh(geometry2, material2);
      hitbox.position.set(x, y+30*Math.sqrt(B), z);
      scene.add(hitbox);
      hitboxes.push(hitbox);

      const outlineGeometry = new THREE.SphereGeometry(r, 32, 32);
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
      const dis = Math.sqrt(X[i]*X[i]+Y[i]*Y[i]+Z[i]*Z[i],0.5);
      const x = R * X[i]/dis;
      const y = R * Y[i]/dis;
      const z = R * Z[i]/dis;
      Generate_Star(x,y,z, brightness[i]);
    }

    function Generate_exoplanet(a, clr) {
      const geometry = new THREE.SphereGeometry(R_pl, 32, 32);
      // const material = new THREE.ShaderMaterial({
      //   vertexShader,
      // fragmentShader,
      //   color: clr,
      // });
      const material = new THREE.MeshBasicMaterial({
        color: clr,
        side: THREE.BackSide,
      });
    
      const exoplanet = new THREE.Mesh(geometry, material);
      scene.add(exoplanet);
      exoplanet.position.set(a, 0, 0);
      return exoplanet;
    }

    const exoplanet = Generate_exoplanet(25, COLOR);

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
      new THREE.Vector2(global.window.innerWidth, global.window.innerHeight),
      3,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x929292 });
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);

    const maxTrailLength = 400;
    const trailLifespan = 200; // Lifespan of each trail segment
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
      mouse.x = (event.clientX / global.window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / global.window.innerHeight) * 2 + 1;

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

    global.window.addEventListener("click", onStarClick);
    let t = 0;
    let k = 0;
    // Removed unused variable 'v'

    // Load font and create text label
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/droid/droid_sans_regular.typeface.json",
      (font) => {
        const textGeometry = new TextGeometry(pl_name, {
          font: font,
          size: 2,
          depth: 0.5,
          height: R_pl*4,
        });
        const textGeometry2 = new TextGeometry("Host Star ("+st_name+")", {
          font: font,
          size: 4,
          depth: 0.5,
          height: R_st*215*4,
        });
        textGeometry.size = 100;
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        const textMeshSun = new THREE.Mesh(textGeometry2, textMaterial);
        scene.add(textMesh);
        scene.add(textMeshSun);

        textMeshSun.position.set(
          e*a,R_st*215*1.2,0
        );

        const animate = function () {
          requestAnimationFrame(animate);

          sun.rotation.y += 0.004;
          sunMaterial.uniforms.time.value += 0.01;

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
            exoplanet.position.x,
            exoplanet.position.y+R_pl*2,
            exoplanet.position.z
          );
          textMesh.lookAt(camera.position);
          textMeshSun.lookAt(camera.position);
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

          t += 0.25 / k;

          // Update camera position based on the selected view
          if (lockOnPlanet) {
            camera.position.set(
              exoplanet.position.x - 3*R_pl,
              exoplanet.position.y + 4*R_pl,
              exoplanet.position.z - 3*R_pl
            );
            //camera.up = new THREE.Vector3(0,1,0);
            if (looking==false) {
              camera.lookAt(exoplanet.position);
              looking = true;
            }
            
            ctrl.update()
          } else if (surfaceView) {
            camera.position.set(
              terrain.position.x,
              terrain.position.y + 10, // Adjust height as needed
              terrain.position.z
            );
            camera.lookAt(terrain.position.x, terrain.position.y, terrain.position.z);
            terrain.visible = true; // Show terrain
            // Create planet surface geometry and material
            const planetSurfaceGeometry = new THREE.SphereGeometry(R_pl, 32, 32);
            const planetSurfaceMaterial = new THREE.MeshBasicMaterial({ color: COLOR });
            const planetSurface = new THREE.Mesh(planetSurfaceGeometry, planetSurfaceMaterial);
            planetSurface.position.set(exoplanet.position.x, exoplanet.position.y, exoplanet.position.z);
            scene.add(planetSurface);

            // Update planet surface position to follow the exoplanet
            planetSurface.position.copy(exoplanet.position);
          } else {
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
      global.window.removeEventListener("click", onStarClick);
    };
  }, [lockOnPlanet, surfaceView]);

  return (
    <><div>
      <Title title={"Exoplanet Interface"} />
      <Navbar setLockOnPlanet={setLockOnPlanet} lockOnPlanet={lockOnPlanet} />
      <QuickActions />
      <SearchBar />
      <button onClick={() => setSurfaceView(!surfaceView)}>
        {surfaceView ? "Exit Surface View" : "View Surface"}
      </button>
    </div><div id="division" style={{ marginLeft: 50 + 'em', marginRight: -4 + 'em', marginTop: 20 + 'em' }} className="bg-[rgba(255,255,255,0.1)] bgblur flex z-10 flex-row gap-4 px-8 tracking-wide rounded-lg top-[100px] right-[86px] text-[rgba(205,205,255,0.9)] py-3 absolute">
        <p id="info" class="visible">
        Exoplanet Name: {pl_name} <br></br>
        Host Star: {st_name} <br></br>
        Star Surface Temperature: {T_st} K  <br></br>
        Spectral Class: G  <br></br>
        Exoplanet Radius (Earths): {R_pl}  <br></br>
        Host Star Radius (Suns): {R_st}  <br></br>
        Semimajor Axis: {a} AU  <br></br>
        Distance from Earth (parsecs): 2250 <br></br>
        (Number of stars loaded: {N})
        </p>
        <button
          //style={{marginLeft: 50 + 'em', marginRight: -4 + 'em', marginTop: 15 + 'em'}}
          onClick={() => document.getElementById("info").style.visibility == "visible" ? (document.getElementById("info").style.visibility = "hidden", document.getElementById("division").className = "flex z-10 flex-row gap-4 px-8 tracking-wide rounded-lg top-[100px] right-[86px] text-[rgba(255,255,255,0.5)] py-3 absolute"): (document.getElementById("info").style.visibility = "visible" , document.getElementById("division").className = "bg-[rgba(255,255,255,0.1)] bgblur flex z-10 flex-row gap-4 px-8 tracking-wide rounded-lg top-[100px] right-[86px] text-[rgba(205,205,255,0.9)] py-3 absolute")}
          className="bg-[rgba(55,55,155,0.8)] px-9 hover:text-white duration-300 transition-all"
          style = {{fontSize: 1.5 + 'em'}}>
          Toggle Info
        </button>
      </div></>
  );
}

//credits: Jahaan S, Rohan F, Ibrahim N
