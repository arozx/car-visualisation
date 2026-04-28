# 🚗 Real-Time 3D Vehicle Telemetry Visualiser

> Drive a 3D vehicle in your browser using an Xbox controller — live, over WebSockets.

Real-time 3D vehicle telemetry visualiser — stream Xbox/gamepad controller inputs to a live Three.js scene over WebSockets. Drive a 3D model across a textured grass world with a full skybox, orbit camera, and live coordinate HUD.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌌 **Skybox world** | Galaxy texture cubemap with tiled grass ground |
| 🌿 **32 k instanced grass blades** | GPU-instanced `InstancedMesh` for high-performance foliage |
| 🚙 **GLTF vehicle model** | Warthog 3D model loaded via `GLTFLoader` |
| 📡 **Real-time position streaming** | Flask-SocketIO pushes XYZ updates to the browser instantly |
| 🎮 **Xbox / gamepad input** | Left-stick axes mapped to vehicle X/Y position |
| 🛸 **Orbit camera** | Free orbit, zoom, and pan with `OrbitControls` |
| 🧭 **Coordinate HUD** | Live XYZ overlay, togglable from the sidebar |
| ⚙️ **Sidebar controls** | Toggle grid, grass, coordinates; adjust camera zoom & rotation |

---

## 🏗️ Architecture

```
Xbox Controller
      │
      ▼
xbox_control.py  ──── HTTP POST /move_object ────▶  Flask (app.py)
                                                          │
                                               Socket.IO broadcast
                                                          │
                                                          ▼
                                              Browser (Three.js scene)
                                           position_changed → model.position
```

The Python controller script reads joystick axes using `approxeng.input`, then POSTs `{x, y, z}` to the Flask REST endpoint. Flask updates its in-memory `Position` object and immediately emits a `position_changed` Socket.IO event. The Three.js frontend listens on Socket.IO and repositions the 3D model — no page refresh needed.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- An Xbox controller (or any controller supported by `approxeng.input`)

### 1. Clone & install

```bash
git clone https://github.com/arozx/car-visualisation.git
cd car-visualisation

# Python dependencies
pip install -r requirements.txt

# Frontend dependencies & build
cd frontend
npm install
npm run build
cd ..
```

### 2. Run the server

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

### 3. Start the controller (optional)

Plug in your Xbox controller, then in a second terminal:

```bash
python xbox_control.py
```

Tilt the **left stick** to move the vehicle across the world.

---

## 🐳 Docker (one-command demo)

```bash
docker compose up --build
```

Then open **http://localhost:5000**.

> The controller script requires access to a physical gamepad and must be run on the host machine (`python xbox_control.py`).

---

## 🕹️ Controls & UI

### Sidebar

Expand the sidebar by clicking the **☰** button on the left edge.

| Control | Action |
|---|---|
| **Toggle Grid** | Show / hide the 1000-unit floor grid |
| **Toggle Coordinates** | Show / hide the XYZ position HUD |
| **Toggle Grass** | Show / hide the 32 k instanced grass blades |
| **Camera Zoom** slider | Orbit camera distance from origin |
| **Camera Rotation** slider | Orbit camera angle (0–360 °) |

### Mouse / Trackpad

| Input | Action |
|---|---|
| Left-drag | Orbit the camera |
| Scroll / pinch | Zoom |
| Right-drag | Pan |

---

## 🔧 Extending the Project

### Swap the vehicle model

Replace `frontend/public/warthog.glb` with any GLTF/GLB file, then update the loader path in `frontend/src/index.ts`:

```ts
loader.load('/public/your-model.glb', ...);
```

### Connect a real RC car or robot

Replace `xbox_control.py` with a script that reads from a serial port (Arduino) or MQTT topic and POSTs the same `{x, y, z}` payload to `/move_object`. The browser becomes a live mission-control dashboard.

```
Arduino/RPi  ──► serial reader ──► POST /move_object ──► browser
```

### Add path recording & playback

Record a list of `{x, y, z, timestamp}` snapshots server-side and expose a `/playback` endpoint to replay them — useful for race telemetry or robot mission review.

### Add multiple vehicles

Extend the `Position` dataclass to a dictionary keyed by vehicle ID, emit `position_changed` with the ID, and instantiate multiple Three.js models on the frontend.

### Mobile / keyboard fallback

Use the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) directly in the browser, or map `WASD` keys to POST calls, removing the Python controller dependency.

---

## 💡 What You Can Build With This

| Idea | How |
|---|---|
| RC car telemetry dashboard | Replace controller script with serial reader from an ESP32/Arduino |
| Robot mission replay | Record position log server-side, replay via `/playback` endpoint |
| Fleet tracking demo | Multi-vehicle support with colour-coded models |
| Racing lap timer | Detect when model crosses a finish-line bounding box |
| AR preview | Use WebXR to overlay the 3D car on a real surface |

---

## 🗺️ Feature Roadmap

| Status | Feature |
|---|---|
| ✅ | Real-time WebSocket position streaming |
| ✅ | GLTF model loading |
| ✅ | Instanced grass, skybox, orbit camera |
| ✅ | Sidebar UI with toggles & camera sliders |
| 🔲 | Path recording & playback |
| 🔲 | Speed / acceleration graph overlay |
| 🔲 | Multiple simultaneous vehicles |
| 🔲 | Mobile gamepad API support |
| 🔲 | Docker-based one-command demo |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | [Three.js](https://threejs.org/) (`InstancedMesh`, `GLTFLoader`, `OrbitControls`) |
| Frontend build | TypeScript + Webpack |
| Backend | Python · Flask · Flask-SocketIO · eventlet |
| Controller input | [`approxeng.input`](https://approxeng.github.io/approxeng.input/) |

---

## 🤝 Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines and a list of good first issues.

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
