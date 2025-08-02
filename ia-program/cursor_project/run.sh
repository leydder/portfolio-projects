#!/bin/bash

# Script para ejecutar el Gestor de Tareas
# Autor: Leyder Bermúdez
# Fecha: 2024

echo "🚀 Iniciando Gestor de Tareas..."
echo ""

# Verificar si Java está instalado
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java no está instalado o no está en el PATH"
    echo "Por favor, instale Java 17 o superior"
    exit 1
fi

# Verificar la versión de Java
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Error: Se requiere Java 17 o superior. Versión actual: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java $JAVA_VERSION detectado"

# Verificar si el JAR existe
if [ ! -f "target/task-manager-1.0.0.jar" ]; then
    echo "❌ Error: El archivo JAR no existe"
    echo "Ejecute 'mvn clean package' primero"
    exit 1
fi

echo "✅ Archivo JAR encontrado"
echo ""

# Ejecutar la aplicación
echo "🎯 Iniciando aplicación..."
java -jar target/task-manager-1.0.0.jar

echo ""
echo "👋 ¡Gracias por usar el Gestor de Tareas!" 