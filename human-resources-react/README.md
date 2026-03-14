# Human Resources App - React

Frontend de la aplicación de gestión de recursos humanos construido con React y Bootstrap.

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
│   ├── EmployeeList.js        # Tabla con todos los empleados
│   ├── EmployeeList.test.js
│   ├── EmployeeForm.js        # Formulario para crear empleado
│   ├── EmployeeForm.test.js
│   ├── EmployeeEdit.js        # Formulario para editar empleado
│   └── EmployeeEdit.test.js
├── services/
│   └── EmployeeService.js     # Llamadas HTTP al backend
├── App.js                     # Componente raíz
└── index.js                   # Punto de entrada
```

## Funcionalidades

| Acción | Descripción |
|--------|-------------|
| Listar | Muestra todos los empleados en una tabla |
| Crear | Formulario para agregar un nuevo empleado |
| Editar | Formulario precargado con los datos del empleado |
| Eliminar | Botón que elimina el empleado y recarga la tabla |

## Conexión con el backend

Todas las peticiones HTTP se hacen a través de `EmployeeService.js`:

```
GET    http://localhost:8080/rh-app/employee
GET    http://localhost:8080/rh-app/employee/{id}
POST   http://localhost:8080/rh-app/employee
PUT    http://localhost:8080/rh-app/employee/{id}
DELETE http://localhost:8080/rh-app/employee/{id}
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