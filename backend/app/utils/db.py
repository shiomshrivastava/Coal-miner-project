import psycopg2

def get_db_connection():
    return psycopg2.connect(
        "postgresql://postgres:Shiom_Trisha%404946@db.exydcpiaxeaxvwzsvntz.supabase.co:5432/postgres"
    )