/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
document.addEventListener("DOMContentLoaded", async () => {
  // Function to set the initial color
  const setInitialColor = () => {
    const savedColor = localStorage.getItem("carColor");
    if (savedColor) {
      colorInput.value = savedColor;
      body.material.color.set(savedColor);
    }
  };

  // Function to fetch the position of the object from the server
  const fetchPosition = async () => {
    const response = await fetch("/get_position");
    return await response.json();
  };

  // Function to move the car and update the coordinate tag
  const moveCar = async () => {
    const position = await fetchPosition();
    body.position.set(position.x, position.y, position.z);
    // Move the wheels relative to the car body
    frontWheel.position.set(
      -0.8 + position.x,
      -0.5 + position.y,
      0.3 + position.z
    );
    rearWheel.position.set(
      0.8 + position.x,
      -0.5 + position.y,
      0.3 + position.z
    );
    // Update the coordinate tag
    coordinateTag.textContent = `X: ${position.x.toFixed(
      2
    )}, Y: ${position.y.toFixed(2)}, Z: ${position.z.toFixed(2)}`;
  };

  // Set up the scene, camera, and renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1); // Set background color to white
  document.body.appendChild(renderer.domElement);

  // Create the body of the car
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 0.5);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Initial color
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

  // Create the wheels of the car
  const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  const rearWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);

  // Position the wheels
  frontWheel.position.set(-0.8, -0.5, 0.3);
  rearWheel.position.set(0.8, -0.5, 0.3);

  // Rotate the wheels to align with the car body
  frontWheel.rotation.z = Math.PI / 2;
  rearWheel.rotation.z = Math.PI / 2;

  // Add the body and wheels to the scene
  scene.add(body, frontWheel, rearWheel);

  // Set camera position
  camera.position.z = 10;
  camera.position.y = 5;
  camera.lookAt(0, 0, 0);

  // Add ambient light to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light to the scene
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Add a grid helper
  const gridHelper = new THREE.GridHelper(1000, 1000);
  gridHelper.visible = false; // Initially hide the grid
  scene.add(gridHelper);

  // Get the coordinate tag element
  const coordinateTag = document.getElementById("coordinate-tag");

  // Function to call fetchPosition every 100ms
  const fetchPositionInterval = setInterval(moveCar, 100);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Rotate wheels
    frontWheel.rotation.x += 0.1;
    rearWheel.rotation.x += 0.1;

    // Render the scene
    renderer.render(scene, camera);
  }
  animate();

  // Move the car initially
  moveCar();

  // Function to toggle the grid visibility
  const toggleGrid = () => {
    gridHelper.visible = !gridHelper.visible;
    localStorage.setItem("gridVisible", gridHelper.visible);
  };

  // Get the toggle grid button
  const toggleGridButton = document.getElementById("toggle-grid-button");

  // Event listener for the toggle grid button
  toggleGridButton.addEventListener("click", toggleGrid);

  // Function to toggle the display of coordinates
  const toggleCoordinates = () => {
    if (coordinateTag.style.display === "none") {
      coordinateTag.style.display = "block";
      localStorage.setItem("coordinatesVisible", "true");
    } else {
      coordinateTag.style.display = "none";
      localStorage.setItem("coordinatesVisible", "false");
    }
  };

  // Event listener for the toggle coordinates button
  const toggleCoordinatesButton = document.getElementById(
    "toggle-coordinates-button"
  );
  toggleCoordinatesButton.addEventListener("click", toggleCoordinates);

  // Function to set the initial state of the grid and coordinates
  const setInitialState = () => {
    const gridVisible = localStorage.getItem("gridVisible");
    if (gridVisible === "true") {
      gridHelper.visible = true;
    } else {
      gridHelper.visible = false;
    }

    const coordinatesVisible = localStorage.getItem("coordinatesVisible");
    if (coordinatesVisible === "true") {
      coordinateTag.style.display = "block";
    } else {
      coordinateTag.style.display = "none";
    }
  };

  // Function to handle camera zoom and rotation
  const handleCameraZoomAndRotation = () => {
    const zoomInput = document.getElementById("camera-zoom");
    const rotationInput = document.getElementById("camera-rotation");

    const updateCamera = () => {
      const zoomValue = parseFloat(zoomInput.value);
      const rotationValue = parseFloat(rotationInput.value);

      // Calculate camera position based on zoom
      const radius = zoomValue;
      const theta = rotationValue * (Math.PI / 180); // Convert degrees to radians
      const x = radius * Math.sin(theta);
      const z = radius * Math.cos(theta);

      // Update camera position
      camera.position.set(x, camera.position.y, z);
      camera.lookAt(0, 0, 0); // Keep camera looking at the center

      // Save zoom and rotation values to localStorage
      localStorage.setItem("cameraZoom", zoomValue);
      localStorage.setItem("cameraRotation", rotationValue);
    };

    // Add event listeners for zoom and rotation inputs
    zoomInput.addEventListener("input", updateCamera);
    rotationInput.addEventListener("input", updateCamera);

    // Retrieve zoom and rotation values from localStorage and update inputs
    const savedZoom = localStorage.getItem("cameraZoom");
    const savedRotation = localStorage.getItem("cameraRotation");
    if (savedZoom !== null && savedRotation !== null) {
      zoomInput.value = savedZoom;
      rotationInput.value = savedRotation;
      updateCamera(); // Update camera position with saved values
    }
  };

  // Call the function to handle camera zoom and rotation
  handleCameraZoomAndRotation();

  // Function to reload the page on screen resize
  const reloadOnResize = () => {
    window.addEventListener("resize", () => {
      location.reload();
    });
  };

  // Call the reloadOnResize function
  reloadOnResize();

  // Connect to Socket.IO
  const socket = io();
  socket.on("position_changed", () => {
    moveCar();
  });
  setInitialState();

  // Function to toggle the sidebar visibility
  const toggleSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("expanded");
  };

  // Get the toggle sidebar button
  const toggleSidebarButton = document.getElementById("toggle-sidebar-button");

  // Event listener for the toggle sidebar button
  toggleSidebarButton.addEventListener("click", toggleSidebar);

  // Function to toggle the display of camera controls
  const toggleCameraControls = () => {
    const cameraControls = document.getElementById("camera-controls");
    cameraControls.style.display =
      cameraControls.style.display === "none" ? "block" : "none";
  };

  // Get the toggle camera controls button
  const toggleCameraControlsButton = document.getElementById(
    "toggle-camera-controls-button"
  );

  // Event listener for the toggle camera controls button
  toggleCameraControlsButton.addEventListener("click", toggleCameraControls);
});

/******/ })()
;