import random
import datetime

import bcrypt
import requests
import uvicorn

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from database.mysql import select_one, select_all, execute


BASE_URL = "https://api.emailjs.com/api/v1.0/email/send"

CATEGORIES = ["homework", "coding", "study", "design", "music", "general"]

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key="a8f3d9c2e71b4f9a9d6e8c7b1a5c3d",
    session_cookie="cobuild_session",
    max_age=60 * 60 * 24 * 7,
    same_site="lax",
    https_only=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def error(message, code=400):
    return JSONResponse(
        status_code=code,
        content={"Message": False, "error": message}
    )


def find_user(email):
    return select_one("SELECT * FROM users WHERE email = %s", (email,))


def logged_in_email(request):
    return request.session.get("userCoBuild")


def sendEmail(otp_code, receiver):
    data = {
        "service_id": "service_82l5ywm",
        "template_id": "template_r8olxxv",
        "user_id": "FMn-Wl0Em0GizJnuk",
        "accessToken": "amzm5tQHxTEemoZmhWoFc",
        "template_params": {
            "passcode": otp_code,
            "email": receiver,
            "time": "5 minutes"
        }
    }

    try:
        response = requests.post(BASE_URL, json=data, timeout=10)
        print("email status:", response.status_code, response.text)
    except Exception as err:
        print("send email error:", err)


@app.post("/api/signup")
def signup(data: dict):

    email = str(data.get("email", "")).strip().lower()
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    if not email or not username or not password:
        return error("Please fill in all fields.")

    if len(password) < 8:
        return error("Password must be at least 8 characters.")

    user = find_user(email)

    if user:
        return error("An account with this email already exists.", 409)

    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    otp = str(random.randint(100000, 999999))
    expire = datetime.datetime.now() + datetime.timedelta(minutes=5)

    execute(
        "INSERT INTO users (username, email, password, otp_code, otp_expire) VALUES (%s, %s, %s, %s, %s)",
        (username, email, hashed_password, otp, expire)
    )

    sendEmail(otp, email)

    return {"Message": True}


@app.post("/api/verification")
def verification(request: Request, data: dict):

    email = str(data.get("Email", "")).strip().lower()
    code = str(data.get("Code", "")).strip()

    user = find_user(email)

    if user is None or not user["otp_code"]:
        return error("Invalid or expired code.")

    if user["otp_expire"] is None or user["otp_expire"] < datetime.datetime.now():
        return error("Invalid or expired code.")

    if str(user["otp_code"]) != code:
        return error("Invalid or expired code.")

    execute(
        "UPDATE users SET otp_code = NULL, otp_expire = NULL WHERE id = %s",
        (user["id"],)
    )

    request.session.clear()
    request.session["userCoBuild"] = email

    return {"Message": True}


@app.post("/api/login")
def login(request: Request, data: dict):

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return error("Please fill in all fields.")

    user = find_user(email)

    if user is None:
        return error("Invalid email or password.", 401)

    if not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return error("Invalid email or password.", 401)

    request.session.clear()
    request.session["userCoBuild"] = email

    return {"Message": True}


@app.get("/api/checkSession")
def checkSession(request: Request):
    if logged_in_email(request):
        return {"Message": True}
    return {"Message": False}


@app.post("/api/logout")
def logout(request: Request):
    request.session.clear()
    return {"Message": True}


@app.api_route("/api/getUserInformation", methods=["GET", "POST"])
def getUserInformation(request: Request):

    email = logged_in_email(request)

    if email is None:
        return error("Not logged in", 401)

    user = select_one(
        "SELECT email, username FROM users WHERE email = %s",
        (email,)
    )

    if user is None:
        return error("User not found", 401)

    return {
        "Message": True,
        "email": user["email"],
        "username": user["username"],
        "status": "online"
    }


@app.post("/api/create_room")
def create_room(request: Request, data: dict):

    email = logged_in_email(request)

    if email is None:
        return error("Not logged in", 401)

    name = str(data.get("name", "")).strip()
    category = str(data.get("category", "")).strip().lower()

    if len(name) < 2:
        return error("Room name is too short.")

    if category not in CATEGORIES:
        return error("Unknown category.")

    room_id = execute(
        "INSERT INTO rooms (name, category, owner_email) VALUES (%s, %s, %s)",
        (name, category, email)
    )

    return {
        "Message": True,
        "room_id": room_id
    }


@app.get("/api/getRooms")
def getRooms(request: Request):

    if logged_in_email(request) is None:
        return error("Not logged in", 401)

    data = select_all(
        "SELECT id, name, category, owner_email FROM rooms ORDER BY id DESC"
    )

    rooms = []

    for room in data:
        rooms.append({
            "id": room["id"],
            "name": room["name"],
            "category": room["category"],
            "owner_email": room["owner_email"]
        })

    return {
        "Message": True,
        "rooms": rooms
    }


@app.post("/api/saveMessage")
def saveMessage(request: Request, data: dict):

    email = logged_in_email(request)

    if email is None:
        return error("Not logged in", 401)

    room_id = data.get("id")
    text = str(data.get("Message", "")).strip()

    if not room_id or not text:
        return error("Empty message.")

    user = select_one("SELECT username FROM users WHERE email = %s", (email,))

    if user is None:
        return error("User not found", 401)

    execute(
        "INSERT INTO chats (room_id, text, `from`, email) VALUES (%s, %s, %s, %s)",
        (room_id, text, user["username"], email)
    )

    return {"Message": True}


@app.post("/api/getMessages")
def getMessages(request: Request, data: dict):

    if logged_in_email(request) is None:
        return error("Not logged in", 401)

    room_id = data.get("room_id")

    if not room_id:
        return error("Room id is required.")

    rows = select_all(
        "SELECT id, text, `from`, email, created_at FROM chats WHERE room_id = %s ORDER BY id ASC",
        (room_id,)
    )

    chats = []

    for row in rows:
        chats.append({
            "username": row["from"],
            "email": row["email"],
            "text": row["text"],
            "time": row["created_at"].strftime("%H:%M") if row["created_at"] else ""
        })

    return {
        "Message": True,
        "chats": chats
    }

    
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        reload=True,
        host="localhost",
        port=5000
    )