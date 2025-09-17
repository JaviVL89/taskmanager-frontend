// src/pages/HomePage.js
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mt-4">
      <h2>Bienvenido</h2>
      {isAuthenticated ? (
        <p>Estás logueado y puedes gestionar tus tareas.</p>
      ) : (
        <p>Por favor, inicia sesión para continuar.</p>
      )}
    </div>
  );
};

export default HomePage;
