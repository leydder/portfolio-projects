# ZonaFit - Sistema de Gestión de Clientes

## Descripción
ZonaFit es una aplicación de consola en Java para gestionar clientes de un gimnasio. Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre la información de los clientes.

## Características
- ✅ Gestión completa de clientes (CRUD)
- ✅ Interfaz de consola intuitiva con emojis
- ✅ Validaciones de entrada de usuario
- ✅ Conexión segura a base de datos MySQL
- ✅ Configuración externa de base de datos
- ✅ Manejo robusto de errores

## Requisitos Previos
- Java 21 o superior
- Maven 3.6+
- MySQL 8.0+
- Base de datos `zona_fit_db` creada

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd ZonaFit
```

### 2. Configurar la base de datos
Crear la base de datos y tabla:
```sql
CREATE DATABASE zona_fit_db;
USE zona_fit_db;

CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    membresia INT NOT NULL UNIQUE
);
```

### 3. Configurar credenciales
Crear el archivo `src/main/resources/database.properties`:
```properties
db.url=jdbc:mysql://localhost:3306/zona_fit_db
db.username=tu_usuario
db.password=tu_password
db.driver=com.mysql.cj.jdbc.Driver
```

### 4. Compilar y ejecutar

#### Opción 1: Usando los scripts (Recomendado)
```bash
# Compilar el proyecto
./build.sh

# Ejecutar la aplicación
./run.sh
```

#### Opción 2: Usando Maven directamente
```bash
# Compilar y empaquetar
mvn clean package

# Ejecutar el JAR
java -jar target/ZonaFit-1.0-SNAPSHOT-jar-with-dependencies.jar
```

## Estructura del Proyecto
```
ZonaFit/
├── src/main/java/zona_fit/
│   ├── conexion/
│   │   └── Conexion.java          # Gestión de conexión a BD
│   ├── datos/
│   │   ├── IClienteDAO.java       # Interfaz del DAO
│   │   └── ClienteDAO.java        # Implementación del DAO
│   ├── dominio/
│   │   └── Cliente.java           # Modelo de datos
│   └── ZonaFitApp.java            # Aplicación principal
├── src/main/resources/
│   └── database.properties        # Configuración de BD
├── pom.xml                        # Dependencias Maven
├── build.sh                       # Script de compilación
├── run.sh                         # Script de ejecución
└── README.md                      # Este archivo
```

## Funcionalidades

### Menú Principal
1. 📋 Listar clientes
2. ➕ Agregar cliente
3. ✏️ Modificar cliente
4. 🗑️ Eliminar cliente
5. 🚪 Salir

### Validaciones Implementadas
- Nombres y apellidos no pueden estar vacíos
- Longitud máxima de 50 caracteres para nombres
- Membresía debe ser mayor a 0 y menor a $999,999
- Validación de entrada numérica para IDs y membresías

## Scripts de Utilidad

### build.sh
Script para compilar y empaquetar el proyecto:
```bash
./build.sh
```

### run.sh
Script para ejecutar la aplicación:
```bash
./run.sh
```

## Tecnologías Utilizadas
- **Java 21**: Lenguaje de programación principal
- **Maven**: Gestión de dependencias y build
- **MySQL**: Base de datos relacional
- **JDBC**: Conexión a base de datos
- **Patrón DAO**: Separación de lógica de datos

## Seguridad
- ✅ Credenciales de BD en archivo de configuración externo
- ✅ Archivo de configuración excluido del control de versiones
- ✅ Uso de PreparedStatement para prevenir SQL injection
- ✅ Validación de entrada de usuario

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte
Para soporte técnico o preguntas, por favor abrir un issue en el repositorio. 