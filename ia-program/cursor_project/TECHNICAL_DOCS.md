# Documentación Técnica - Gestor de Tareas

## Arquitectura del Sistema

### Patrón de Diseño
La aplicación sigue el patrón **Modelo-Vista-Controlador (MVC)** con las siguientes capas:

1. **Modelo (Model)**: `Task.java` y `TaskManager.java`
2. **Vista (View)**: `MainPanel.java`, `TaskDialog.java`, `StatisticsPanel.java`
3. **Controlador (Controller)**: Lógica distribuida en los componentes de vista

### Estructura de Clases

#### Clases del Modelo
- **`Task`**: Entidad principal que representa una tarea
  - Propiedades: id, title, description, priority, status, dueDate, createdAt, completedAt
  - Enums: `Priority` (ALTA, MEDIA, BAJA), `Status` (PENDIENTE, EN_PROGRESO, COMPLETADA)
  - Métodos: `isOverdue()`, `getPriorityColor()`

- **`TaskManager`**: Gestor de datos y lógica de negocio
  - Persistencia JSON con Gson
  - Operaciones CRUD completas
  - Filtros y búsquedas
  - Estadísticas en tiempo real

#### Clases de Vista
- **`TaskManagerApp`**: Ventana principal de la aplicación
  - Configuración de look and feel (FlatLaf)
  - Barra de menú con atajos de teclado
  - Manejo de errores global

- **`MainPanel`**: Panel principal con tabla y controles
  - Tabla de tareas con renderizado personalizado
  - Controles de búsqueda y filtrado
  - Botones de acción (Crear, Editar, Eliminar)

- **`TaskDialog`**: Diálogo modal para crear/editar tareas
  - Formulario con validación
  - Campos: título, descripción, prioridad, estado, fecha de vencimiento

- **`StatisticsPanel`**: Panel de estadísticas
  - Tarjetas visuales con métricas
  - Actualización automática

#### Clases de Soporte
- **`TaskTableModel`**: Modelo de tabla personalizado
  - Implementa `AbstractTableModel`
  - Manejo de datos y eventos de tabla

- **`TaskTableRenderer`**: Renderizador personalizado
  - Colores según prioridad y estado
  - Formato de fechas
  - Estilos visuales

## Tecnologías Utilizadas

### Core
- **Java 17**: Lenguaje principal
- **Swing**: Framework de interfaz gráfica
- **Maven**: Gestión de dependencias y build

### Dependencias Externas
- **Gson 2.10.1**: Serialización/deserialización JSON
- **FlatLaf 3.2.1**: Look and feel moderno

### Características de Java Utilizadas
- **Switch Expressions** (Java 14+)
- **Text Blocks** (Java 15+)
- **Pattern Matching** (Java 17+)
- **Records** (Java 16+) - Considerado pero no implementado

## Persistencia de Datos

### Formato JSON
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

### Adaptador de Fechas
- **`LocalDateTimeAdapter`**: Clase interna en `TaskManager`
- Serializa fechas en formato "yyyy-MM-dd HH:mm:ss"
- Maneja valores nulos correctamente

## Interfaz de Usuario

### Diseño Visual
- **FlatLaf**: Look and feel moderno y plano
- **Colores temáticos**: 
  - Prioridades: Rojo (Alta), Amarillo (Media), Verde (Baja)
  - Estados: Naranja (Pendiente), Amarillo (En Progreso), Verde (Completada)
- **Tipografía**: Segoe UI para mejor legibilidad

### Componentes Principales
1. **Panel de Estadísticas**: 6 tarjetas con métricas
2. **Tabla de Tareas**: 6 columnas con renderizado personalizado
3. **Controles de Búsqueda**: Campo de texto y filtro desplegable
4. **Botones de Acción**: 4 botones con colores distintivos

### Responsividad
- **Layout Managers**: BorderLayout, GridLayout, FlowLayout
- **Tamaños mínimos**: 1200x800 píxeles
- **Redimensionable**: Sí, con scroll automático

## Funcionalidades Implementadas

### Gestión de Tareas
- ✅ Crear tareas con título, descripción, prioridad, estado y fecha
- ✅ Editar tareas existentes
- ✅ Eliminar tareas con confirmación
- ✅ Validación de datos en formularios

### Búsqueda y Filtrado
- ✅ Búsqueda por título y descripción
- ✅ Filtros por estado (Pendiente, En Progreso, Completada)
- ✅ Filtros especiales (Vencidas, Vencen Hoy)
- ✅ Ordenamiento por columnas

### Estadísticas
- ✅ Total de tareas
- ✅ Tareas por estado
- ✅ Tareas vencidas
- ✅ Tareas que vencen hoy
- ✅ Actualización automática

### Persistencia
- ✅ Guardado automático en JSON
- ✅ Carga automática al iniciar
- ✅ Manejo de errores de archivo

## Optimizaciones Implementadas

### Rendimiento
- **ConcurrentHashMap**: Para acceso concurrente a tareas
- **Stream API**: Para filtros y búsquedas eficientes
- **Lazy Loading**: Carga de datos bajo demanda

### Memoria
- **Reutilización de objetos**: Evita creación innecesaria
- **Garbage Collection**: Liberación automática de recursos
- **Weak References**: Para listeners cuando sea necesario

### Experiencia de Usuario
- **Feedback visual**: Colores y iconos informativos
- **Validación en tiempo real**: Errores inmediatos
- **Atajos de teclado**: Navegación rápida
- **Mensajes informativos**: Ayuda contextual

## Manejo de Errores

### Estrategias Implementadas
1. **Try-catch específicos**: Para operaciones de archivo
2. **Validación de entrada**: En formularios
3. **Mensajes de error amigables**: Para el usuario
4. **Logging**: Para debugging

### Casos Cubiertos
- ✅ Archivo JSON corrupto
- ✅ Permisos de escritura insuficientes
- ✅ Datos de entrada inválidos
- ✅ Errores de memoria
- ✅ Excepciones de Swing

## Configuración del Proyecto

### Maven
```xml
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>
```

### Dependencias
- **Gson**: Para JSON
- **FlatLaf**: Para UI moderna
- **Maven Shade Plugin**: Para JAR ejecutable

### Estructura de Directorios
```
src/main/java/com/taskmanager/
├── Task.java
├── TaskManager.java
├── TaskManagerApp.java
├── MainPanel.java
├── TaskDialog.java
├── TaskTableModel.java
├── TaskTableRenderer.java
└── StatisticsPanel.java
```

## Pruebas y Validación

### Casos de Prueba Manuales
1. ✅ Crear tarea con todos los campos
2. ✅ Crear tarea con campos mínimos
3. ✅ Editar tarea existente
4. ✅ Eliminar tarea con confirmación
5. ✅ Buscar tareas por texto
6. ✅ Filtrar por estado
7. ✅ Verificar persistencia de datos
8. ✅ Probar atajos de teclado

### Validaciones Implementadas
- ✅ Título obligatorio
- ✅ Formato de fecha válido
- ✅ Prioridad y estado válidos
- ✅ Fechas de vencimiento lógicas

## Posibles Mejoras Futuras

### Funcionalidades
- [ ] Categorías de tareas
- [ ] Etiquetas personalizadas
- [ ] Subtareas
- [ ] Notificaciones
- [ ] Exportar/importar datos
- [ ] Backup automático

### Técnicas
- [ ] Tests unitarios con JUnit
- [ ] Tests de integración
- [ ] Logging estructurado
- [ ] Configuración externa
- [ ] Temas personalizables
- [ ] Plugins

### Arquitectura
- [ ] Base de datos SQLite
- [ ] Arquitectura modular
- [ ] API REST
- [ ] Aplicación web
- [ ] Sincronización en la nube

## Conclusión

La aplicación implementa una solución completa y robusta para la gestión de tareas, con una arquitectura bien estructurada, interfaz moderna y funcionalidades avanzadas. El código es mantenible, extensible y sigue las mejores prácticas de Java moderno. 