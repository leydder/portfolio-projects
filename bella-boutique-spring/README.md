# Bella Boutique — Backend

API REST para gestión de inventario y ventas de una tienda de ropa, desarrollada con Spring Boot 3 y SQLite.

---

## Tecnologías

- Java 21
- Spring Boot 3.4.4
- Spring Security + JWT (jjwt 0.12.6)
- Spring Data JPA + Hibernate
- SQLite (base de datos embebida)
- Lombok
- Bean Validation
- SpringDoc OpenAPI (Swagger UI)
- Maven

---

## Requisitos

- Java 21+
- Maven (o usar el wrapper incluido `./mvnw`)

---

## Configuración

El archivo de configuración está en `src/main/resources/application.properties`.

| Propiedad | Valor por defecto | Descripción |
|---|---|---|
| `spring.datasource.url` | `jdbc:sqlite:bella_boutique.db` | Ruta de la base de datos |
| `jwt.secret` | (cadena larga) | Clave secreta para firmar tokens JWT |
| `jwt.expiration` | `86400000` | Expiración del token en ms (24h) |
| `app.upload.dir` | `uploads` | Carpeta donde se guardan las imágenes subidas |

> **Nota:** Si cambias el esquema de la base de datos (nuevas entidades o columnas), elimina el archivo `bella_boutique.db` antes de reiniciar para que Hibernate lo recree.

---

## Ejecutar el proyecto

```bash
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8080`.

---

## Ejecutar los tests

```bash
./mvnw test
```

19 tests en total (unitarios de servicios + controller tests con MockMvc).

---

## Autenticación

Todos los endpoints requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

Para obtener el token:

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Usuario por defecto:** `admin` / `admin123` (se crea automáticamente al iniciar).

---

## Roles

| Rol | Permisos |
|---|---|
| `ADMIN` | Acceso total (productos, ventas, usuarios) |
| `USER` | Registrar ventas y productos, no puede eliminar ni gestionar usuarios |

---

## Endpoints principales

### Autenticación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login, retorna JWT |

### Productos
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Listar todos |
| GET | `/api/products?search=...` | Buscar por nombre o referencia |
| GET | `/api/products/{id}` | Obtener por ID |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto (ADMIN) |

### Ventas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sales` | Listar todas |
| GET | `/api/sales/{id}` | Obtener por ID |
| POST | `/api/sales` | Registrar venta |
| PUT | `/api/sales/{saleId}/payments` | Marcar cuota a crédito como pagada |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Listar usuarios (ADMIN) |
| POST | `/api/users?role=USER` | Crear usuario (ADMIN) |
| DELETE | `/api/users/{id}` | Eliminar usuario (ADMIN) |
| PUT | `/api/users/{id}/password` | Cambiar contraseña |

### Archivos
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/files/upload` | Subir imagen (multipart/form-data) |

---

## Documentación interactiva

Con el servidor corriendo, accede a Swagger UI:

```
http://localhost:8080/swagger-ui/index.html
```

---

## Estructura del proyecto

```
src/main/java/bella_boutique/bella/
├── controller/       # Controladores REST
├── dto/              # Objetos de transferencia de datos
├── exception/        # Manejo global de errores
├── model/            # Entidades JPA
├── repository/       # Interfaces Spring Data
├── security/         # JWT, filtros y configuración de seguridad
└── service/          # Lógica de negocio
```

---

## Ejemplo: crear venta a crédito

```json
POST /api/sales
{
  "paymentType": "CREDITO",
  "buyerName": "María López",
  "initialPayment": 50000,
  "creditPayments": [
    { "amount": 30000, "dueDate": "2026-04-15", "notes": "Primera cuota" },
    { "amount": 30000, "dueDate": "2026-05-15", "notes": "Segunda cuota" }
  ],
  "items": [
    { "productId": 1, "productSizeId": 3, "quantity": 1 }
  ]
}
```