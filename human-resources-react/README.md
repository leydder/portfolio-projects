# Human Resources App - React

Frontend de la aplicación de gestión de recursos humanos construido con React y Bootstrap, con autenticación JWT.

## Tech Stack

- React 19
- Bootstrap 5
- Axios
- Jest + React Testing Library

## Requisitos previos

- Node.js v18+
- npm
- Backend `human-resources-spring` corriendo en `http://localhost:8080`

## Instalación

```bash
npm install
```

## Ejecutar el proyecto

```bash
npm start
```

La app abre en `http://localhost:3000`.

## Ejecutar los tests

```bash
npm test
```

19 tests — 0 fallos.

## Estructura del proyecto

```
src/
├── components/
│   ├── Login.js               # Formulario de login
│   ├── EmployeeList.js        # Tabla con todos los empleados
│   ├── EmployeeList.test.js
│   ├── EmployeeForm.js        # Formulario para crear empleado
│   ├── EmployeeForm.test.js
│   ├── EmployeeEdit.js        # Formulario para editar empleado
│   └── EmployeeEdit.test.js
├── services/
│   └── EmployeeService.js     # Llamadas HTTP al backend con token JWT
├── App.js                     # Componente raíz con manejo de autenticación
└── index.js                   # Punto de entrada
```

## Autenticación

La app usa JWT. Al entrar muestra el formulario de login.

1. Ingresa usuario y contraseña
2. El token JWT se guarda en `localStorage`
3. Cada petición al backend envía el token en el header `Authorization`
4. El botón **Logout** elimina el token y regresa al login

## Funcionalidades

| Acción | Descripción |
|--------|-------------|
| Login | Autenticación con usuario y contraseña |
| Logout | Cierra sesión y limpia el token |
| Listar | Muestra todos los empleados en una tabla |
| Crear | Formulario para agregar un nuevo empleado |
| Editar | Formulario precargado con los datos del empleado |
| Eliminar | Botón que elimina el empleado y recarga la tabla |

## Conexión con el backend

Todas las peticiones HTTP se hacen a través de `EmployeeService.js` enviando el token JWT:

```
POST   http://localhost:8080/auth/login           → obtener token
GET    http://localhost:8080/rh-app/employee      → listar (requiere token)
GET    http://localhost:8080/rh-app/employee/{id} → buscar (requiere token)
POST   http://localhost:8080/rh-app/employee      → crear  (requiere token)
PUT    http://localhost:8080/rh-app/employee/{id} → editar (requiere token)
DELETE http://localhost:8080/rh-app/employee/{id} → eliminar (requiere token)
```

## Levantar el proyecto completo

1. Iniciar el backend:
```bash
cd human-resources-spring
./mvnw spring-boot:run
```

2. Iniciar el frontend:
```bash
cd human-resources-react
npm start
```