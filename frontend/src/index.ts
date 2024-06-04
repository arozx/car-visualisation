import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

document.addEventListener("DOMContentLoaded", () => {
  // Create a scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Create a WebGLRenderer instance
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1);
  document.body.appendChild(renderer.domElement);

  // Create a CSS2DRenderer instance
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild(labelRenderer.domElement);

  const gridHelper = new THREE.GridHelper(1000, 1000);
  gridHelper.visible = true;
  scene.add(gridHelper);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Use existing coordinate tag
  const coordTag = document.getElementById('coordinate-tag') as HTMLElement;
  if (!coordTag) {
    throw new Error('Coordinate tag element not found');
  }

  // Set up the car
  const bodyGeometry = new THREE.BoxGeometry(1, 0.5, 2);
  const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  
  const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
  const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Create mesh objects for the front wheels
  const frontWheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
  const frontWheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);

  // Create mesh objects for the rear wheels
  const rearWheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
  const rearWheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);

  // Position and rotate the front wheels
  frontWheel1.position.set(-0.8, -0.5, 0.8);
  frontWheel2.position.set(0.8, -0.5, 0.8);

  frontWheel1.rotation.z = Math.PI / 2;
  frontWheel2.rotation.z = Math.PI / 2;

  // Position and rotate the rear wheels
  rearWheel1.position.set(-0.8, -0.5, -0.7); 
  rearWheel2.position.set(0.8, -0.5, -0.7);  

  rearWheel1.rotation.z = Math.PI / 2;
  rearWheel2.rotation.z = Math.PI / 2;

  // Set camera initial position, look at the car
  camera.position.z = 10;
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);


// Import car model
  const loader = new GLTFLoader();

  let model: THREE.Object3D | undefined;

  // Load the model
  loader.load(
    '/public/warthog.glb',
    (gltf) => {
      model = gltf.scene;
      model.scale.set(5, 5, 5); // make the model a normal size
      scene.add(model);
    },
    undefined,
    (error) => console.error(error)
  );

  // Setup lighting
  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100); // white light
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);

  // Create a Raycaster instance
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Create a tooltip
  const tooltip = document.createElement('div');
  tooltip.style.position = 'fixed';
  tooltip.style.backgroundColor = 'white';
  tooltip.style.padding = '5px';
  tooltip.style.border = '1px solid black';
  tooltip.style.display = 'none'; // Hide it by default
  document.body.appendChild(tooltip);

  // Tootip event listeners
  window.addEventListener('mousemove', (event) => {
      // Normalize mouse position to -1 to 1 range
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects([body]);

      if (intersects.length > 0) {
          // The mouse is over the car
          tooltip.style.display = 'block'; // Show tooltip
          tooltip.style.left = event.clientX + 'px'; // Position at the mouse position
          tooltip.style.top = event.clientY + 'px';
          tooltip.textContent = 'This is the car'; // Set the tooltip content
      } else {
          tooltip.style.display = 'none'; // Hide tooltip
      }
  }, false);

  window.addEventListener('click', (event) => {
    // Normalize mouse position to -1 to 1 range
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([body, frontWheel1, frontWheel2]);

    if (intersects.length > 0) {
        // The mouse clicked on the car
        console.log('Clicked on the car');
    }
}, false);

  // Function to get the car's position & move the car
  let previousPosition = { x: 0, y: 0, z: 0 };

  function getCarPosition() {
    fetch('/get_position', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    .then(response => response.json())
    .then(data => {
      if (model) {
        model.position.set(data.x, data.y, data.z);
      }
      if (data.x !== previousPosition.x || data.y !== previousPosition.y || data.z !== previousPosition.z) {
        body.position.set(data.x, data.y, data.z);
        previousPosition = { x: data.x, y: data.y, z: data.z };
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }

  // Main loop
  const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    // Update coordinates display
    coordTag.textContent = `Coordinates: (${body.position.x.toFixed(2)}, ${body.position.y.toFixed(2)}, ${body.position.z.toFixed(2)})`;

    // update controls
    controls.update();

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects([body, frontWheel1, frontWheel2, rearWheel1, rearWheel2]);

    // Check if the mouse is hovering over the car
    if (intersects.length > 0) {
      console.log('Hovering over the car');
    }
    getCarPosition();
  };
  animate();

  // Handle change in window size
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Coordinates button event listener
  const toggleCoordinatesButton = document.getElementById('toggle-coordinates-button') as HTMLElement;
  toggleCoordinatesButton.addEventListener('click', () => {
      coordTag.style.display = coordTag.style.display === 'none' ? 'block' : 'none';
      localStorage.setItem('coordinatesVisible', coordTag.style.display !== 'none' ? 'true' : 'false'); // Store as string
  });

  // Load coordinates visibility when the page is opened
  const coordinatesVisible = localStorage.getItem('coordinatesVisible');
  if (coordinatesVisible !== null) {
      const isVisible = coordinatesVisible === 'true'; // Convert stored value to boolean
      coordTag.style.display = isVisible ? 'block' : 'none';
  }

  // Grid button event listener
  (document.getElementById('toggle-grid-button') as HTMLElement).addEventListener('click', () => {
    gridHelper.visible = !gridHelper.visible;
    localStorage.setItem('gridVisible', gridHelper.visible.toString());
  });

  const gridVisible = localStorage.getItem('gridVisible');
  if (gridVisible === 'false') {
    gridHelper.visible = false;
  }

  const toggleSidebarButton = document.getElementById('toggle-sidebar-button') as HTMLElement;
  const sidebar = document.getElementById('sidebar') as HTMLElement;
  const mainContent = document.getElementById('main-content') as HTMLElement;

  // Sidebar toggle button event listener
  toggleSidebarButton.addEventListener('click', () => {
    if (sidebar.classList.contains('expanded')) {
      sidebar.classList.remove('expanded');
      mainContent.style.marginLeft = '60px';
    } else {
      sidebar.classList.add('expanded');
      mainContent.style.marginLeft = '240px';
    }
  });

  // Camera zoom and rotation
  const handleCameraZoomAndRotation = () => {
      const zoomInput = document.getElementById("camera-zoom") as HTMLInputElement;
      const rotationInput = document.getElementById("camera-rotation") as HTMLInputElement;

      const updateCamera = () => {
          const zoomValue = parseFloat(zoomInput.value);
          const rotationValue = parseFloat(rotationInput.value);

          // Calculate camera position based on zoom and rotation
          const radius = zoomValue;
          const theta = rotationValue * (Math.PI / 180); // Degrees to radians
          const x = radius * Math.sin(theta);
          const z = radius * Math.cos(theta);

          // Update camera position
          camera.position.set(x, camera.position.y, z);
          camera.lookAt(0, 0, 0); // Lock camera to origin

          // Save zoom and rotation values to localStorage
          localStorage.setItem("cameraZoom", zoomValue.toString());
          localStorage.setItem("cameraRotation", rotationValue.toString());
      };

      // event listeners for zoom and rotation inputs
      zoomInput.addEventListener("input", updateCamera);
      rotationInput.addEventListener("input", updateCamera);

      // Retrieve zoom and rotation from localStorage and update inputs
      const savedZoom = localStorage.getItem("cameraZoom");
      const savedRotation = localStorage.getItem("cameraRotation");
      if (savedZoom !== null && savedRotation !== null) {
          zoomInput.value = savedZoom;
          rotationInput.value = savedRotation;
          updateCamera();
      }
  };
  handleCameraZoomAndRotation();
});
