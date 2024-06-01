/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
document.addEventListener("DOMContentLoaded", async () => {
  // Function to set the initial sidebar state
  const setInitialSidebarState = () => {
    const isExpanded = localStorage.getItem("sidebarExpanded");
    if (isExpanded === "true") {
      sidebar.classList.add("expand");
      toggleSidebarButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
      toggleGridButton.style.width = "100%";
      toggleGridButton.innerHTML = '<i class="fas fa-th"></i>';
    }
  };

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

  // Get the sidebar and toggle sidebar button
  const sidebar = document.getElementById("sidebar");
  const toggleSidebarButton = document.getElementById("toggle-sidebar");

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    sidebar.classList.toggle("expand");
    const isExpanded = sidebar.classList.contains("expand");
    localStorage.setItem("sidebarExpanded", isExpanded);
    if (isExpanded) {
      toggleSidebarButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
      toggleGridButton.style.width = "100%";
      toggleGridButton.innerHTML = '<i class="fas fa-th"></i>';
    } else {
      toggleSidebarButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
      toggleGridButton.style.width = "30px";
      toggleGridButton.innerHTML = '<i class="fas fa-th"></i>';
    }
  };

  // Event listener for the toggle sidebar button
  toggleSidebarButton.addEventListener("click", toggleSidebar);

  // Get the toggle grid button
  const toggleGridButton = document.getElementById("toggle-grid");

  // Function to toggle the grid visibility
  const toggleGrid = () => {
    gridHelper.visible = !gridHelper.visible;
  };

  // Event listener for the toggle grid button
  toggleGridButton.addEventListener("click", toggleGrid);

  // Event listener for color input change
  const colorInput = document.getElementById("car-color");
  colorInput.addEventListener("input", (event) => {
    const colorValue = event.target.value;
    body.material.color.set(colorValue);
    localStorage.setItem("carColor", colorValue); // Save the color in local storage
  });

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

  // Listen for changes in position
  const socket = io();
  socket.on("position_changed", () => {
    moveCar();
  });

  // Call the function to set the initial sidebar state when the page is loaded
  setInitialSidebarState();
  // Call the function to set the initial color when the page is loaded
  setInitialColor();
});

/******/ })()
;