import React, { useState } from 'react';
import AddMediaForm from './AddMediaForm';
import AddMediaFormNew from './AddMediaFormNew';
import './AddMediaVersionSelector.css';
import './AddMediaVersionSelector.css';

const AddMediaVersionSelector = ({ onAdded }) => {
  const [selectedVersion, setSelectedVersion] = useState('new'); // 'original' o 'new'

  const toggleVersion = () => {
    setSelectedVersion(prev => prev === 'original' ? 'new' : 'original');
  };

  return (
    <div className="addmedia-version-container">
      {/* Selector de versión */}
      <div className="version-selector">
        <div className="version-selector-header">
          <h3>Selecciona la versión del formulario:</h3>
          <div className="version-toggle">
            <button 
              className={`version-btn ${selectedVersion === 'original' ? 'active' : ''}`}
              onClick={() => setSelectedVersion('original')}
            >
              <i className="fas fa-file-alt"></i>
              Versión Original
            </button>
            <button 
              className={`version-btn ${selectedVersion === 'new' ? 'active' : ''}`}
              onClick={() => setSelectedVersion('new')}
            >
              <i className="fas fa-magic"></i>
              Versión Nueva (Profesional)
            </button>
          </div>
        </div>
        
        <div className="version-info">
          {selectedVersion === 'original' ? (
            <div className="version-description original">
              <div className="version-badge original">Original</div>
              <p><strong>Versión Actual:</strong> Diseño funcional y compacto con todas las características básicas implementadas.</p>
              <ul>
                <li>✅ Interfaz compacta y familiar</li>
                <li>✅ Todas las funcionalidades existentes</li>
                <li>✅ Diseño probado y estable</li>
                <li>✅ Búsqueda TMDb integrada</li>
              </ul>
            </div>
          ) : (
            <div className="version-description new">
              <div className="version-badge new">Nueva</div>
              <p><strong>Versión Profesional:</strong> Diseño moderno con UX mejorada, notificaciones en tiempo real y estilo profesional.</p>
              <ul>
                <li>🚀 Diseño profesional y moderno</li>
                <li>🎨 Hero section con efectos visuales</li>
                <li>🔔 Sistema de notificaciones avanzado</li>
                <li>📱 Responsive design optimizado</li>
                <li>✨ Animaciones y transiciones suaves</li>
                <li>🎯 UX mejorada con feedback visual</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Renderizar la versión seleccionada */}
      <div className="version-content">
        {selectedVersion === 'original' ? (
          <AddMediaForm onAdded={onAdded} />
        ) : (
          <AddMediaFormNew onAdded={onAdded} />
        )}
      </div>
    </div>
  );
};

export default AddMediaVersionSelector;
