import psycopg2

def get_db_connection():
    return psycopg2.connect(
        "postgresql://postgres.exydcpiaxeaxvwzsvntz:Shiom_Trisha%404946@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
    )