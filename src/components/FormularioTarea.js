// src/components/FormularioTarea.js

import React, { useState } from 'react';

function FormularioTarea({ onTareaCreada }) {
  const [titulo, setTitulo] = useState('');
  const [estado, setEstado] = useState('pendiente');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevaTarea = { titulo, estado };

    try {
      const res = await fetch('http://localhost:8080/api/tareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaTarea),
      });

      if (res.ok) {
        const tareaCreada = await res.json();
        onTareaCreada(tareaCreada);
        setTitulo('');
        setEstado('pendiente');
      } else {
        console.error('Error al crear tarea:', res.status);
      }
    } catch (err) {
      console.error('Error de red al crear tarea:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-3 border rounded bg-light">
      <h5 className="mb-3">➕ Nueva Tarea</h5>

      <div className="mb-3">
        <label className="form-label">Título</label>
        <input
          type="text"
          className="form-control"
          placeholder="Título de la tarea"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Estado</label>
        <select
          className="form-select"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
        </select>
      </div>

      <button type="submit" className="btn btn-primary">Añadir tarea</button>
    </form>
  );
}

export default FormularioTarea;
