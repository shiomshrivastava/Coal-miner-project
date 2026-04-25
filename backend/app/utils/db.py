import psycopg2
import os

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="iot_db",
        user="postgres",
        password="root"
    )