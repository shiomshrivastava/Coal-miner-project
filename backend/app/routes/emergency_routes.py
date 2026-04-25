from flask import Blueprint, request, jsonify
from app.utils.db import get_db_connection

emergency_bp = Blueprint('emergency', __name__)

@emergency_bp.route('/emergency', methods=['POST'])
def emergency():
    data = request.json or {}
    miner_id = data.get('miner_id')

    # 1. Validation: Check if miner_id exists
    if miner_id is None:
        return jsonify({"error": "miner_id is required"}), 400

    try:
        miner_id = int(miner_id)
    except (TypeError, ValueError):
        return jsonify({"error": "miner_id must be a number"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 2. Check if miner actually exists in the miners table
        cur.execute("SELECT id FROM miners WHERE id=%s", (miner_id,))
        miner = cur.fetchone()

        if not miner:
            return jsonify({"error": "Invalid miner_id - Miner not found"}), 404

        # 3. Updated INSERT query for the new Alerts Schema
        # gas_value -> trigger_value (0 rakha he kyunki manual button he)
        # sensor_type -> Manual SOS
        cur.execute(
            """INSERT INTO alerts 
               (miner_id, trigger_value, alert_type, sensor_type, source, is_resolved) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (miner_id, 0, "CRITICAL EMERGENCY", "Manual SOS Button", "manual", False)
        )

        conn.commit()
        print(f"🚨 SOS Alert received for Miner ID: {miner_id}")
        return jsonify({"message": "Emergency alert created successfully", "status": "SOS_SENT"}), 201

    except Exception as e:
        print(f"❌ Emergency Route Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()