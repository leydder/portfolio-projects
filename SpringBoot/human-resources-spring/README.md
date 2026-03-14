# Human Resources API - Spring Boot

REST API para gestión de recursos humanos construida con Spring Boot 4 y MySQL.

## Tech Stack

- Java 21
- Spring Boot 4.0.3
- Spring Data JPA + Hibernate
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
│   └── Employee.java              # Entidad JPA
├── repository/
│   └── EmployeeRepository.java    # Acceso a datos
├── service/
│   ├── IEmployeeService.java      # Interfaz del servicio
│   └── EmployeeService.java       # Lógica de negocio
├── controller/
│   └── EmployeeController.java    # Endpoints REST
└── exception/
    └── ResourceNotFoundException.java  # Manejo de errores 404
```

## Endpoints

Base URL: `http://localhost:8080/rh-app`

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
**Respuesta 200:**
```json
{
  "idEmployee": 1,
  "name": "John Smith",
  "department": "Engineering",
  "salary": 3500.0
}
```
**Respuesta 404** — si el ID no existe.

---

### Crear empleado
```
POST /employee
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Maria Garcia",
  "department": "Human Resources",
  "salary": 2800.0
}
```
**Respuesta 200** — retorna el empleado creado con su ID generado.

---

### Actualizar empleado
```
PUT /employee/{id}
Content-Type: application/json
```
**Body:**
```json
{
  "name": "Maria Garcia",
  "department": "Management",
  "salary": 4000.0
}
```
**Respuesta 200** — retorna el empleado actualizado.
**Respuesta 404** — si el ID no existe.

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
**Respuesta 404** — si el ID no existe.

## CORS

Configurado para permitir peticiones desde `http://localhost:3000` (frontend React).