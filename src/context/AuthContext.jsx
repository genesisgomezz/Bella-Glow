import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:3000/api/auth";

const CLAVE_TOKEN = "bellaGlowToken";
const CLAVE_USUARIO = "bellaGlowUsuario";

function tokenExpirado(token) {
  if (!token) return true;

  try {
    const partes = token.split(".");

    if (partes.length !== 3) return true;

    const payload = JSON.parse(
      atob(partes[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.exp) return true;

    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function limpiarSesionLocal() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);

      return guardado ? JSON.parse(guardado) : null;
    } catch {
      limpiarSesionLocal();
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem(CLAVE_TOKEN) || null
  );

  const [cargando, setCargando] = useState(false);

  const cerrarSesion = useCallback(() => {
    limpiarSesionLocal();
    setToken(null);
    setUsuario(null);
  }, []);

  // Limpia sesiones incompletas o tokens que ya expiraron.
  useEffect(() => {
    if (!token || !usuario || tokenExpirado(token)) {
      cerrarSesion();
    }
  }, [token, usuario, cerrarSesion]);

  // Permite realizar solicitudes autenticadas.
  // Si el Backend responde 401, se cierra la sesión local.
  const fetchAutenticado = useCallback(
    async (url, opciones = {}) => {
      if (!token || tokenExpirado(token)) {
        cerrarSesion();

        throw new Error(
          "Tu sesión ha expirado. Inicia sesión nuevamente."
        );
      }

      const headers = new Headers(opciones.headers || {});

      headers.set("Authorization", `Bearer ${token}`);

      const respuesta = await fetch(url, {
        ...opciones,
        headers,
      });

      if (respuesta.status === 401) {
        cerrarSesion();

        throw new Error(
          "Tu sesión ha expirado o tu cuenta ya no está activa. Inicia sesión nuevamente."
        );
      }

      return respuesta;
    },
    [token, cerrarSesion]
  );

  async function iniciarSesion(correo, contrasena) {
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo iniciar sesión."
        );
      }

      if (!datos.token || !datos.usuario) {
        throw new Error(
          "El servidor no devolvió los datos de la sesión."
        );
      }

      localStorage.setItem(CLAVE_TOKEN, datos.token);
      localStorage.setItem(
        CLAVE_USUARIO,
        JSON.stringify(datos.usuario)
      );

      setToken(datos.token);
      setUsuario(datos.usuario);

      return datos.usuario;
    } finally {
      setCargando(false);
    }
  }

  async function registrarse(nombre, correo, contrasena) {
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || "No se pudo crear la cuenta."
        );
      }

      return datos;
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        fetchAutenticado,
        autenticado: Boolean(
          token && usuario && !tokenExpirado(token)
        ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return contexto;
}