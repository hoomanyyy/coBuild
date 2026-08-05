import mysql.connector


def get_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="",
        database="cobuild",
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