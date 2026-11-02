
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function RutaProtegida({ rolesPermitidos }) {
  const { autenticado, usuario } = useAuth();

  if (!autenticado) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  if (!rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default RutaProtegida;
