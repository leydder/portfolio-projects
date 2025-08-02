# Juego de Parejas - Memory Game

Un clásico juego de parejas desarrollado en Java con interfaz gráfica usando Swing.

## Versiones Disponibles

### 1. MemoryGame.java - Versión Básica
- Interfaz simple y funcional
- Sistema de puntuación básico
- Un tema de cartas (animales)

### 2. MemoryGameEnhanced.java - Versión Mejorada
- Múltiples temas de cartas (Animales, Frutas, Deportes, Naturaleza, Vehículos)
- Sistema de niveles
- Cronómetro de tiempo
- Efectos visuales mejorados
- Botones adicionales para cambiar tema y avanzar nivel

## Características

- **Interfaz gráfica intuitiva**: Ventana con botones que representan las cartas
- **Sistema de puntuación**: Contador de parejas encontradas y movimientos realizados
- **Animaciones**: Las cartas se ocultan automáticamente si no forman pareja
- **Reinicio del juego**: Botones para iniciar un nuevo juego o reiniciar el actual
- **Iconos visuales**: Emojis para representar las cartas
- **Grid 4x4**: 16 cartas (8 parejas) para una experiencia de juego equilibrada

## Cómo jugar

1. **Objetivo**: Encontrar todas las parejas de cartas iguales
2. **Mecánica**: 
   - Haz clic en una carta para revelarla
   - Haz clic en otra carta para intentar formar pareja
   - Si las cartas son iguales, permanecen visibles
   - Si no son iguales, se ocultan después de 1-1.5 segundos
3. **Victoria**: Encuentra todas las 8 parejas para completar el juego

## Compilación y Ejecución

### Requisitos
- Java JDK 8 o superior

### Compilar las versiones
```bash
# Versión básica
javac MemoryGame.java

# Versión mejorada
javac MemoryGameEnhanced.java
```

### Ejecutar el juego
```bash
# Versión básica
java MemoryGame

# Versión mejorada
java MemoryGameEnhanced
```

## Estructura del código

### MemoryGame.java (Versión Básica)
- **Clase principal**: Contiene toda la lógica del juego básico
- **Interfaz gráfica**: Implementada con Swing (JFrame, JButton, JPanel)
- **Lógica del juego**: 
  - Inicialización aleatoria de cartas
  - Verificación de parejas
  - Sistema de puntuación básico
  - Timer para ocultar cartas incorrectas

### MemoryGameEnhanced.java (Versión Mejorada)
- **Características adicionales**:
  - 5 temas diferentes de cartas
  - Sistema de niveles progresivos
  - Cronómetro de tiempo de juego
  - Efectos visuales mejorados (colores, bordes)
  - Botones para cambiar tema y avanzar nivel
  - Mensajes informativos al completar niveles

## Funcionalidades implementadas

### Versión Básica
✅ Ventana principal con botones que representan cartas  
✅ Imágenes (emojis) que se muestran al hacer clic  
✅ Lógica para emparejar cartas iguales  
✅ Sistema de puntuación y contador de movimientos  
✅ Animaciones y efectos visuales básicos  
✅ Botones para reiniciar y nuevo juego  
✅ Detección de victoria del juego  

### Versión Mejorada
✅ Todas las funcionalidades de la versión básica  
✅ Múltiples temas de cartas (5 temas diferentes)  
✅ Sistema de niveles progresivos  
✅ Cronómetro de tiempo de juego  
✅ Efectos visuales mejorados (colores, bordes 3D)  
✅ Botones para cambiar tema y avanzar nivel  
✅ Mensajes informativos al completar niveles  
✅ Interfaz más rica con información adicional  

## Personalización

Puedes modificar ambos juegos fácilmente:

### Versión Básica
- **Cambiar iconos**: Modifica el array `cardIcons` en la línea 18
- **Cambiar tamaño**: Modifica las variables `cards[4][4]` y `totalPairs = 8`
- **Cambiar colores**: Modifica los colores de fondo de los botones
- **Cambiar tiempo**: Modifica el delay del timer (actualmente 1000ms)

### Versión Mejorada
- **Agregar temas**: Añade nuevos arrays al array `cardThemes`
- **Cambiar efectos visuales**: Modifica los colores y bordes en `createCards()`
- **Ajustar dificultad**: Modifica el tiempo de delay para cartas incorrectas
- **Personalizar mensajes**: Modifica los textos en los diálogos

## Diferencias entre versiones

| Característica | Versión Básica | Versión Mejorada |
|----------------|----------------|------------------|
| Temas de cartas | 1 (Animales) | 5 (Animales, Frutas, Deportes, Naturaleza, Vehículos) |
| Sistema de niveles | ❌ | ✅ |
| Cronómetro | ❌ | ✅ |
| Efectos visuales | Básicos | Mejorados |
| Botones adicionales | 2 | 4 |
| Interfaz | Simple | Rica con más información |

¡Disfruta jugando al clásico juego de parejas! 