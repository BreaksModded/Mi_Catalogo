import React, { useState, useEffect } from "react";
import "./DetailModal.css";
import "./AddMediaForm.css";
import "./AuthModal.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export default function AuthModal({ show, onClose, onAuthSuccess, isLogin: isLoginProp }) {
  const [isLogin, setIsLogin] = useState(isLoginProp ?? true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si cambia la prop isLogin, sincronizar estado
  useEffect(() => {
    setIsLogin(isLoginProp ?? true);
  }, [isLoginProp, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        // Login
        const loginUrl = `${BACKEND_URL}/auth/jwt/login`;
        const res = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: email,
            password,
          }),
          credentials: "include",
        });
        
        if (!res.ok) {
          // Solo leer la respuesta si hay error
          const responseText = await res.text();
          throw new Error("Credenciales incorrectas");
        }
        
        // Para respuesta 204 (No Content), no intentar parsear JSON
        setLoading(false);
        onAuthSuccess && onAuthSuccess();
        onClose();
      } else {
        // Register
        if (password !== repeatPassword) {
          setError("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }
        const res = await fetch(`${BACKEND_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Error al registrar");
        }
        setLoading(false);
        setIsLogin(true);
        setError("Registro exitoso. Ahora puedes iniciar sesión.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLogin ? "Iniciar sesión" : "Registrarse"}</h2>
        <form onSubmit={handleSubmit} className="add-media-form">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          <label>Contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          {!isLogin && (
            <>
              <label>Repetir contraseña</label>
              <input type="password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} required />
            </>
          )}
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="add-btn" disabled={loading}>
            {loading ? "Cargando..." : isLogin ? "Entrar" : "Registrarse"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button className="link-btn" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
