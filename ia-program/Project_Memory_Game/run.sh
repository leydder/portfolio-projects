#!/bin/bash

echo "=== Juego de Parejas - Memory Game ==="
echo ""
echo "Selecciona una versión:"
echo "1. Versión Básica (MemoryGame)"
echo "2. Versión Mejorada (MemoryGameEnhanced)"
echo "3. Compilar ambas versiones"
echo "4. Salir"
echo ""
read -p "Ingresa tu opción (1-4): " choice

case $choice in
    1)
        echo "Compilando versión básica..."
        javac MemoryGame.java
        if [ $? -eq 0 ]; then
            echo "Ejecutando versión básica..."
            java MemoryGame
        else
            echo "Error al compilar la versión básica"
        fi
        ;;
    2)
        echo "Compilando versión mejorada..."
        javac MemoryGameEnhanced.java
        if [ $? -eq 0 ]; then
            echo "Ejecutando versión mejorada..."
            java MemoryGameEnhanced
        else
            echo "Error al compilar la versión mejorada"
        fi
        ;;
    3)
        echo "Compilando ambas versiones..."
        javac MemoryGame.java MemoryGameEnhanced.java
        if [ $? -eq 0 ]; then
            echo "Compilación exitosa de ambas versiones"
            echo "Para ejecutar:"
            echo "  java MemoryGame (versión básica)"
            echo "  java MemoryGameEnhanced (versión mejorada)"
        else
            echo "Error al compilar"
        fi
        ;;
    4)
        echo "¡Hasta luego!"
        exit 0
        ;;
    *)
        echo "Opción inválida. Por favor selecciona 1, 2, 3 o 4."
        ;;
esac 