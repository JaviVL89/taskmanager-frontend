import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import esES from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { es: esES };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function CalendarioTareas() {
  const [eventos, setEventos] = useState([]);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [formulario, setFormulario] = useState({ titulo: '', fechaLimite: '' });
  const [modoCreacion, setModoCreacion] = useState(false);
  const [vista, setVista] = useState(Views.MONTH);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [alerta, setAlerta] = useState(null);

  const mostrarAlerta = (mensaje) => {
    setAlerta(mensaje);
    setTimeout(() => setAlerta(null), 4000);
  };

  const cargarEventos = () => {
    fetch('http://localhost:8080/api/tareas')
      .then(res => res.json())
      .then(data => {
        const eventosFormateados = data
          .filter(t => t.fechaLimite)
          .map(t => {
            const fecha = t.fechaLimite;
            const hora = t.horaLimite;
            let start = new Date(fecha);
            let end = new Date(fecha);

            if (hora) {
              const [h, m] = hora.split(':');
              start.setHours(h, m, 0, 0);
              end = new Date(start);
              end.setHours(start.getHours() + 1); // duración de 1 hora
            }

            return {
              id: t.id,
              title: `${t.titulo} (${t.estado})`,
              start,
              end,
              allDay: !hora,
              tareaOriginal: t
            };
          });

        setEventos(eventosFormateados);
      })
      .catch(console.error);
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const estilosEvento = (evento) => {
    const prioridad = evento.tareaOriginal?.prioridad;
    let backgroundColor = '#adb5bd';
    let color = 'white';

    if (prioridad === 'alta') {
      backgroundColor = '#dc3545';
    } else if (prioridad === 'media') {
      backgroundColor = '#ffc107';
      color = '#212529';
    } else if (prioridad === 'baja') {
      backgroundColor = '#0dcaf0';
    }

    return {
      style: {
        backgroundColor,
        color,
        borderRadius: '6px',
        fontWeight: 500,
        paddingLeft: '8px',
        fontFamily: '"Inter", sans-serif'
      }
    };
  };

  const alternarEstado = async (tarea) => {
    const nuevoEstado = tarea.estado === 'completada' ? 'pendiente' : 'completada';
    const actualizado = { ...tarea, estado: nuevoEstado };

    const res = await fetch(`http://localhost:8080/api/tareas/${tarea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actualizado)
    });

    if (res.ok) {
      mostrarAlerta(`✅ Estado actualizado: ${nuevoEstado}`);
      setTareaSeleccionada(null);
      cargarEventos();
    } else {
      mostrarAlerta('❌ Error al actualizar la tarea');
    }
  };

  const guardarCambios = async () => {
    const tarea = {
      ...tareaSeleccionada,
      titulo: formulario.titulo,
      fechaLimite: formulario.fechaLimite
    };

    const res = await fetch(`http://localhost:8080/api/tareas/${tarea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarea)
    });

    if (res.ok) {
      mostrarAlerta('✅ Tarea actualizada');
      setTareaSeleccionada(null);
      cargarEventos();
    } else {
      mostrarAlerta('❌ Error al actualizar la tarea');
    }
  };

  const crearTarea = async () => {
    const nuevaTarea = {
      titulo: formulario.titulo,
      estado: 'pendiente',
      fechaLimite: formulario.fechaLimite,
      prioridad: 'media'
    };

    const res = await fetch(`http://localhost:8080/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaTarea)
    });

    if (res.ok) {
      mostrarAlerta('✅ Tarea creada');
      setModoCreacion(false);
      setFormulario({ titulo: '', fechaLimite: '' });
      cargarEventos();
    } else {
      mostrarAlerta('❌ Error al crear la tarea');
    }
  };

  const handleEventoClick = (evento) => {
    const tarea = evento.tareaOriginal;

    const esCompletada = tarea.estado === 'completada';
    const hoy = new Date().setHours(0, 0, 0, 0);
    const fechaLimite = new Date(tarea.fechaLimite).setHours(0, 0, 0, 0);
    const esVencida = fechaLimite < hoy;

    if (esCompletada || esVencida) {
      mostrarAlerta('⚠️ Esta tarea no se puede modificar porque está completada o vencida.');
      return;
    }

    setTareaSeleccionada(tarea);
    setFormulario({
      titulo: tarea.titulo,
      fechaLimite: tarea.fechaLimite
    });
  };

  const handleSlotSelect = (slotInfo) => {
    const fecha = slotInfo.start.toISOString().split('T')[0];
    setModoCreacion(true);
    setFormulario({ titulo: '', fechaLimite: fecha });
  };

  return (
    <div className="container py-4" style={{ fontFamily: '"Inter", sans-serif' }}>      
      {alerta && (
  <div className="alerta-custom position-fixed top-0 start-50 translate-middle-x mt-3 z-3">
    <div className="alert alert-light border shadow d-flex align-items-center gap-3 px-4 py-3 fade show rounded-3" role="alert">
      <div className="flex-grow-1">{alerta}</div>
    </div>
  </div>
)}


      <div className="border rounded bg-white p-2 shadow-sm">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          culture="es"
          selectable
          onSelectEvent={handleEventoClick}
          onSelectSlot={handleSlotSelect}
          view={vista}
          onView={setVista}
          date={fechaActual}
          onNavigate={setFechaActual}
          eventPropGetter={estilosEvento}
          messages={{
            today: 'Hoy',
            previous: 'Atrás',
            next: 'Siguiente',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Tarea',
            allDay: 'Todo el día',
            noEventsInRange: 'No hay tareas en este rango'
          }}
        />
      </div>

      {(tareaSeleccionada || modoCreacion) && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-3">
              <div className="modal-header bg-light">
                <h5 className="modal-title">
                  {modoCreacion ? '➕ Crear tarea' : '✏️ Editar tarea'}
                </h5>
                <button type="button" className="btn-close" onClick={() => {
                  setTareaSeleccionada(null);
                  setModoCreacion(false);
                }}></button>
              </div>
              <div className="modal-body">
                {!modoCreacion && (
                  <>
                    <p><strong>Estado:</strong> {tareaSeleccionada.estado}</p>
                    <p><strong>Prioridad:</strong> {tareaSeleccionada.prioridad}</p>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formulario.titulo}
                    onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha límite</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formulario.fechaLimite}
                    onChange={(e) => setFormulario({ ...formulario, fechaLimite: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                {modoCreacion ? (
                  <>
                    <button className="btn btn-primary" onClick={crearTarea}>💾 Crear</button>
                    <button className="btn btn-secondary" onClick={() => setModoCreacion(false)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-success" onClick={guardarCambios}>💾 Guardar</button>
                    <button className="btn btn-warning" onClick={() => alternarEstado(tareaSeleccionada)}>
                      🔁 Cambiar estado
                    </button>
                    <button className="btn btn-danger" onClick={async () => {
                      if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                        const res = await fetch(`http://localhost:8080/api/tareas/${tareaSeleccionada.id}`, {
                          method: 'DELETE'
                        });

                        if (res.ok) {
                          mostrarAlerta('🗑 Tarea eliminada');
                          setTareaSeleccionada(null);
                          cargarEventos();
                        } else {
                          mostrarAlerta('❌ Error al eliminar la tarea');
                        }
                      }
                    }}>🗑 Eliminar</button>
                    <button className="btn btn-secondary" onClick={() => setTareaSeleccionada(null)}>Cerrar</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarioTareas;
