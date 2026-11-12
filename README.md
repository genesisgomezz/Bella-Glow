Bella Glow Cosmetics
Aplicación web para una tienda virtual de productos de belleza y cosméticos. El proyecto integra una tienda para clientes y un panel administrativo dentro de una aplicación React, conectados mediante una API REST desarrollada con Node.js y Express a una base de datos MySQL.

El sistema permite consultar el catálogo, buscar y filtrar productos, gestionar favoritos y carrito, crear pedidos y administrar productos, clientes, personal y pedidos según el rol del usuario.
Aplicación publicada
- Frontend (tienda y panel administrativo): https://bella-glow-one.vercel.app/
- Backend (API REST): https://bella-glow-backend.onrender.com/
- Comprobación del Backend y MySQL: https://bella-glow-backend.onrender.com/api/salud
- Base de datos: MySQL alojado en Clever Cloud. Las credenciales se mantienen en la configuración privada del Backend.
Arquitectura
El sistema está compuesto por cuatro servicios:
1. Frontend: aplicación SPA desarrollada con React y Vite. Incluye tanto la tienda que utiliza el cliente como las vistas administrativas protegidas por rol. Se publica en Vercel.
2. Backend: API REST desarrollada con Node.js, Express y TypeScript. Se publica en Render, atiende las solicitudes del Frontend, valida la autenticación y los permisos, ejecuta las operaciones y se comunica con los servicios externos.
3. Base de datos: MySQL, alojado en Clever Cloud. Almacena la información del catálogo, categorías, usuarios, pedidos y detalles de los pedidos.
4. Almacenamiento de imágenes: Cloudinary. Guarda las imágenes de los productos y devuelve una URL HTTPS que el Backend registra en el campo imagen de MySQL.
El Frontend utiliza la URL pública de Render para comunicarse con la API. Cuando un administrador selecciona una imagen, el Frontend la envía al Backend; el Backend la carga en Cloudinary y guarda en MySQL la URL segura devuelta por ese servicio.
Tecnologías utilizadas
Frontend
- React
- Vite
- JavaScript
- React Router DOM
- Context API para compartir estados de autenticación, carrito y favoritos
- CSS
- Vitest y React Testing Library como herramientas de pruebas configuradas en el proyecto
Backend y almacenamiento
- Node.js
- Express
- TypeScript
- MySQL
- mysql2 para la conexión con MySQL
- JSON Web Token (JWT) para autenticación
- bcryptjs para el manejo de contraseñas
- multer para recibir imágenes de productos en memoria
- node:crypto para firmar las solicitudes de carga a Cloudinary
- fetch, FormData y Blob (funciones nativas de Node.js) para enviar las imágenes a Cloudinary
- cors y dotenv para configuración del servidor
- Cloudinary para almacenamiento externo de imágenes de productos
Despliegue
- Vercel: Frontend
- Render: Backend
- Clever Cloud: base de datos MySQL
- Cloudinary: almacenamiento de imágenes de productos
Funcionalidades principales
Tienda (FrontOffice)
- Página de inicio y catálogo de productos.
- Consulta de productos y categorías desde el Backend.
- Búsqueda y filtrado de productos.
- Vista de detalle de cada producto.
- Registro e inicio de sesión de clientes.
- Lista de favoritos.
- Carrito de compras con aumento y disminución de cantidades, eliminación de artículos y cálculo del total.
- Registro de pedidos.
- Consulta del historial y detalle de los pedidos del cliente.
- Modo claro y modo oscuro.
- Sección de recomendaciones que consume productos de belleza desde DummyJSON.
Administración (BackOffice)
El panel administrativo forma parte de la misma aplicación React y sus rutas están protegidas según el rol del usuario.
- Panel principal de administración.
- Registro, consulta, edición y eliminación de productos.
- Carga de imágenes para productos.
- Consulta de categorías.
- Administración de clientes.
- Administración del personal y estados de las cuentas.
- Consulta de pedidos y actualización de su estado.
- Control de acceso según los roles autorizados.
Roles y control de acceso
El Backend utiliza JWT para identificar al usuario y middleware para verificar los permisos de cada operación. En las rutas se contemplan los siguientes roles:
- CLIENTE: puede utilizar las funciones de cliente, registrar pedidos y consultar sus propios pedidos.
- EMPLEADO: puede acceder a las funciones administrativas autorizadas, como la gestión de productos, clientes y pedidos.
- ADMIN: puede acceder a las funciones administrativas y a la administración del personal y usuarios.
La autorización se valida en el Backend; ocultar una opción en la interfaz no sustituye la comprobación de permisos del servidor.
Rutas principales del Frontend
Ruta	Descripción	Acceso
/	Página principal	Público
/productos	Catálogo	Público
/productos/:id	Detalle de un producto	Público
/favoritos	Productos favoritos	Público
/iniciar-sesion	Inicio de sesión	Público
/registro	Registro de clientes	Público
/mis-pedidos	Historial de pedidos del cliente	CLIENTE
/administracion	Panel administrativo	ADMIN, EMPLEADO
/administrar-productos	Gestión de productos	ADMIN, EMPLEADO
/administrar-pedidos	Gestión de pedidos	ADMIN, EMPLEADO
/administrar-clientes	Gestión de clientes	ADMIN, EMPLEADO
/administrar-usuarios	Gestión del personal y usuarios	ADMIN
*	Página para rutas no encontradas	Público


React Router gestiona la navegación SPA y la ruta /productos/:id utiliza un parámetro dinámico para identificar el producto seleccionado. El archivo vercel.json contiene una regla de reescritura para que las rutas de React puedan abrirse directamente y actualizarse en Vercel.
API REST
La API se encuentra publicada en:

https://bella-glow-backend.onrender.com

Los grupos principales de rutas son:
Ruta base	Operaciones principales
/api/auth	Registro, inicio de sesión, creación y administración de clientes y personal
/api/productos	Consulta, registro, actualización, eliminación y carga de imágenes de productos
/api/categorias	Consulta de categorías
/api/pedidos	Creación de pedidos, consulta administrativa, cambio de estado y consulta de pedidos del cliente


Métodos HTTP utilizados
- GET: consultar información.
- POST: registrar información o enviar datos.
- PUT: actualizar información.
- PATCH: actualizar parcialmente un recurso, como el estado de un pedido o una cuenta.
- DELETE: eliminar un recurso.
Comprobación de conexión
Para verificar que el Backend puede conectarse a MySQL, abrir:

https://bella-glow-backend.onrender.com/api/salud

Cuando la conexión funciona, la API responde con un estado correcto y un mensaje que confirma la conexión con la base de datos.
Base de datos
La aplicación utiliza MySQL. Entre las entidades principales se encuentran:
- categorias: categorías disponibles para clasificar los productos.
- productos: nombre, categoría, descripción, precio, imagen, inventario y estado.
- usuarios: información de las cuentas, credenciales protegidas y rol.
- pedidos: información general de cada compra, cliente, fecha, total y estado.
- detalle_pedidos: productos, cantidades y precio unitario registrados en cada pedido.
El Backend realiza las consultas y modificaciones. El Frontend no se conecta directamente a MySQL.
Instalación y ejecución local
Requisitos
- Node.js 18 o superior y npm.
- MySQL accesible desde el Backend (local o remoto).
- Credenciales de conexión a la base de datos.
1. Instalar dependencias del Frontend
Desde la carpeta raíz Bella-Glow/:
npm install
2. Iniciar el Frontend
Desde la misma carpeta raíz:
npm run dev
Vite mostrará la dirección local. Normalmente será http://localhost:5173/.

Nota sobre la API: el código del Frontend de esta versión utiliza la URL pública de Render (https://bella-glow-backend.onrender.com). Por eso, al ejecutar Vite localmente, la interfaz sigue comunicándose con el Backend publicado, no automáticamente con un Backend local.
3. Configurar el Backend
Abrir otra terminal y entrar en la carpeta backend/:
cd backend
npm install
Crear un archivo llamado .env a partir de .env.example y completar las credenciales de MySQL, el secreto JWT y las credenciales de Cloudinary. Ejemplo de las variables necesarias:
PORT=3000
DB_HOST=host_de_mysql
DB_PORT=3306
DB_USER=usuario_mysql
DB_PASSWORD=contrasena_mysql
DB_NAME=nombre_base_datos
JWT_SECRET=secreto_largo_y_privado
CLOUDINARY_CLOUD_NAME=nombre_de_cloudinary
CLOUDINARY_API_KEY=api_key_de_cloudinary
CLOUDINARY_API_SECRET=api_secret_de_cloudinary
No utilizar literalmente los valores de ejemplo: se deben colocar los datos correspondientes al servidor MySQL y a la cuenta de Cloudinary que se utilizarán. En Render, configurar las mismas tres variables de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET) desde Environment del servicio Backend. No colocar credenciales en el código del Frontend ni subir el archivo .env a GitHub.

Iniciar el Backend en modo desarrollo:
npm run dev
Para compilar y ejecutar el Backend:
npm run build
npm start
Para que el Frontend local consuma el Backend local, también se debe cambiar la URL base de la API utilizada por el Frontend a http://localhost:3000 en los archivos donde actualmente se encuentra configurada la URL pública de Render.

Imágenes de productos
El BackOffice envía la imagen seleccionada al Backend mediante la ruta POST /api/productos/subir-imagen, utilizando el campo imagen del formulario. La ruta está protegida y solo permite la carga a usuarios con rol ADMIN o EMPLEADO.

El Backend recibe el archivo en memoria mediante Multer y lo envía a Cloudinary. Se aceptan imágenes JPG/JPEG, PNG, WEBP y GIF, con un tamaño máximo de 5 MB. Cloudinary almacena el archivo y devuelve una URL segura HTTPS. El Backend responde con esa dirección en la propiedad imagen; cuando se registra o actualiza el producto, el Frontend envía esa URL y el Backend la guarda en la columna productos.imagen de MySQL.

Las imágenes nuevas ya no dependen de la carpeta local backend/uploads/ ni del sistema de archivos de Render. El Frontend obtiene la URL desde la API y carga la imagen directamente desde Cloudinary.

Importante sobre productos existentes: las rutas antiguas como /uploads/nombre-imagen.jpg no se convierten automáticamente en direcciones de Cloudinary. Para que esos productos utilicen el nuevo almacenamiento, se debe volver a subir cada imagen desde el BackOffice y guardar la URL nueva al actualizar el producto. La información de los productos y el resto de los datos de MySQL se conservan.
Pruebas automatizadas
El proyecto incluye Vitest y React Testing Library como dependencias, y define el comando:
npm test
Para ejecutar Vitest una sola vez, sin dejar el modo de observación activo:
npm test -- --run
Nota: en el ZIP revisado para actualizar este README no se encontraron archivos de pruebas (*.test.* o *.spec.*). Por eso no se afirma aquí que actualmente haya tres pruebas ejecutables ni que el resultado sea 3 passed. Si los archivos de pruebas están en la copia local de trabajo, se pueden conservar y verificar con el comando anterior.
Seguridad y configuración
- Las solicitudes protegidas utilizan tokens JWT en el encabezado Authorization: Bearer <token>.
- Las contraseñas se manejan mediante bcryptjs en el Backend.
- Los permisos por rol se verifican en las rutas protegidas del servidor.
- Las credenciales de MySQL, el secreto JWT y las credenciales de Cloudinary se configuran mediante variables de entorno.
- CLOUDINARY_API_SECRET debe mantenerse privado y utilizarse únicamente en el Backend.
- El archivo .env no debe subirse a GitHub. El repositorio incluye reglas de .gitignore para excluir archivos de entorno y dependencias.
- No se deben compartir públicamente contraseñas, tokens ni credenciales de Clever Cloud, Render o Cloudinary.
Estructura general del proyecto
Bella-Glow/
├── backend/
│   ├── src/
│   │   ├── confit/
│   │   │   └── database.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── categorias.routes.ts
│   │   │   ├── pedidos.routes.ts
│   │   │   └── productos.routes.ts
│   │   └── server.ts
│   ├── uploads/                 # Imágenes anteriores; no se usa para nuevas cargas
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── public/
│   └── img/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   └── vitest.config.js
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
Entregables y evolución del proyecto
El proyecto evolucionó desde una tienda Frontend construida con React hasta una aplicación integrada con rutas SPA, panel administrativo, API REST y base de datos MySQL. Se incorporaron navegación con React Router, autenticación y autorización por roles, operaciones de gestión de productos y categorías, administración de clientes y personal, gestión de pedidos y despliegue en servicios de nube.