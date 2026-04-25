from app import create_app
import os

# App initialize ho raha hai
app = create_app()

if __name__ == "__main__":
    # host='0.0.0.0' ka matlab hai ki aapke network ka koi bhi device (ESP32) 
    # is server ko access kar sakta hai laptop ki IP use karke.
    # port=5000 default hai, ise wahi rehne dete hain.
    
    print("🚀 IoT Dashboard Server Starting...")
    print("👉 Make sure your ESP32 is sending data to your Laptop's IP!")
    
    app.run(host='0.0.0.0', port=5000, debug=True)