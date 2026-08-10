import mysql.connector
from dotenv import load_dotenv
import os


load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")


def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        charset="utf8mb4"
    )


def select_one(query, values=()):
    con = get_connection()
    cursor = con.cursor(dictionary=True)

    cursor.execute(query, values)
    row = cursor.fetchone()

    cursor.close()
    con.close()

    return row


def select_all(query, values=()):
    con = get_connection()
    cursor = con.cursor(dictionary=True)

    cursor.execute(query, values)
    rows = cursor.fetchall()

    cursor.close()
    con.close()

    return rows


def execute(query, values=()):
    con = get_connection()
    cursor = con.cursor()

    cursor.execute(query, values)
    con.commit()

    new_id = cursor.lastrowid

    cursor.close()
    con.close()

    return new_id