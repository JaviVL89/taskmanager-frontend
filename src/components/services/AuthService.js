// src/services/AuthService.js
const API_URL = "/api/login";

const login = async (username, password) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    credentials: "include", // ⚠️ Importante para manejar la sesión
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciales incorrectas");
  }

  return true;
};

const logout = async () => {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  });
};

const AuthService = {
  login,
  logout,
};

export default AuthService;
