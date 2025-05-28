import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType( 'local' );
////////////////////////////
document.body.appendChild( renderer.domElement );
document.body.appendChild( VRButton.createButton( renderer ) );//

// Luces
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Texturas aleatorias
const textures = [
  'textures/target1.png', // Asegúrate de tener estas imágenes en la carpeta adecuada
  'textures/target2.png',
  'textures/target3.png',
];
const loader = new THREE.TextureLoader();

// Función para obtener una textura aleatoria
function getRandomTexture() {
  const index = Math.floor(Math.random() * textures.length);
  return loader.load(textures[index]);
}

// Crear el objetivo como sprite
function createTargetSprite() {
  const texture = getRandomTexture(); // Asigna una textura aleatoria para el sprite
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  
  sprite.scale.set(1.5, 1.5, 1.5); // Escala del sprite (ajustable)
  return sprite;
}

// Crear el objetivo como sprite
const target = createTargetSprite();
scene.add(target);

// Función para mover el objetivo aleatoriamente
function moveTargetRandomly() {
  const range = 10; // Aumento el rango para una mayor aleatoriedad
  const x = (Math.random() - 0.5) * 2 * range;
  const y = Math.random() * 4 + 1; // Más alto que el piso
  const z = (Math.random() - 0.5) * 2 * range;
  target.position.set(x, y, z);
  
  // Textura aleatoria 
  target.material.map = getRandomTexture();
  target.material.needsUpdate = true;
}

moveTargetRandomly(); // Posición inicial del objetivo

// Skybox (fondo)
const textureCube = new THREE.CubeTextureLoader()
  .setPath('textures/') 
  .load([
    'posx.jpg', // Derecha
    'negx.jpg', // Izquierda
    'posy.jpg', // Arriba
    'negy.jpg', // Abajo
    'posz.jpg', // Delante
    'negz.jpg'  // Detrás
  ]);
scene.background = textureCube;

// Redimensionamiento
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Crear la "pistola" como un plano delante de la cámara
const gunGeometry = new THREE.PlaneGeometry(0.4, 0.4);
const gunTexture = loader.load('textures/gun.png'); // Asegúrate de tener esta imagen
const gunMaterial = new THREE.MeshStandardMaterial({
  map: gunTexture,
  transparent: true, // Para que respete la transparencia del PNG
  side: THREE.DoubleSide,
});

const gun = new THREE.Mesh(gunGeometry, gunMaterial);

// Posicionar la pistola delante y un poco hacia abajo desde la vista del usuario
gun.position.set(0.3, -0.3, -1); // x: derecha, y: abajo, z: delante
gun.rotation.y = Math.PI; 

// Agregar la pistola como hija de la cámara para que se mueva con ella
camera.add(gun);
scene.add(camera); 

// Configuración de los controladores de VR
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1);
scene.add(controller2);

// Crear un raycaster para interactuar con los objetos
const controllerRaycaster = new THREE.Raycaster();
const controllerIntersectedObjects = [target]; // Aquí defines los objetos a los que puedes interactuar

// Función para actualizar el controlador y disparar rayos
function updateController(controller) {
  const controllerPosition = controller.position.clone();
  const controllerRotation = controller.rotation.clone();
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(controllerRotation);
  const controllerRay = new THREE.Ray(controllerPosition, direction);

  controllerRaycaster.ray = controllerRay;

  // Detectar interacciones con los objetos
  const intersects = controllerRaycaster.intersectObjects(controllerIntersectedObjects);
  if (intersects.length > 0) {
    console.log('Objetivo alcanzado');
    moveTargetRandomly(); // Mover el objetivo aleatoriamente
  }
}

///////////////
// Animación //
///////////////
function animate() {
  // Actualizar controladores
  updateController(controller1);
  updateController(controller2);
  
  // Renderizar la escena
  renderer.render(scene, camera);
}

// Iniciar el ciclo de animación
renderer.setAnimationLoop(animate);
