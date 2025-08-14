import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./AuthModal.css";
import "./PasswordReset.css";
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export default function PasswordReset() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Extraer token de la URL
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    
    if (!resetToken) {
      setError(t('auth.invalidToken') || "Token de recuperación no válido o faltante");
      return;
    }
    
    setToken(resetToken);
  }, [location, t]);

  const validateForm = () => {
    if (!password || password.length < 6) {
      setError(t('auth.passwordMinLength') || "La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch') || "Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        throw new Error(data.detail || t('auth.resetError') || "Error al restablecer la contraseña");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <div className="password-reset-loading">
            <div className="loader"></div>
            <p>{t('common.loading') || "Cargando..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="password-reset-container">
        <div className="password-reset-card">
          <div className="password-reset-success">
            <div className="success-icon">✓</div>
            <h2>{t('auth.passwordResetSuccess') || "¡Contraseña restablecida!"}</h2>
            <p>{t('auth.passwordUpdateSuccess') || "Tu contraseña ha sido actualizada exitosamente."}</p>
            <p>{t('auth.redirectingMessage') || "Serás redirigido al inicio en unos segundos..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-card">
        <div className="password-reset-header">
          <div className="app-logo">
            <span className="logo-icon">🎬</span>
            <h1>{t('common.appName') || "Mi Catálogo"}</h1>
          </div>
          <h2>{t('auth.resetPasswordTitle') || "Restablecer contraseña"}</h2>
          <p>{t('auth.resetPasswordSubtitle') || "Introduce tu nueva contraseña"}</p>
        </div>
        
        <div className="password-reset-content">
          <form onSubmit={handleSubmit} className="password-reset-form">
            <div className="form-group">
              <label className="form-label">{t('auth.newPassword') || "Nueva contraseña"}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input ${error && password.length < 6 ? 'error' : ''}`}
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('auth.confirmPassword') || "Confirmar contraseña"}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`form-input ${error && password !== confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && <div className="form-error">{error}</div>}
            
            <button 
              type="submit" 
              className="btn-primary password-reset-btn" 
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <div className="loader small"></div>
                  {t('auth.updating') || "Actualizando..."}
                </>
              ) : (
                t('auth.resetPasswordButton') || "Restablecer contraseña"
              )}
            </button>
          </form>
          
          <div className="password-reset-footer">
            <button 
              className="link-btn"
              onClick={() => navigate('/')}
            >
              ← {t('common.backToHome') || "Volver al inicio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
