import * as THREE from 'three';
// import { GLTFLoader } from '../node_modules/three/examples/jsm/gl';
// import { OrbitControls } from '/three/examples/jsm/controls/OrbitControls.js';

import { OrbitControls } from './three/examples/jsm/Addons.js';
 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( 700, 500 );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // An animation loop is required when damping is enabled
controls.dampingFactor = 0.25;
controls.enableZoom = true; // Allows zooming in and out
controls.enablePan = true; // Allows panning (moving the camera left/right and up/down)


const blendFrame = document.getElementsByClassName("blender")[0]; 
blendFrame.appendChild( renderer.domElement );

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Load GLTF model
const loader = new GLTFLoader();
const url = '/models/Blend.glb';

loader.load(url, function (gltf) {
    scene.add(gltf.scene);
    console.log('Model loaded successfully');
  
    // Optionally adjust model's scale and position if needed
    gltf.scene.scale.set(1, 1, 1); // Adjust scale as necessary
    gltf.scene.position.set(0, 0, 0); // Position the model
    gltf.scene.rotation.set(0, Math.PI, 0); // Rotate model if needed
  
    // Update camera position
    camera.position.set(0, 1, 5);
    camera.lookAt(0, 1, 0);
  
    // Start the animation loop
    animate();
  }, undefined, function (error) {
    console.error('Error loading model:', error);
  });
  

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    controls.update(); // Required for damping (if enabled)
    
    renderer.render(scene, camera);
  }

// Handle window resize
window.addEventListener('resize', () => {
renderer.setSize(window.innerWidth, window.innerHeight);
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
});
