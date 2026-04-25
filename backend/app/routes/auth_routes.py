from flask import Blueprint, request, jsonify, session
from app.utils.db import get_db_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        name = data.get('name')
        password = data.get('password')

        conn = get_db_connection()
        cur = conn.cursor()

        # In Production: Use password hashing!
        cur.execute("SELECT id, role FROM users WHERE name=%s AND password=%s", (name, password))
        user = cur.fetchone()

        if user:
            session['user_id'] = user[0]
            session['role'] = user[1]
            return jsonify({"role": user[1]})
        
        return jsonify({"error": "Invalid Credentials"}), 401
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()