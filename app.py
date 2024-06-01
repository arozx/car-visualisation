from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO

app = Flask(__name__, static_url_path="/static")

# Initial position of the object
object_position = {"x": 0, "y": 0, "z": 0}


# Serve static files (JavaScript)
@app.route("/static/js/<path:path>")
def static_js(path):
    return app.send_static_file(f"js/{path}")


# Ignore favicon request
@app.route("/favicon.ico")
def favicon():
    return ""


socketio = SocketIO(app)

# Initial position of the object
object_position = {"x": 0, "y": 0, "z": 0}


@app.route("/move_object", methods=["POST"])
def move_object():
    global object_position
    data = request.json
    object_position["x"] = data.get("x", object_position["x"])
    object_position["y"] = data.get("y", object_position["y"])
    object_position["z"] = data.get("z", object_position["z"])
    socketio.emit("position_changed", object_position, namespace="/")
    return jsonify(object_position)


@app.route("/object")
def object():
    return render_template("object.html")


@app.route("/get_position", methods=["GET"])
def get_position():
    return jsonify(object_position)


if __name__ == "__main__":
    socketio.run(app, debug=True)
