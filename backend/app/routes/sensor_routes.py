from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection
from app.services.alert_service import check_alert

sensor_bp = Blueprint('sensor', __name__)

# Global variable for real-time tracking (Zero lag for React)
latest_sensor_data = {}

@sensor_bp.route('/sensor-data', methods=['POST'])
def receive_data():
    global latest_sensor_data
    data = request.json
    
    # DEBUG: Terminal me check karne ke liye ki data aa raha he ya nahi
    print(f"📥 Received Data: {data}")
    
    # 1. Validation (Matches ESP32 key)
    if not data or 'device_id' not in data:
        return jsonify({"error": "Invalid data: 'device_id' missing"}), 400

    try:
        # 2. Extracting all values
        device_id = data.get('device_id')
        temp = float(data.get('temp', 0))
        hum = float(data.get('humidity', 0))
        bpm = float(data.get('bpm', 0))
        mq5 = int(data.get('mq5', 0))
        mq9 = int(data.get('mq9', 0))
        mq135 = int(data.get('mq135', 0))
        hardware_alert = data.get('alert', 'NO')

        # 3. Update global variable for React Dashboard
        latest_sensor_data = data

        # 4. Smart Alert Check
        alert_msg, is_danger = check_alert(temp, bpm, mq135)

        # 5. Database Operations
        conn = get_db_connection()
        cur = conn.cursor()

        # Check if device exists
        cur.execute("SELECT id FROM miners WHERE device_id=%s", (str(device_id),))
        miner = cur.fetchone()

        if not miner:
            print(f"⚠️ Warning: Device ID {device_id} not found in DB!")
            return jsonify({"error": f"Device ID {device_id} not registered"}), 404

        miner_id = miner[0]

        # 6. Insert All Vitals
        cur.execute(
            """INSERT INTO sensor_data 
               (miner_id, mq135, temp, humidity, bpm, mq5, mq9) 
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (miner_id, mq135, temp, hum, bpm, mq5, mq9)
        )

        # 7. Alert Logging
        final_alert_type = "none"
        if is_danger or hardware_alert == "YES":
            final_alert_type = alert_msg if is_danger else "HARDWARE_TRIGGERED"
            cur.execute(
                """INSERT INTO alerts 
                   (miner_id, trigger_value, alert_type, sensor_type, source, is_resolved) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (miner_id, mq135, final_alert_type, "Multi-Sensor", "auto", False)
            )

        conn.commit()
        print(f"✅ Data synced for Miner {miner_id}")
        return jsonify({"message": "Success", "alert": final_alert_type}), 200

    except Exception as e:
        print(f"❌ Backend Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@sensor_bp.route('/live-status', methods=['GET'])
def get_live_status():
    if not latest_sensor_data:
        return jsonify({"message": "No data available"}), 204
    return jsonify(latest_sensor_data), 200

@sensor_bp.route('/data', methods=['GET'])
def get_data():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT miner_id, mq135, temp, humidity, bpm, timestamp 
            FROM sensor_data 
            ORDER BY timestamp DESC LIMIT 20
        """)
        rows = cur.fetchall()
        history = []
        for row in rows:
            history.append({
                "miner_id": row[0], "mq135": row[1], "temp": row[2],
                "humidity": row[3], "bpm": row[4], "time": row[5].strftime("%H:%M:%S")
            })
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()