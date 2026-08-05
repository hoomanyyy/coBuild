import "../styles/Dashboard.css";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { isUnauthorized } from "../api";
import socket from "../socket";


const CATEGORIES = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "homework", label: "Homework", icon: "📚" },
  { id: "coding", label: "Coding", icon: "💻" },
  { id: "study", label: "Study Group", icon: "📝" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "general", label: "General", icon: "💬" },
];

function DashboardScreen() {

  const [rooms, setRooms] = useState([]);

  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [roomCategory, setRoomCategory] = useState("general");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [status, setStatus] = useState("offline");

  const [username, setUsername] = useState("unknown");
  const [email, setEmail] = useState("");

  const creatingRef = useRef(false);

  const filteredRooms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rooms.filter((room) => {

      const matchesCategory =
        activeCategory === "all" ||
        room.category === activeCategory;

      const matchesSearch =
        term === "" ||
        (room.name && room.name.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });

  }, [rooms, searchTerm, activeCategory]);

  const getCategoryMeta = (categoryId) =>
    CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];

  const goToLogin = useCallback(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  const getRooms = useCallback(async () => {
    try {
      const response = await api.get("/api/getRooms");
      setRooms(Array.isArray(response.data.rooms) ? response.data.rooms : []);
    } catch (err) {
      if (isUnauthorized(err)) {
        goToLogin();
        return;
      }
      console.log("get rooms error:", err);
    }
  }, [goToLogin]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const session = await api.get("/api/checkSession");
        if (cancelled) return;

        if (session.data.Message !== true) {
          goToLogin();
          return;
        }

        const info = await api.get("/api/getUserInformation");
        if (cancelled) return;

        setUsername(info.data.username || "unknown");
        setEmail(info.data.email || "");
        setStatus(info.data.status || "offline");

        await getRooms();

      } catch (err) {
        if (cancelled) return;
        if (isUnauthorized(err)) {
          goToLogin();
          return;
        }
        console.log("dashboard error:", err);
      }
    }

    start();

    return () => {
      cancelled = true;
    };
  }, [goToLogin, getRooms]);

  useEffect(() => {
    if (!email) return undefined;

    const handleConnect = () => {
      console.log("socket connected:", socket.id);
      socket.emit("join", email);
    };

    const handleError = (err) => {
      console.log("socket error:", err && err.message ? err.message : err);
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };
  }, [email]);

  function JoinRoom(room) {

    navigate("/room", {
      state: {
        id: room.id,
        category: room.category,
        name: room.name
      }
    });
  }

  async function logout() {
    try {
      await api.post("/api/logout");
    } catch (err) {
      console.log("logout error:", err);
    } finally {
      socket.disconnect();
      goToLogin();
    }
  }

  async function createRoom() {

    const name = roomName.trim();

    if (!name || creatingRef.current) return;

    creatingRef.current = true;

    try {
      const response = await api.post("/api/create_room", {
        name: name,
        category: roomCategory
      });

      if (response.data.Message === true) {

        setShowCreateModal(false);
        setRoomName("");
        setRoomCategory("general");

        await getRooms();
      }

    } catch (err) {
      if (isUnauthorized(err)) {
        goToLogin();
        return;
      }
      console.log("create room error:", err);
    } finally {
      creatingRef.current = false;
    }
  }

  return (
    <div className="dashboard-screen">
      {/* Header */}
      <header className="dashboard-header">
        <button className="profile-summary" type="button">
          <span className="avatar">
              <span className="avatar-fallback">{username.charAt(0).toUpperCase()}</span>
            <span className={`status-dot status-dot--${status}`} />
          </span>
          <span className="profile-text">
            <span className="profile-name">{username}</span>
            <span className="profile-status">{status}</span>
          </span>
        </button>

    <button className="logout-button" onClick={logout}>
      <span className="logout-icon">↪</span>
      Logout
    </button>

        <div className="dashboard-title">
          <h1>Rooms</h1>
          <p>Find people, learn together, build together</p>
        </div>

        <button className="auth-button create-room-btn" type="button" onClick={() => setShowCreateModal(true)}>
          + Create Room
        </button>
      </header>

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <nav className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-tab ${activeCategory === cat.id ? "category-tab--active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </nav>

      {/* Room grid */}
      <main className="room-grid">
        {filteredRooms.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🌙</span>
            <h3>No rooms found</h3>
            <p>Try a different search or category.</p>
          </div>
        )}

    {filteredRooms.map((room)=>{

      const category = getCategoryMeta(room.category);

      return (
        <article className="room-card" key={room.id}>

          <div className="room-card-header">

            <span className="room-category-badge">
              {category.icon} {category.label}
            </span>

          </div>


          <h3 className="room-name">
            {room.name}
          </h3>


          <p className="room-description">
            Owner: {room.owner_email}
          </p>


          <div className="room-card-footer">

            <button 
              className="join-btn"
              type="button"
              onClick={() => JoinRoom(room)}
            >
              Join
            </button>

          </div>


        </article>
      )

    })}
      </main>

      {/* Create room modal (UI only) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create a new room</h2>

            <label className="field-label" htmlFor="room-name">
              Room name
            </label>
            <input id="room-name" value={roomName} onChange={(e) => setRoomName(e.target.value)} type="text" placeholder="e.g. Calculus Homework Help" />

            <label className="field-label" htmlFor="room-category">
              Category
            </label>
            <select id="room-category" value={roomCategory} onChange={(e) => setRoomCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="button" className="auth-button" onClick={createRoom}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardScreen;