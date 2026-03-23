# Bella Boutique — Frontend

Interfaz web para gestión de inventario y ventas de una tienda de ropa, desarrollada con React + Vite.

---

## Tecnologías

- React 18
- Vite
- React Router DOM
- Axios
- Context API (autenticación)

---

## Requisitos

- Node.js 18+
- npm

---

## Instalación

```bash
npm install
```

---

## Ejecutar en desarrollo

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

> El backend debe estar corriendo en `http://localhost:8080`.

---

## Build para producción

```bash
npm run build
```

---

## Autenticación

Al ingresar se solicita usuario y contraseña. El token JWT se guarda en `localStorage` y se envía automáticamente en cada petición mediante un interceptor de Axios.

**Usuario por defecto:** `admin` / `admin123`

---

## Roles y accesos

| Pantalla | ADMIN | USER |
|---|---|---|
| Productos — ver | ✓ | ✓ |
| Productos — crear/editar | ✓ | ✓ |
| Productos — eliminar | ✓ | ✗ |
| Ventas — ver y registrar | ✓ | ✓ |
| Usuarios — gestionar | ✓ | ✗ |
| Cambiar contraseña | ✓ | ✓ (propia) |

---

## Páginas

### Productos (`/productos`)
- Vista **grid** con imagen, referencia, precio y stock
- Vista **tabla** con stock por talla para control de inventario
- Buscador en tiempo real por nombre o número de referencia
- Formulario para crear/editar con:
  - Imagen desde URL o subida de archivo
  - Manejo de tallas (S, M, L, XL, etc.) con stock individual por talla
  - Especificaciones (color, material)

### Ventas (`/ventas`)
- Listado de ventas con badge de tipo (Contado / Crédito)
- Estadísticas: total ventas, ingresos, ventas a crédito, saldo por cobrar
- Formulario de nueva venta:
  - Selector de tipo de pago (Contado / Crédito)
  - Para crédito: nombre del comprador, pago inicial y cuotas con fecha y monto
  - Selector de talla por producto (si el producto maneja tallas)
- Detalle de venta con opción de **marcar cuotas como pagadas**

### Usuarios (`/usuarios`) — solo ADMIN
- Listado de usuarios con rol
- Crear nuevo usuario con rol (USER / ADMIN)
- Cambiar contraseña de cualquier usuario
- Eliminar usuario

---

## Estructura del proyecto

```
src/
├── api/
│   └── axios.js          # Instancia Axios con interceptor JWT
├── context/
│   └── AuthContext.jsx   # Estado global de autenticación
├── components/
│   └── Navbar.jsx        # Barra de navegación
├── pages/
│   ├── LoginPage.jsx
│   ├── ProductosPage.jsx
│   ├── VentasPage.jsx
│   └── UsuariosPage.jsx
└── App.jsx               # Rutas y layout principal
```

---

## Variables de entorno

Por defecto la app apunta a `http://localhost:8080`. Si necesitas cambiar la URL del backend, edita `src/api/axios.js`:

```js
const api = axios.create({
  baseURL: 'http://localhost:8080',
});
```