# Gestor de Tareas - Aplicación de Escritorio

Una aplicación de escritorio completa desarrollada en Java para gestionar tareas con sistema de prioridades opcional.

## 🚀 Características

### Funcionalidades Principales
- **Gestión completa de tareas** (Crear, Leer, Actualizar, Eliminar)
- **Sistema de prioridades** (Alta, Media, Baja) con colores distintivos
- **Estados de tareas** (Pendiente, En Progreso, Completada)
- **Fechas de vencimiento opcionales** con validación
- **Búsqueda y filtrado** de tareas por título, descripción y estado
- **Estadísticas en tiempo real** con tarjetas visuales
- **Persistencia de datos** automática en formato JSON
- **Interfaz moderna** con FlatLaf para una experiencia visual mejorada

### Interfaz de Usuario
- **Panel de estadísticas** con tarjetas coloridas
- **Tabla de tareas** con renderizado personalizado
- **Diálogos modales** para crear/editar tareas
- **Barra de menú** con atajos de teclado
- **Búsqueda en tiempo real** y filtros avanzados

## 📋 Requisitos del Sistema

- **Java 11** o superior
- **Maven** para gestión de dependencias
- **Sistema operativo**: Windows, macOS, Linux

## 🛠️ Instalación y Ejecución

### 1. Clonar o descargar el proyecto
```bash
git clone <url-del-repositorio>
cd task-manager
```

### 2. Compilar el proyecto
```bash
mvn clean compile
```

### 3. Ejecutar la aplicación
```bash
mvn exec:java -Dexec.mainClass="com.taskmanager.TaskManagerApp"
```

### 4. Crear JAR ejecutable (opcional)
```bash
mvn clean package
java -jar target/task-manager-1.0.0.jar
```

## 🎯 Cómo Usar la Aplicación

### Crear una Nueva Tarea
1. Hacer clic en el botón **"Nueva Tarea"** o usar `Ctrl+N`
2. Completar el formulario:
   - **Título** (obligatorio)
   - **Descripción** (opcional)
   - **Prioridad** (Alta, Media, Baja)
   - **Estado** (Pendiente, En Progreso, Completada)
   - **Fecha de vencimiento** (opcional, formato: dd/MM/yyyy HH:mm)
3. Hacer clic en **"Guardar"**

### Editar una Tarea
1. Seleccionar la tarea en la tabla
2. Hacer clic en el botón **"Editar"**
3. Modificar los campos necesarios
4. Hacer clic en **"Guardar"**

### Eliminar una Tarea
1. Seleccionar la tarea en la tabla
2. Hacer clic en el botón **"Eliminar"**
3. Confirmar la eliminación

### Buscar Tareas
- Usar el campo de **búsqueda** para encontrar tareas por título o descripción
- Usar el **filtro desplegable** para filtrar por estado o condición

### Ver Estadísticas
- Las estadísticas se muestran automáticamente en la parte superior
- Usar el menú **Ver > Estadísticas** para ver detalles completos

## 🎨 Características Visuales

### Colores de Prioridad
- **Alta**: Rojo (#DC3545)
- **Media**: Amarillo (#FFC107)
- **Baja**: Verde (#28A745)

### Estados de Tareas
- **Pendiente**: Naranja (#E67E22)
- **En Progreso**: Amarillo (#F1C40F)
- **Completada**: Verde (#2ECC71)

### Interfaz Moderna
- **FlatLaf** para un diseño plano y moderno
- **Tarjetas de estadísticas** con colores distintivos
- **Tabla personalizada** con renderizado de colores
- **Botones estilizados** con colores temáticos

## 📁 Estructura del Proyecto

```
task-manager/
├── src/main/java/com/taskmanager/
│   ├── Task.java                 # Modelo de tarea
│   ├── TaskManager.java          # Gestor de datos
│   ├── TaskManagerApp.java       # Aplicación principal
│   ├── MainPanel.java            # Panel principal
│   ├── TaskDialog.java           # Diálogo de tareas
│   ├── TaskTableModel.java       # Modelo de tabla
│   ├── TaskTableRenderer.java    # Renderizador de tabla
│   └── StatisticsPanel.java      # Panel de estadísticas
├── pom.xml                       # Configuración Maven
├── tasks.json                    # Archivo de datos (se crea automáticamente)
└── README.md                     # Este archivo
```

## 💾 Persistencia de Datos

Los datos se guardan automáticamente en el archivo `tasks.json` en el directorio raíz del proyecto. El archivo se crea automáticamente la primera vez que se ejecuta la aplicación.

### Formato de Datos
```json
[
  {
    "id": "uuid-unico",
    "title": "Título de la tarea",
    "description": "Descripción de la tarea",
    "priority": "ALTA",
    "status": "PENDIENTE",
    "dueDate": "2024-01-15 14:30:00",
    "createdAt": "2024-01-10 10:00:00",
    "completedAt": null
  }
]
```

## ⌨️ Atajos de Teclado

- `Ctrl+N`: Nueva tarea
- `Ctrl+Q`: Salir de la aplicación
- `F5`: Actualizar lista de tareas
- `Ctrl+S`: Ver estadísticas
- `Enter` en campo de búsqueda: Realizar búsqueda

## 🔧 Personalización

### Modificar Colores
Los colores se pueden personalizar editando las constantes en las clases correspondientes:
- `Task.java`: Colores de prioridad
- `TaskTableRenderer.java`: Colores de estado
- `StatisticsPanel.java`: Colores de tarjetas

### Agregar Nuevos Estados
1. Agregar el nuevo estado en `Task.Status`
2. Actualizar el renderizador en `TaskTableRenderer.java`
3. Actualizar los filtros en `MainPanel.java`

## 🐛 Solución de Problemas

### Error de Compilación
- Verificar que Java 11+ esté instalado: `java -version`
- Verificar que Maven esté instalado: `mvn -version`
- Limpiar y recompilar: `mvn clean compile`

### Error de Ejecución
- Verificar que todas las dependencias estén descargadas: `mvn dependency:resolve`
- Verificar permisos de escritura en el directorio del proyecto
- Revisar los logs de error en la consola

### Problemas de Interfaz
- Si la interfaz no se ve moderna, verificar que FlatLaf se esté cargando correctamente
- En sistemas Linux, puede ser necesario instalar fuentes adicionales

## 📝 Licencia

Este proyecto está desarrollado como ejemplo educativo. Puede ser usado, modificado y distribuido libremente.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, por favor crear un issue en el repositorio del proyecto.

---

**Desarrollado con ❤️ en Java usando Swing y Maven** 