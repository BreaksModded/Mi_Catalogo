import React, { useEffect, useState } from 'react';
import './ListasModal.css';

const API_URL = 'http://localhost:8000/listas';

export default function ListasModal({ mediaId, listas, listasDeMedia, onClose, onListasChange }) {
  const [allListas, setAllListas] = useState(listas || []);
  const [checked, setChecked] = useState(listasDeMedia || []);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setAllListas(data);
        setShowForm(data.length === 0);
      });
  }, []);

  const handleCheck = async (listaId, isChecked) => {
    setLoading(true);
    setFeedback('');
    setError('');
    setChecked(prev => isChecked ? [...prev, listaId] : prev.filter(id => id !== listaId));
    try {
      const url = `${API_URL}/${listaId}/${isChecked ? 'add_media' : 'remove_media'}/${mediaId}`;
      const method = isChecked ? 'POST' : 'DELETE';
      const res = await fetch(url, { method });
      if (!res.ok) throw new Error('Error');
      setFeedback(isChecked ? 'Añadido a la lista' : 'Eliminado de la lista');
      // Refresca listas y checked
      const listasRes = await fetch(API_URL);
      const listasData = await listasRes.json();
      setAllListas(listasData);
      if (onListasChange) onListasChange();
    } catch {
      setError('No se pudo actualizar la lista');
    }
    setLoading(false);
  };

  const handleCrearLista = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion: descripcion || "" })
      });
      if (!res.ok) throw new Error('Error al crear la lista');
      const nueva = await res.json();
      setAllListas(listas => [...listas, nueva]);
      setChecked(prev => [...prev, nueva.id]); // Marca la nueva lista
      // Añade la media a la nueva lista directamente
      await fetch(`${API_URL}/${nueva.id}/add_media/${mediaId}`, { method: 'POST' });
      setNombre('');
      setDescripcion('');
      setFeedback('Lista creada y media añadida');
    } catch {
      setError('No se pudo crear la lista');
    }
    setLoading(false);
  };


  return (
    <div className="listas-modal-bg" onClick={e => { if (e.target.classList.contains('listas-modal-bg')) onClose(); }}>
      <div className="listas-modal">
        <button className="listas-modal-close" onClick={onClose} aria-label="Cerrar">
          <span aria-hidden="true">×</span>
        </button>
        <h2>Listas</h2>
        <div className="listas-list">
  {allListas.length === 0 ? (
    <div className="listas-vacio">No hay listas creadas todavía.</div>
  ) : (
    allListas.map(lista => (
      <div key={lista.id} className={`listas-item-row ${checked.includes(lista.id) ? 'checked' : ''}`}>
        <div className="listas-item-info">
          <span className="listas-nombre">{lista.nombre}</span>
          {lista.descripcion && <span className="listas-desc">{lista.descripcion}</span>}
        </div>
        {checked.includes(lista.id) ? (
          <button
            className="listas-action-btn quitar"
            disabled={loading}
            onClick={() => handleCheck(lista.id, false)}
          >Quitar</button>
        ) : (
          <button
            className="listas-action-btn añadir"
            disabled={loading}
            onClick={() => handleCheck(lista.id, true)}
          >Añadir</button>
        )}
      </div>
    ))
  )}
</div>
        {/* Botón para mostrar el formulario */}
        <div className="listas-nueva-wrapper">
          {!showForm && (
            <button className="listas-nueva-toggle" onClick={() => setShowForm(true)}>
              + Nueva lista
            </button>
          )}
          {showForm && (
            <form className="listas-form" onSubmit={handleCrearLista}>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Nombre de la lista"
                required
              />
              <input
                type="text"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                placeholder="Descripción (opcional)"
              />
              <button type="submit" disabled={loading}>Crear</button>
              <button type="button" className="listas-form-cancelar" onClick={() => setShowForm(false)} disabled={loading}>Cancelar</button>
              {error && <div className="listas-error">{error}</div>}
              {feedback && <div className="listas-feedback">{feedback}</div>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}