import React, { useEffect, useState } from 'react';

function TareaList() {
  const [tareas, setTareas] = useState([]);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '', visible: false });
  const [errorFormulario, setErrorFormulario] = useState('');
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [confirmarCompletar, setConfirmarCompletar] = useState(null);
  const [modoCreacion, setModoCreacion] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [formulario, setFormulario] = useState({
    titulo: '',
    prioridad: 'media',
    fechaLimite: '',
    horaLimite: ''
  });

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const url = estadoFiltro === 'todos'
      ? 'http://localhost:8080/api/tareas'
      : `http://localhost:8080/api/tareas/estado/${estadoFiltro}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setTareas(ordenarTareas(data)))
      .catch(console.error);
  }, [estadoFiltro]);

  const mostrarMensaje = (texto, tipo = 'success', tiempo = 3000) => {
  setMensaje({ texto, tipo, visible: false });
  
  setTimeout(() => {
    setMensaje({ texto, tipo, visible: true });
  }, 10); 

  setTimeout(() => {
    setMensaje(prev => ({ ...prev, visible: false }));
  }, tiempo - 500);

  setTimeout(() => {
    setMensaje({ texto: '', tipo: '', visible: false });
  }, tiempo);
};

  const ordenarTareas = (lista) => {
    const prioridadValor = { alta: 1, media: 2, baja: 3 };
    return [...lista].sort((a, b) => {
      const pA = prioridadValor[a.prioridad] || 4;
      const pB = prioridadValor[b.prioridad] || 4;
      if (pA !== pB) return pA - pB;

      const fechaA = a.createdAt || a.fechaLimite || '';
      const fechaB = b.createdAt || b.fechaLimite || '';
      return fechaA.localeCompare(fechaB);
    });
  };

  const actualizarTarea = async (actualizada) => {
    const res = await fetch(`http://localhost:8080/api/tareas/${actualizada.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actualizada),
    });

    if (res.ok) {
      const nueva = await res.json();
      setTareas(ordenarTareas(tareas.map(t => t.id === nueva.id ? nueva : t)));
      mostrarMensaje('Tarea actualizada.');
    }
  };

  const crearTareaDesdeModal = async () => {
    setErrorFormulario('');
    const nueva = {
      titulo: formulario.titulo.trim(),
      prioridad: formulario.prioridad,
      estado: 'pendiente',
      fechaLimite: formulario.fechaLimite,
      horaLimite: formulario.horaLimite || ''
    };

    try {
      const res = await fetch('http://localhost:8080/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nueva),
      });

      if (res.ok) {
        const tareaCreada = await res.json();
        setTareas(ordenarTareas([...tareas, tareaCreada]));
        mostrarMensaje('Tarea creada.');
        setFormulario({ titulo: '', prioridad: 'media', fechaLimite: '', horaLimite: '' });
        setModoCreacion(false);
      } else if (res.status === 400) {
        const datos = await res.json();
        if (datos.errors && Array.isArray(datos.errors)) {
          setErrorFormulario(datos.errors.map(e => e.message).join(' | '));
        } else if (datos.message) {
          setErrorFormulario(datos.message);
        } else {
          setErrorFormulario('Error de validación.');
        }
      } else {
        setErrorFormulario('Error al crear tarea.');
      }
    } catch {
      setErrorFormulario('Error de conexión con el servidor.');
    }
  };

  const completarTarea = () => {
    if (!confirmarCompletar) return;
    actualizarTarea({ ...confirmarCompletar, estado: 'completada' });
    setConfirmarCompletar(null);
  };

  const getColorTarjeta = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-light-danger';
      case 'media': return 'bg-light-warning';
      case 'baja': return 'bg-light-info';
      default: return 'bg-light';
    }
  };

  const renderColumna = (titulo, lista, _, bgColor) => (
    <div className="col-md-3 mb-4">
      <div className="p-3 rounded border shadow-sm" style={{ backgroundColor: bgColor }}>
        <h5 className="text-center fw-bold">{titulo}</h5>
        <p className="text-muted text-center small">Total: {lista.length}</p>

        {lista.map(t => {
          const vencida = t.fechaLimite && t.fechaLimite < hoy;

          return (
            <div
              key={t.id}
              className={`card mb-2 ${getColorTarjeta(t.prioridad)} tarea-tarjeta`}
              onClick={() => {
                if (t.estado === 'completada' || vencida) {
                  mostrarMensaje('⚠️ Esta tarea no se puede modificar porque está completada o vencida.', 'warning');
                  return;
                }

                setTareaSeleccionada(t);
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className={t.estado === 'completada' ? 'text-decoration-line-through' : ''}>
                    {t.titulo}
                  </strong>
                  <span className={`badge bg-${t.prioridad === 'alta' ? 'danger' : t.prioridad === 'media' ? 'warning text-dark' : 'info'}`}>
                    {t.prioridad}
                  </span>
                </div>
                {t.fechaLimite && (
                  <p className="text-muted small mt-1 mb-0">
                    📅 {t.fechaLimite} {t.horaLimite ? `🕒 ${t.horaLimite}` : ''}
                  </p>
                )}
                {t.estado !== 'completada' && (!t.fechaLimite || t.fechaLimite >= hoy) && (
                  <div className="text-end mt-2">
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmarCompletar(t);
                      }}
                    >
                      <i className="bi bi-check2-circle me-1"></i> Completar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {lista.length === 0 && <p className="text-center text-muted">Sin tareas</p>}
      </div>
    </div>
  );

  const tareasVencidas = tareas.filter(t => t.estado !== 'completada' && t.fechaLimite && t.fechaLimite < hoy);
  const tareasHoy = tareas.filter(t => t.estado === 'pendiente' && t.fechaLimite === hoy);
  const tareasPendientes = tareas.filter(t => t.estado === 'pendiente' && (!t.fechaLimite || t.fechaLimite > hoy));
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada');

  const validarTareaSeleccionada = () => {
    if (!tareaSeleccionada.titulo.trim()) return false;
    if (!tareaSeleccionada.fechaLimite) return false;
    if (tareaSeleccionada.fechaLimite < hoy) return false;
    return true;
  };

  return (
    <div className="container-fluid py-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {mensaje.texto && (
  <div className={`alert alert-${mensaje.tipo} text-center fade-message ${mensaje.visible ? 'show' : ''}`} role="alert">
    {mensaje.texto}
  </div>
)}


  <div className="mb-3 text-end">
    <label className="me-2 fw-bold">Filtrar por estado:</label>
    <select
      className="form-select d-inline-block w-auto"
      value={estadoFiltro}
      onChange={(e) => setEstadoFiltro(e.target.value)}
    >
      <option value="todos">Todos</option>
      <option value="pendiente">Pendientes</option>
      <option value="completada">Completadas</option>
    </select>
  </div>

  <div className="row gx-4 gy-4">
    {renderColumna('Vencidas', tareasVencidas, 'danger', '#f8d7da')}
    {renderColumna('Pendientes', tareasPendientes, 'warning', '#fff3cd')}
    {renderColumna('Hoy', tareasHoy, 'info', '#d1ecf1')}
    {renderColumna('Completadas', tareasCompletadas, 'success', '#d4edda')}
  </div>


      <button className="boton-flotante" onClick={() => setModoCreacion(true)}>
        <i className="bi bi-plus-lg plus-icon"></i>
      </button>

      {/* Modal creación */}
      {modoCreacion && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">➕ Nueva tarea</h5>
                <button type="button" className="btn-close" onClick={() => setModoCreacion(false)}></button>
              </div>
              <div className="modal-body">
                {errorFormulario && <div className="alert alert-danger text-center">{errorFormulario}</div>}
                <label className="form-label">Título</label>
                <input
                  className="form-control mb-2"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                />
                <label className="form-label">Prioridad</label>
                <select
                  className="form-select mb-2"
                  value={formulario.prioridad}
                  onChange={(e) => setFormulario({ ...formulario, prioridad: e.target.value })}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                <label className="form-label">Fecha límite</label>
                <input
                  type="date"
                  className="form-control mb-2"
                  value={formulario.fechaLimite}
                  min={hoy}
                  onChange={(e) => setFormulario({ ...formulario, fechaLimite: e.target.value })}
                />
                <label className="form-label">Hora (opcional)</label>
                <input
                  type="time"
                  className="form-control"
                  value={formulario.horaLimite}
                  onChange={(e) => setFormulario({ ...formulario, horaLimite: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={crearTareaDesdeModal}>Crear</button>
                <button className="btn btn-secondary" onClick={() => setModoCreacion(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {tareaSeleccionada && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📝 Editar tarea</h5>
                <button type="button" className="btn-close" onClick={() => setTareaSeleccionada(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Estado:</strong> {tareaSeleccionada.estado}</p>
                <label className="form-label">Prioridad</label>
                <select
                  className="form-select mb-2"
                  value={tareaSeleccionada.prioridad}
                  onChange={(e) => setTareaSeleccionada({ ...tareaSeleccionada, prioridad: e.target.value })}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                <label className="form-label">Título</label>
                <input
                  className="form-control mb-2"
                  value={tareaSeleccionada.titulo}
                  onChange={(e) => setTareaSeleccionada({ ...tareaSeleccionada, titulo: e.target.value })}
                />
                <label className="form-label">Fecha límite</label>
                <input
                  type="date"
                  className="form-control mb-2"
                  value={tareaSeleccionada.fechaLimite || ''}
                  min={hoy}
                  onChange={(e) => setTareaSeleccionada({ ...tareaSeleccionada, fechaLimite: e.target.value })}
                />
                <label className="form-label">Hora límite (opcional)</label>
                <input
                  type="time"
                  className="form-control"
                  value={tareaSeleccionada.horaLimite || ''}
                  onChange={(e) => setTareaSeleccionada({ ...tareaSeleccionada, horaLimite: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    actualizarTarea(tareaSeleccionada);
                    setTareaSeleccionada(null);
                  }}
                  disabled={!validarTareaSeleccionada()}
                >
                  💾 Guardar
                </button>
                <button className="btn btn-warning" onClick={() => {
                  const nuevoEstado = tareaSeleccionada.estado === 'pendiente' ? 'completada' : 'pendiente';
                  setTareaSeleccionada({ ...tareaSeleccionada, estado: nuevoEstado });
                }}>
                  🔁 Cambiar estado
                </button>
                <button className="btn btn-danger" onClick={async () => {
                  await fetch(`http://localhost:8080/api/tareas/${tareaSeleccionada.id}`, { method: 'DELETE' });
                  setTareas(tareas.filter(t => t.id !== tareaSeleccionada.id));
                  mostrarMensaje('Tarea eliminada.');
                  setTareaSeleccionada(null);
                }}>
                  🗑️ Eliminar
                </button>
                <button className="btn btn-secondary" onClick={() => setTareaSeleccionada(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar */}
      {confirmarCompletar && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✅ Completar tarea</h5>
              </div>
              <div className="modal-body">
                ¿Deseas marcar la tarea <strong>{confirmarCompletar.titulo}</strong> como completada?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmarCompletar(null)}>Cancelar</button>
                <button className="btn btn-success" onClick={completarTarea}>Completar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TareaList;
