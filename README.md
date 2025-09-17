TaskManager Frontend

Frontend del proyecto Task Manager, desarrollado con React.
Se conecta al backend taskmanager-backend
 (Spring Boot + MongoDB) para gestionar tareas.

Tabla de contenidos

Descripción

Tecnologías

Características

Estructura del proyecto

Instalación y uso

Scripts disponibles

Conexión con el backend

Cómo contribuir

Licencia

Descripción

Este proyecto constituye la parte de frontend de Task Manager.
Ofrece una interfaz gráfica en la que los usuarios pueden:

Crear, listar, editar y eliminar tareas.

Organizar las tareas por estado, prioridad y fecha.

Visualizarlas en lista tipo Kanban y en calendario.

Editarlas mediante un modal intuitivo.

Tecnologías

React (Create React App)

React Router DOM (navegación entre vistas)

Bootstrap (estilos modernos y responsivos)

Axios (comunicación con la API REST del backend)

react-big-calendar (vista de calendario para tareas)

Características

Vista de lista de tareas (Kanban) organizada por columnas:

Vencidas

Pendientes

Del día

Completadas

Vista de calendario de tareas con eventos interactivos.

Modal para crear y editar tareas.

Validaciones en frontend y backend (título obligatorio, fecha no anterior a hoy, etc.).

Botón flotante para añadir nuevas tareas.

Gestión de prioridades (alta, media, baja).

Estructura del proyecto
taskmanager-frontend/
├── public/                # Archivos estáticos (index.html, favicon, etc.)
├── src/
│   ├── components/        # Componentes principales (TareaList, CalendarioTareas, etc.)
│   ├── App.js             # Punto de entrada principal de React
│   ├── index.js           # Renderizado en DOM
│   └── services/          # Servicios para llamadas API con Axios
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo

Instalación y uso

Clona el repositorio:

git clone https://github.com/JaviVL89/taskmanager-frontend.git
cd taskmanager-frontend


Instala dependencias:

npm install


Inicia el servidor de desarrollo:

npm start


Abre la app en tu navegador:
http://localhost:3000

Scripts disponibles

En este proyecto puedes ejecutar:

npm start → ejecuta la app en modo desarrollo.

npm run build → construye la app lista para producción en la carpeta build/.

npm test → lanza el runner de pruebas.

npm run eject → expone la configuración de CRA (irreversible).

🔗 Conexión con el backend

Este frontend consume la API REST del backend:
taskmanager-backend

Por defecto, se espera que el backend corra en:
http://localhost:8080/api/tareas

Si usas otra URL/puerto, ajusta la configuración en los servicios (src/services/).

Cómo contribuir

Haz un fork del repositorio

Crea una rama (feature/nueva-funcionalidad)

Haz commit de tus cambios

Haz push a la rama

Abre un Pull Request

Licencia

Este proyecto está bajo la licencia MIT.
Consulta el archivo LICENSE para más detalles.
