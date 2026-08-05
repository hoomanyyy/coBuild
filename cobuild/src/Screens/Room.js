import "../styles/Room.css";
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";

const CATEGORY_ICONS = {
  homework: "📚",
  coding: "💻",
  study: "📝",
  design: "🎨",
  music: "🎵",
  general: "💬"
};

function RoomScreen() {

  const location = useLocation();

  const navigate = useNavigate();

  const { id, category, name } = location.state || {};


  const [messageText, setMessageText] = useState("");

  const [showMembers, setShowMembers] = useState(false);

  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");

  const [messages, setMessages] = useState([]);

  const [members, setMembers] = useState([]);


  const messagesEndRef = useRef(null);



  async function sendMessage() {

    if (!messageText.trim()) return;

    if (!id || !username) return;


    const text = messageText;

    setMessageText("");


    socket.emit("sendMessage", {

      id: id,

      username: username,

      email: email,

      Message: text

    });


    try {

      await api.post("/api/saveMessage", {
        id: id,
        Message: text
      });

    } catch (err) {

      console.log("save message error:", err);
    }

  }



  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      sendMessage();

    }

  }



  useEffect(() => {

    if (!id) {
      navigate("/dashboard", { replace: true });
    }

  }, [id, navigate]);



  useEffect(() => {

    let cancelled = false;

    async function loadUser() {

      try {

        const response = await api.get("/api/getUserInformation");

        if (cancelled) return;

        setUsername(response.data.username || "unknown");
        setEmail(response.data.email || "");

      } catch (err) {

        if (cancelled) return;

        navigate("/login", { replace: true });
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };

  }, [navigate]);



  useEffect(() => {

    if (!id) return undefined;

    let cancelled = false;

    async function getMessages() {

      try {

        const response = await api.post("/api/getMessages", {
          room_id: id
        });

        if (cancelled) return;

        if (response.data.Message === true) {
          setMessages(Array.isArray(response.data.chats) ? response.data.chats : []);
        }

      } catch (err) {

        if (cancelled) return;

        console.log("get messages error:", err);
      }
    }

    getMessages();

    return () => {
      cancelled = true;
    };

  }, [id]);



  useEffect(() => {

    if (!id || !username) return undefined;


    function joinRoom() {

      socket.emit("join_room", {

        room_id: id,

        username: username

      });
    }


    function receiveMessage(data) {

      setMessages((prev) => [

        ...prev,

        {

          username: data.username,

          email: data.email,

          text: data.Message,

          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })

        }

      ]);

    }


    function userJoined(data) {

      setMessages((prev) => [

        ...prev,

        {

          system: true,

          text: `${data.username} joined room`

        }

      ]);

    }


    function roomMembers(data) {

      const list = Array.isArray(data.members) ? data.members : [];

      setMembers(list.map((item) => ({ username: item })));
    }


    socket.on("connect", joinRoom);
    socket.on("sendMessage", receiveMessage);
    socket.on("user_joined", userJoined);
    socket.on("room_members", roomMembers);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }


    return () => {

      socket.emit("leave_room");

      socket.off("connect", joinRoom);
      socket.off("sendMessage", receiveMessage);
      socket.off("user_joined", userJoined);
      socket.off("room_members", roomMembers);
    };

  }, [id, username]);



  useEffect(() => {

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

  }, [messages]);



  function avatarHue(name) {
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum = sum + name.charCodeAt(i);
    }
    return sum % 360;
  }



  return (

    <div className="room-screen">


      <header className="room-header">


        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <span className="back-icon">←</span>
          Rooms
        </button>


        <div className="room-header-info">

          <h1 className="room-header-name">
            {name}
          </h1>

          <span className="room-category-badge">
            {CATEGORY_ICONS[category] || "💬"} {category}
          </span>

        </div>


        <button
          className="members-toggle"
          onClick={() => setShowMembers(!showMembers)}
        >
          👥 {members.length}
        </button>


      </header>



      <div className="room-body">


        <main className="chat-panel">


          <div className="messages-list">


            {messages.length === 0 && (

              <div className="chat-empty-state">
                <span className="empty-icon">💬</span>
                <h3>No messages yet</h3>
                <p>Say hello and start conversation.</p>
              </div>

            )}


            {messages.map((msg, index) => {


              if (msg.system) {

                return (
                  <div className="system-message" key={index}>
                    {msg.text}
                  </div>
                );

              }


              const isOwn = msg.email
                ? msg.email === email
                : msg.username === username;

              const hue = avatarHue(msg.username || "?");


              return (

                <div
                  key={index}
                  className={`message-row ${
                    isOwn ? "message-row--own" : ""
                  }`}
                >


                  {!isOwn && (

                    <span
                      className="message-avatar"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${hue + 40}, 65%, 45%))`,
                        color: "#fff"
                      }}
                    >
                      {(msg.username || "?").charAt(0).toUpperCase()}
                    </span>

                  )}


                  <div className="message-bubble">


                    {!isOwn && (
                      <span className="message-sender">
                        {msg.username}
                      </span>
                    )}


                    <p className="message-text">
                      {msg.text}
                    </p>


                    <span className="message-time">
                      {msg.time}
                    </span>


                  </div>


                </div>

              );

            })}


            <div ref={messagesEndRef} />


          </div>



          <div className="message-input-bar">


            <textarea
              rows="1"
              value={messageText}
              placeholder="Type a message..."
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
            />


            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!messageText.trim()}
            >
              ➤
            </button>


          </div>


        </main>



        <aside
          className={`members-panel ${
            showMembers ? "members-panel--open" : ""
          }`}
        >


          <div className="members-header">
            <h3>Members</h3>
            <span className="members-count">{members.length}</span>
          </div>


          <ul className="members-list">

            {members.map((member, index) => {

              const isMe = member.username === username;
              const hue = avatarHue(member.username || "?");

              return (

                <li className="member-item" key={index}>

                  <span
                    className="member-avatar"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${hue + 40}, 65%, 45%))`
                    }}
                  >
                    {(member.username || "?").charAt(0).toUpperCase()}
                    <span className="member-dot" />
                  </span>

                  <span className="member-name">
                    {member.username}
                  </span>

                  {isMe && <span className="member-you">you</span>}

                </li>

              );

            })}

          </ul>


        </aside>


      </div>


    </div>

  );

}


export default RoomScreen;