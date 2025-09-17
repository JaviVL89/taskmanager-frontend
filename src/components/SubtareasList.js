import React, { useState } from 'react';

function SubtareasList({ subtareas, onActualizar, tareaId }) {
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [edicionTexto, setEdicionTexto] = useState('');

  const agregarSubtarea = async () => {
    if (!nuevaSubtarea.trim()) return;

    const nueva = { titulo: nuevaSubtarea, completada: false };

    const res = await fetch(`http://localhost:8080/api/tareas/${tareaId}/subtareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva)
    });

    if (res.ok) {
      const tareaActualizada = await res.json();
      onActualizar(tareaActualizada);
      setNuevaSubtarea('');
    }
  };

  const eliminarSubtarea = async (subtareaId) => {
    const res = await fetch(`http://localhost:8080/api/tareas/${tareaId}/subtareas/${subtareaId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      const tareaActualizada = await res.json();
      onActualizar(tareaActualizada);
    }
  };

  const toggleCompletada = async (subtarea) => {
    const actualizada = {
      ...subtarea,
      completada: !subtarea.completada
    };

    const res = await fetch(`http://localhost:8080/api/tareas/${tareaId}/subtareas/${subtarea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actualizada)
    });

    if (res.ok) {
      const tareaActualizada = await res.json();
      onActualizar(tareaActualizada);
    }
  };

  const guardarEdicion = async (subtareaId) => {
    const res = await fetch(`http://localhost:8080/api/tareas/${tareaId}/subtareas/${subtareaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: edicionTexto })
    });

    if (res.ok) {
      const tareaActualizada = await res.json();
      onActualizar(tareaActualizada);
      setEditandoId(null);
      setEdicionTexto('');
    }
  };

  return (
    <div className="mt-3">
      <h6 className="mb-2">📝 <strong>Subtareas</strong></h6>

      <ul className="list-group list-group-flush mb-2">
        {subtareas?.map((sub) => (
          <li key={sub.id} className="list-group-item py-1 px-2 d-flex align-items-center justify-content-between">
            <div className="form-check flex-grow-1 d-flex align-items-center">
              <input
                className="form-check-input me-2"
                type="checkbox"
                checked={sub.completada}
                onChange={() => toggleCompletada(sub)}
                id={`sub-${sub.id}`}
              />

              {editandoId === sub.id ? (
                <div className="d-flex align-items-center w-100">
                  <input
                    type="text"
                    className="form-control form-control-sm me-2"
                    value={edicionTexto}
                    onChange={(e) => setEdicionTexto(e.target.value)}
                  />
                  <button className="btn btn-success btn-sm me-1" onClick={() => guardarEdicion(sub.id)}>✔</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditandoId(null)}>✖</button>
                </div>
              ) : (
                <label htmlFor={`sub-${sub.id}`} className="form-check-label flex-grow-1" style={{ textDecoration: sub.completada ? 'line-through' : 'none' }}>
                  {sub.titulo}
                </label>
              )}
            </div>

            {editandoId !== sub.id && (
              <div className="ms-2 d-flex">
                <button
                  className="btn btn-outline-primary btn-sm me-1"
                  onClick={() => {
                    setEditandoId(sub.id);
                    setEdicionTexto(sub.titulo);
                  }}
                >
                  ✎
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => eliminarSubtarea(sub.id)}
                >
                  🗑
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="input-group input-group-sm">
        <input
          type="text"
          className="form-control"
          placeholder="Nueva subtarea"
          value={nuevaSubtarea}
          onChange={(e) => setNuevaSubtarea(e.target.value)}
        />
        <button className="btn btn-primary" onClick={agregarSubtarea}>
          Añadir
        </button>
      </div>
    </div>
  );
}

export default SubtareasList;
