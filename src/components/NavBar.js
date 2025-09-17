// src/components/Navbar.js
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from './context/AuthContext';
import AuthService from './services/AuthService';


const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <Link className="navbar-brand" to="/">TaskManager</Link>
      <div className="ms-auto">
        {isAuthenticated ? (
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : (
          <Link className="btn btn-outline-primary" to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
