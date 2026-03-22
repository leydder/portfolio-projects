# Inventory Spring

API REST para gestión de inventario de productos, construida con Spring Boot 4 y Java 21.

---

## Tecnologías

| Tecnología | Versión |
|------------|---------|
| Java | 21 |
| Spring Boot | 4.0.4 |
| Spring Data JPA | - |
| Hibernate | 7.x |
| MySQL | 8.x |
| Lombok | 1.18.36 |
| JUnit 5 | - |
| Mockito | - |

---

## Estructura del proyecto

```
src/main/java/leydder/com/inventory/
├── controller/
│   └── ProductController.java       # Endpoints REST
├── exception/
│   ├── GlobalExceptionHandler.java  # Manejo global de errores
│   └── ProductNotFoundException.java
├── model/
│   └── Product.java                 # Entidad JPA
├── repository/
│   └── ProductRepository.java       # Acceso a datos
├── service/
│   ├── IProductService.java         # Contrato del servicio
│   └── ProductoService.java         # Implementación
└── InventoryApplication.java
```

---

## Configuración

### 1. Requisitos previos

- Java 21
- MySQL 8
- Maven

### 2. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```properties
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

> El archivo `.env` está en `.gitignore` — nunca lo subas al repositorio.

### 3. Base de datos

La base de datos `inventory_db` se crea automáticamente al levantar la app en perfil `dev`.
En producción debes crearla manualmente:

```sql
CREATE DATABASE inventory_db;
```

### 4. Perfiles

| Perfil | ddl-auto | show-sql | Uso |
|--------|----------|----------|-----|
| default | `validate` | no | Producción |
| dev | `update` | sí | Desarrollo local |

**Activar perfil dev en IntelliJ:**
> Run/Debug Configurations → Active profiles: `dev`

**Activar perfil dev por terminal:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Ejecución

```bash
./mvnw spring-boot:run
```

La API queda disponible en: `http://localhost:8080`

---

## Endpoints

Base URL: `http://localhost:8080/inventory-app`

### Listar todos los productos

```http
GET /products
```

**Respuesta exitosa `200 OK`:**
```json
[
  {
    "productId": 1,
    "description": "Laptop Dell",
    "price": 1200.00,
    "stock": 10
  },
  {
    "productId": 2,
    "description": "Mouse Logitech",
    "price": 25.50,
    "stock": 50
  }
]
```

---

### Buscar producto por ID

```http
GET /products/{id}
```

**Respuesta exitosa `200 OK`:**
```json
{
  "productId": 1,
  "description": "Laptop Dell",
  "price": 1200.00,
  "stock": 10
}
```

**Producto no encontrado `404 Not Found`:**
```json
{
  "error": "Producto no encontrado con id: 99"
}
```

---

### Crear producto

```http
POST /products
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Teclado Mecánico",
  "price": 85.00,
  "stock": 20
}
```

**Respuesta exitosa `200 OK`:**
```json
{
  "productId": 3,
  "description": "Teclado Mecánico",
  "price": 85.00,
  "stock": 20
}
```

---

### Actualizar producto

```http
PUT /products/{id}
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Teclado Mecánico RGB",
  "price": 95.00,
  "stock": 15
}
```

**Respuesta exitosa `200 OK`:**
```json
{
  "productId": 3,
  "description": "Teclado Mecánico RGB",
  "price": 95.00,
  "stock": 15
}
```

> El `productId` del body es ignorado — siempre se usa el `{id}` de la URL.

---

### Eliminar producto

```http
DELETE /products/{id}
```

**Respuesta exitosa `200 OK`** — sin body.

**Producto no encontrado `404 Not Found`:**
```json
{
  "error": "Producto no encontrado con id: 99"
}
```

---

## Modelo de datos

### Product

| Campo | Tipo | Descripción |
|-------|------|-------------|
| productId | Integer | Identificador único (auto-generado) |
| description | String | Descripción del producto |
| price | Double | Precio unitario |
| stock | Integer | Cantidad en inventario |

---

## Tests

```bash
./mvnw test
```

**Cobertura:**

| Clase | Tests |
|-------|-------|
| ProductServiceTest | 11 |
| ProductControllerTest | 10 |
| InventoryApplicationTests | 1 |
| **Total** | **22** |

**Casos cubiertos:**
- Respuesta exitosa con datos completos
- Lista vacía
- Recurso no encontrado (404)
- ID nulo
- Validación de que el ID del path prevalece sobre el body (PUT)
- Verificación de que el servicio es llamado correctamente
- DELETE no ejecuta si el producto no existe

---

## Seguridad aplicada

- Credenciales de BD en variables de entorno (`.env`)
- `ddl-auto=validate` en producción — Hibernate no modifica el esquema
- `show-sql` desactivado en producción
- CORS configurable por perfil via `app.cors.allowed-origins`
- Inyección de dependencias por constructor (`@RequiredArgsConstructor`)
- Validación de existencia antes de eliminar