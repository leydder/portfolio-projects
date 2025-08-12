#!/bin/bash

# Script para ejecutar ZonaFit
echo "🚀 Iniciando ZonaFit..."

# Verificar si Java está instalado
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java no está instalado o no está en el PATH"
    exit 1
fi

# Verificar si el JAR existe
if [ ! -f "target/ZonaFit-1.0-SNAPSHOT-jar-with-dependencies.jar" ]; then
    echo "❌ Error: JAR no encontrado. Ejecute 'mvn clean package' primero"
    exit 1
fi

# Ejecutar la aplicación
echo "✅ Ejecutando ZonaFit..."
java -jar target/ZonaFit-1.0-SNAPSHOT-jar-with-dependencies.jar 