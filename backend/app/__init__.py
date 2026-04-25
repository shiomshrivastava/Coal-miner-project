from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # Flask Session aur Cookies ke liye secret key
    app.secret_key = "supersecretkey" 

    # React/Frontend ke saath connectivity allow karne ke liye
    CORS(app)

    # Blueprints ko import karna
    from app.routes.auth_routes import auth_bp
    from app.routes.emergency_routes import emergency_bp
    from app.routes.sensor_routes import sensor_bp

    # Blueprints register karna
    # Auth aur Emergency routes direct root par hain
    app.register_blueprint(auth_bp)
    app.register_blueprint(emergency_bp)
    
    # Sensor routes ko '/sensor' prefix ke saath register kiya
    # Isse ESP32 'http://IP:5000/sensor/sensor-data' hit kar payega
    app.register_blueprint(sensor_bp, url_prefix='/sensor')

    return app