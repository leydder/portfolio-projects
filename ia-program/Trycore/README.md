# Challenge Técnico PM - Gestión de Portafolios de Proyectos

## 📋 Descripción del Proyecto

Sitio web desarrollado para presentar un challenge técnico de Project Management (PM) que demuestra la implementación de metodologías híbridas PMI + Agile at Scale para la gestión efectiva de portafolios de proyectos.

## 🎯 Características Principales

### 🏠 Página Principal (Home)
- **Diseño moderno y responsive** con gradientes y efectos visuales atractivos
- **5 botones de navegación** principales que enlazan a subpáginas específicas
- **Iconografía intuitiva** para cada sección
- **Animaciones suaves** y efectos hover interactivos

### 📱 Subpáginas Implementadas
1. **Modelo Operativo Estratégico** - Caso de estudio bancario con RPA + IA
2. **Estructura Organizacional** - Aplicación de la Propuesta con estructura organizacional y modelo de ejecución
3. **Registro de Horas** - Aplicación al Caso de Conciliación Bancaria con estrategia de registro y control de capacidad
4. **Gestión del Conocimiento** - Aplicación al Caso Bancario con estrategia de gestión del conocimiento aplicada
5. **Seguimiento y Control** - Aplicación al Caso Bancario con estructura de seguimiento y control de los frentes

## 🏗️ Arquitectura Técnica

### Frontend
- **HTML5** semántico y accesible
- **CSS3** con diseño responsive y variables CSS
- **JavaScript ES6+** para funcionalidades interactivas
- **Font Awesome** para iconografía
- **Google Fonts** (Inter) para tipografía

### Características Técnicas
- **Diseño responsive** que se adapta a todos los dispositivos
- **CSS Grid y Flexbox** para layouts modernos
- **Animaciones CSS** y transiciones suaves
- **Optimización de rendimiento** con lazy loading
- **Accesibilidad** con navegación por teclado y ARIA

## 📁 Estructura de Archivos

```
Trycore/
├── index.html              # Página principal
├── modelo-operativo.html   # Subpágina del caso bancario
├── styles.css              # Estilos principales
├── subpage-styles.css      # Estilos específicos de subpáginas
├── script.js               # Funcionalidades JavaScript
└── README.md               # Documentación del proyecto
```

## 🚀 Funcionalidades Implementadas

### Página Principal
- ✅ Navegación principal con 5 botones
- ✅ Diseño responsive y moderno
- ✅ Efectos hover y animaciones
- ✅ Iconografía descriptiva

### Subpágina: Modelo Operativo
- ✅ Caso de estudio bancario completo
- ✅ 5 fases del modelo híbrido PMI + Agile
- ✅ Métricas Before/After
- ✅ KPIs operacionales
- ✅ Botón de retorno al home
- ✅ Diseño adaptativo para móviles

### Subpágina: Estructura Organizacional
- ✅ Estructura organizacional completa con 8 roles
- ✅ Modelo de ejecución con sprints y control
- ✅ KPIs específicos del caso bancario
- ✅ Diseño jerárquico visual atractivo
- ✅ Responsive design para todos los dispositivos

### Subpágina: Registro de Horas
- ✅ Estrategia completa de registro continuo de horas
- ✅ Estructura del equipo (7 personas)
- ✅ Cálculo de capacidad total del proyecto
- ✅ Control estratégico de carga de trabajo
- ✅ Reportes del PMO con métricas específicas
- ✅ KPIs del caso con valores objetivo

### Subpágina: Gestión del Conocimiento
- ✅ 4 fases de gestión del conocimiento aplicadas
- ✅ Estrategia de documentación por fases del proyecto
- ✅ KPIs específicos de gestión del conocimiento
- ✅ Herramientas y plataformas utilizadas
- ✅ Componentes reutilizables y librería interna
- ✅ Proceso de lecciones aprendidas y cierre

### Subpágina: Seguimiento y Control
- ✅ 3 frentes principales de control implementados
- ✅ Portafolio de proyectos con KPIs de estado
- ✅ Capacity & recursos con métricas de utilización
- ✅ Preventa & delivery inicial con indicadores de calidad
- ✅ Resumen ejecutivo del control del proyecto
- ✅ Sistema de monitoreo y alertas en tiempo real

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: Gradiente azul-púrpura (#667eea → #764ba2)
- **Secundario**: Verde (#38a169) para objetivos
- **Acento**: Dorado (#ffd700) para elementos destacados
- **Neutros**: Grises para texto y fondos

### Tipografía
- **Principal**: Inter (Google Fonts)
- **Jerarquía**: Títulos, subtítulos y cuerpo de texto bien definidos
- **Legibilidad**: Alto contraste y tamaños apropiados

### Responsive Design
- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: 768px y 480px para adaptación progresiva
- **Touch Friendly**: Elementos táctiles apropiados para móviles

## 🔧 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere servidor web (funciona con file://)

### Instalación
1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. Navega por las diferentes secciones

### Desarrollo Local
```bash
# Si tienes Python instalado
python -m http.server 8000

# Si tienes Node.js instalado
npx serve .

# Si tienes PHP instalado
php -S localhost:8000
```

## 📱 Compatibilidad

### Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

## 🚧 Próximas Implementaciones

### Subpáginas Pendientes
1. **Estructura Organizacional Detallada y Modelo de Ejecución**
2. **Estrategia para Registro Continuo y Estratégico de Horas**
3. **Planteamiento en Gestión del Conocimiento**
4. **Estructura de Seguimiento y Control de los Frentes**

### Mejoras Futuras
- [ ] Sistema de búsqueda interno
- [ ] Filtros por categorías
- [ ] Exportación a PDF
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] PWA (Progressive Web App)

## 🎯 Caso de Estudio Implementado

### Caso Banca: Automatización de Conciliación Bancaria
- **Contexto**: Entidad financiera multinacional
- **Problema**: Proceso manual de 8h diarias con 15% de errores
- **Solución**: RPA + IA para automatización del 85% del proceso
- **Resultado**: Reducción de 8h → 45min, errores <2%

### Metodología Aplicada
- **Fase 1**: Preventa & Discovery
- **Fase 2**: Planificación detallada
- **Fase 3**: Ejecución industrializada
- **Fase 4**: Entrega y UAT
- **Fase 5**: Post-garantía y soporte

## 🤝 Contribuciones

Este proyecto está diseñado como un challenge técnico de PM. Las contribuciones y mejoras son bienvenidas:

1. Fork del proyecto
2. Crear una rama para tu feature
3. Commit de tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está desarrollado para propósitos educativos y de demostración técnica.

## 👨‍💻 Autor

Desarrollado para el Challenge Técnico de Project Management con metodologías híbridas PMI + Agile at Scale.

---

**Estado del Proyecto**: ✅ Página principal y 5 subpáginas implementadas
**Próximo Hito**: 🎉 Challenge Técnico PM COMPLETADO
**Tecnologías**: HTML5, CSS3, JavaScript ES6+
**Metodología**: PMI + Agile at Scale 