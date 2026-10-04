Bella Glow Cosmetics

Aplicación web desarrollada con React y Vite para una tienda virtual de productos de belleza y cosméticos.

El proyecto fue desarrollado como parte del Entregable #3 de Programación III, incorporando una arquitectura SPA, navegación mediante React Router y pruebas automatizadas con Vitest y React Testing Library.

Tecnologías utilizadas
React
Vite
React Router DOM
Vitest
React Testing Library
JavaScript
CSS

Instalación
Para instalar las dependencias del proyecto, ejecutar:
npm install

Ejecución del proyecto
Para iniciar el servidor de desarrollo:
npm run dev
Luego abrir en el navegador la dirección proporcionada por Vite.

Pruebas automatizadas
El proyecto utiliza Vitest y React Testing Library para realizar pruebas automatizadas.
Para ejecutar las pruebas:
npm test

Actualmente se incluyen tres pruebas automatizadas:
Productos: comprueba que el catálogo de productos se muestra correctamente.
Carrito: comprueba que un producto puede agregarse al carrito.
Favoritos: comprueba que un producto puede agregarse a favoritos.

Las tres pruebas fueron ejecutadas correctamente:
Test Files  3 passed (3)
Tests       3 passed (3)

Rutas principales
La aplicación utiliza React Router para manejar la navegación como una SPA.

Ruta
/ -> Página principal de Bella Glow
/productos	-> Catálogo de productos
/productos/:id -> Detalle de un producto específico
/favoritos -> Productos agregados a favoritos
/* -> Página para rutas no encontradas

La ruta /productos/:id utiliza un parámetro dinámico para identificar el producto seleccionado.

Navegación
La navegación entre las diferentes secciones se realiza mediante React Router.

También se utiliza navegación programática para acceder al detalle de un producto cuando el usuario selecciona la opción "Ver producto".

Funcionalidades principales
Catálogo de productos.
Búsqueda de productos.
Filtrado por categorías.
Visualización del detalle de cada producto.
Sistema de favoritos.
Carrito de compras.
Aumento y disminución de cantidades.
Eliminación de productos del carrito.
Cálculo del total del carrito.
Modo oscuro.
Navegación entre páginas mediante React Router.
Manejo de rutas no encontradas.
Pruebas automatizadas.

Estructura general
Bella-Glow/
├── public/
├── src/
│ ├── components/
│ ├── context/
│ ├── pages/
│ ├── tests/
│ ├── App.jsx
│ └── main.jsx
├── package.json
├── vite.config.js
└── README.md

Entregable #3
En esta etapa se incorporaron:
Arquitectura SPA.
React Router.
Rutas principales.
Ruta dinámica para productos.
Ruta para páginas no encontradas.
Navegación mediante enlaces.
Navegación programática.
Pruebas automatizadas con Vitest y React Testing Library.