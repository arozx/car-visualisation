from flask import Flask, jsonify, request, send_from_directory
from flask_socketio import SocketIO

app = Flask(__name__, static_folder="frontend/public")
socketio = SocketIO(app)


# Ignore favicon request
@app.route("/favicon.ico")
def favicon():
    return ""


object_position = {"x": 0, "y": 0, "z": 0}


# API endpoint to move the object
@app.route("/move_object", methods=["POST"])
def move_object():
    global object_position
    data = request.json
    object_position["x"] = data.get("x", object_position["x"])
    object_position["y"] = data.get("y", object_position["y"])
    object_position["z"] = data.get("z", object_position["z"])
    socketio.emit("position_changed", object_position, namespace="/")
    return jsonify(object_position)


@app.route("/get_position", methods=["GET"])
def get_position():
    return jsonify(object_position)


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
