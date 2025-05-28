// Escena, cámara y renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de órbita (desactivados para VR)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1.6, 0); // Estar en el centro, altura promedio humana
controls.target.set(0, 1.6, 0); // Mira hacia el frente desde esa altura
controls.update();

// Luces
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Raycaster y mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

/////////////
//  sprite //
/////////////

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

///////////////////////////////////////////////////
// Función para mover el objetivo aleatoriamente //
///////////////////////////////////////////////////
function moveTargetRandomly() {
  const range = 10; // Aumento el rango para una mayor aleatoriedad
  const x = (Math.random() - 0.5) * 2 * range;
  const y = Math.random() * 4 + 1; // Más alto que el piso
  const z = (Math.random() - 0.5) * 2 * range;
  target.position.set(x, y, z);
  
  //  textura aleatoria 
  target.material.map = getRandomTexture();
  target.material.needsUpdate = true;
}

moveTargetRandomly(); // Posición inicial del objetivo
/////////
// box //
/////////

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

  // Establecer el skybox como fondo

scene.background = textureCube;

////////////////////////////////////////////////////////////////////
// Detectar clics (solo en escritorio, en VR se maneja distinto) //
///////////////////////////////////////////////////////////////////

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(target);

  if (intersects.length > 0) {
    console.log("capturaste el pokemon");
    moveTargetRandomly(); // Mueve el objetivo aleatoriamente después de acertar
  }
});
///////////////
// Animación //
///////////////

function animate() {
  controls.update();
    renderer.render(scene, camera);
}
animate();
renderer.setAnimationLoop(animate);
////////////////////////
// Redimensionamiento //
////////////////////////

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
////////////////
// soporte VR //
///////////////

const xrButton = document.createElement('button');
xrButton.style.position = 'absolute';
xrButton.style.top = '10px';
xrButton.style.left = '10px';
xrButton.innerHTML = 'Iniciar VR';
document.body.appendChild(xrButton);
////////////////
// Activar VR //
///////////////

xrButton.addEventListener('click', () => {
  if (renderer.xr.isPresenting) {
    renderer.xr.getSession().end();
  } else {
    navigator.xr.requestSession('immersive-vr').then((session) => {
      renderer.xr.enabled = true;
      renderer.xr.setSession(session);
    });
  }
});
////////////////////
// Ajuste para VR //
///////////////////
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1);
scene.add(controller2);
