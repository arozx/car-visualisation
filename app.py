from dataclasses import dataclass

from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO

app = Flask(__name__, static_folder="frontend/public")
socketio = SocketIO(app)


@dataclass
class Position:
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0


position = Position()


# Ignore favicon request
@app.route("/favicon.ico")
def favicon():
    return ""


# API endpoint to move the object
@app.route("/move_object", methods=["POST"])
def move_object():
    data = request.json
    position.x = data.get("x", position.x)
    position.y = data.get("y", position.y)
    position.z = data.get("z", position.z)
    socketio.emit("position_changed", position.__dict__, namespace="/")
    return jsonify(position.__dict__)


@app.route("/get_position", methods=["GET"])
def get_position():
    return jsonify(position.__dict__)


# Serve the index.html file from the frontend public directory
@app.route("/")
def index():
    return send_from_directory("frontend/public", "index.html")


# Serve static files from the frontend directory
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory("frontend/public", filename)


if __name__ == "__main__":
    socketio.run(app, debug=True)
