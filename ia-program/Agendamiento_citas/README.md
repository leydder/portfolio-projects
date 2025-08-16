# Sistema de Agendamiento de Citas

Una aplicación web moderna y funcional para gestionar citas de manera eficiente, con una interfaz intuitiva y todas las funcionalidades necesarias para el manejo completo de agendas.

## 🚀 Características

### Funcionalidades Principales
- **📅 Selección de Fecha**: Navega fácilmente entre diferentes fechas para gestionar citas
- **➕ Crear Citas**: Agrega nuevas citas con información completa del cliente
- **✏️ Editar Citas**: Modifica cualquier aspecto de una cita existente
- **🗑️ Eliminar Citas**: Elimina citas de forma segura con confirmación
- **🔄 Reprogramar**: Cambia fecha y hora de las citas fácilmente
- **💾 Almacenamiento Local**: Los datos se guardan en el navegador usando localStorage
- **📤 Exportar/Importar**: Funcionalidad para respaldar y restaurar datos en formato JSON

### Información de las Citas
- **Hora**: Selección precisa de la hora de la cita
- **Cliente**: Nombre completo del cliente
- **Teléfono**: Número de contacto
- **Notas**: Información adicional opcional
- **Timestamps**: Fechas de creación y última modificación

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y moderna
- **CSS3**: Estilos responsivos con Grid y Flexbox
- **JavaScript ES6+**: Lógica de la aplicación con programación orientada a objetos
- **Font Awesome**: Iconos modernos y atractivos
- **LocalStorage**: Almacenamiento persistente en el navegador

## 📱 Características de la Interfaz

### Diseño Responsivo
- **Desktop**: Layout de dos columnas para máxima eficiencia
- **Tablet**: Adaptación automática a pantallas medianas
- **Mobile**: Diseño optimizado para dispositivos móviles

### Experiencia de Usuario
- **Interfaz Intuitiva**: Navegación clara y fácil de usar
- **Validaciones**: Verificación de datos en tiempo real
- **Mensajes de Estado**: Feedback visual para todas las acciones
- **Animaciones**: Transiciones suaves y efectos visuales
- **Modal de Edición**: Ventana emergente para editar citas

## 🚀 Cómo Usar

### 1. Iniciar la Aplicación
- Abre el archivo `index.html` en tu navegador web
- La aplicación se cargará automáticamente con la fecha actual

### 2. Crear una Nueva Cita
1. Selecciona la fecha deseada en el selector de fecha
2. Completa el formulario con:
   - Hora de la cita
   - Nombre del cliente
   - Teléfono de contacto
   - Notas adicionales (opcional)
3. Haz clic en "Guardar Cita"

### 3. Editar una Cita Existente
1. Haz clic en el botón "Editar" de la cita deseada
2. Modifica los campos necesarios en el modal
3. Haz clic en "Guardar Cambios"

### 4. Eliminar una Cita
1. Abre la cita en modo edición
2. Haz clic en "Eliminar Cita"
3. Confirma la acción

### 5. Reprogramar una Cita
1. Edita la cita
2. Cambia la fecha y/o hora
3. Guarda los cambios

### 6. Exportar/Importar Datos
- **Exportar**: Haz clic en "Exportar Citas" para descargar un archivo JSON
- **Importar**: Haz clic en "Importar Citas" y selecciona un archivo JSON válido

## 📁 Estructura del Proyecto

```
Agendamiento_citas/
├── index.html          # Archivo principal de la aplicación
├── styles.css          # Estilos CSS responsivos
├── script.js           # Lógica JavaScript de la aplicación
└── README.md           # Documentación del proyecto
```

## 💾 Almacenamiento de Datos

### Formato JSON
Las citas se almacenan en el siguiente formato:

```json
{
  "id": "identificador_unico",
  "date": "2024-01-15",
  "time": "14:30",
  "name": "Juan Pérez",
  "phone": "+1234567890",
  "notes": "Cliente preferencial",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

### LocalStorage
- Los datos se guardan automáticamente en el navegador
- Persisten entre sesiones
- Se pueden exportar para respaldo

## 🔧 Personalización

### Cambiar Colores
Modifica las variables CSS en `styles.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
}
```

### Agregar Campos
Para agregar nuevos campos a las citas:

1. Actualiza el HTML en `index.html`
2. Modifica la clase `AppointmentManager` en `script.js`
3. Actualiza los métodos de guardado y carga

## 🌐 Compatibilidad

### Navegadores Soportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Dispositivos
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 📋 Requisitos del Sistema

- Navegador web moderno con soporte para ES6+
- JavaScript habilitado
- LocalStorage disponible
- No requiere servidor web

## 🚀 Instalación y Despliegue

### Instalación Local
1. Descarga todos los archivos del proyecto
2. Colócalos en una carpeta
3. Abre `index.html` en tu navegador

### Despliegue en Servidor Web
1. Sube todos los archivos a tu servidor web
2. Accede a través de la URL del servidor
3. La aplicación funcionará igual que en local

## 🤝 Contribuciones

Si quieres contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Puedes usar, modificar y distribuir libremente.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica la consola del navegador para errores
3. Asegúrate de que JavaScript esté habilitado
4. Verifica que tu navegador sea compatible

## 🔮 Futuras Mejoras

- [ ] Sincronización en la nube
- [ ] Notificaciones push
- [ ] Calendario visual
- [ ] Búsqueda avanzada
- [ ] Filtros por cliente
- [ ] Reportes y estadísticas
- [ ] Integración con APIs externas
- [ ] Modo offline completo

---

**Desarrollado con ❤️ para facilitar la gestión de citas y agendas** 