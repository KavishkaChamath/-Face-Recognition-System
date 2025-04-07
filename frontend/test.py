# from flask import Flask
# from flask_socketio import SocketIO, emit

# app = Flask(__name__)
# socketio = SocketIO(app, cors_allowed_origins="*")  # Allow frontend connection

# @socketio.on("connect")
# def handle_connect():
#     print("Client connected!")  # This prints when React connects
#     emit("server_message", {"message": "Connected"})

# @socketio.on("register_face")
# def handle_register_face(data):
#     print(f"Received face registration request: {data}")
#     emit("server_message", {"message": f"Registering face for {data['name']}"})

# if __name__ == "__main__":
#     socketio.run(app, host="0.0.0.0", port=5000, debug=True)


