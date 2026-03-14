# Human Resources API - Spring Boot

REST API para gestión de recursos humanos construida con Spring Boot 4, MySQL y Spring Security + JWT.

## Tech Stack

- Java 21
- Spring Boot 4.0.3
- Spring Data JPA + Hibernate
- Spring Security + JWT (jjwt 0.12.6)
- MySQL 8
- Lombok
- JUnit 5 + Mockito

## Requisitos previos

- Java 21
- Maven
- MySQL 8 corriendo en `localhost:3306`

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```
DB_URL=jdbc:mysql://localhost:3306/human_resources_db?createDatabaseIfNotExist=true
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

## Ejecutar el proyecto

```bash
./mvnw spring-boot:run
```

El servidor inicia en `http://localhost:8080`.

## Ejecutar los tests

```bash
./mvnw test
```

19 tests — 0 fallos.

## Estructura del proyecto

```
src/main/java/leyder/hr/
├── model/
│   ├── Employee.java              # Entidad JPA empleado
│   └── User.java                  # Entidad JPA usuario
├── repository/
│   ├── EmployeeRepository.java    # Acceso a datos empleados
│   └── UserRepository.java        # Acceso a datos usuarios
├── service/
│   ├── IEmployeeService.java      # Interfaz del servicio
│   └── EmployeeService.java       # Lógica de negocio
├── controller/
│   ├── EmployeeController.java    # Endpoints REST empleados
│   └── AuthController.java        # Endpoint de login
├── security/
│   ├── JwtUtil.java               # Generación y validación de tokens
│   ├── JwtFilter.java             # Filtro JWT por request
│   ├── UserDetailsServiceImpl.java # Carga usuario desde BD
│   └── SecurityConfig.java        # Configuración de seguridad
└── exception/
    └── ResourceNotFoundException.java  # Manejo de errores 404
```

## Autenticación

La API usa JWT. Para acceder a los endpoints protegidos:

### 1. Insertar usuario en la BD

```sql
INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$HASH_GENERADO', 'ADMIN');
```

Para generar el hash usa el endpoint temporal o BCryptPasswordEncoder.

### 2. Hacer login

```
POST /auth/login
Content-Type: application/json
```
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**Respuesta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Usar el token en cada request

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Sin token → `403 Forbidden`.

---

## Endpoints

Base URL: `http://localhost:8080/rh-app`

> Todos los endpoints requieren header `Authorization: Bearer {token}`

### Listar todos los empleados
```
GET /employee
```
**Respuesta 200:**
```json
[
  {
    "idEmployee": 1,
    "name": "John Smith",
    "department": "Engineering",
    "salary": 3500.0
  }
]
```

---

### Buscar empleado por ID
```
GET /employee/{id}
```
**Respuesta 200:** empleado encontrado.
**Respuesta 404:** si el ID no existe.

---

### Crear empleado
```
POST /employee
Content-Type: application/json
```
```json
{
  "name": "Maria Garcia",
  "department": "Human Resources",
  "salary": 2800.0
}
```
**Respuesta 200:** retorna el empleado creado con su ID generado.

---

### Actualizar empleado
```
PUT /employee/{id}
Content-Type: application/json
```
```json
{
  "name": "Maria Garcia",
  "department": "Management",
  "salary": 4000.0
}
```
**Respuesta 200:** retorna el empleado actualizado.
**Respuesta 404:** si el ID no existe.

---

### Eliminar empleado
```
DELETE /employee/{id}
```
**Respuesta 200:**
```json
{
  "deleted": true
}
```
**Respuesta 404:** si el ID no existe.

## CORS

Configurado para permitir peticiones desde `http://localhost:3000` (frontend React).