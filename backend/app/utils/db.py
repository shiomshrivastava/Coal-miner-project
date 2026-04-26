import psycopg2

def get_db_connection():
    return psycopg2.connect(
        host="db.exydcpiaxeaxvwzsvntz.supabase.co",
        database="postgres",
        user="postgres",
        password="Shiom_Trisha@4946",
        port="5432"
    )