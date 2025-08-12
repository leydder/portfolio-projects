#!/bin/bash

# Script para compilar ZonaFit
echo "🔨 Compilando ZonaFit..."

# Verificar si Maven está instalado
if ! command -v mvn &> /dev/null; then
    echo "❌ Error: Maven no está instalado o no está en el PATH"
    echo "💡 Instale Maven o use: ./apache-maven-3.9.6/bin/mvn clean package"
    exit 1
fi

# Limpiar y compilar
echo "🧹 Limpiando proyecto..."
mvn clean

echo "📦 Compilando y empaquetando..."
mvn package

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa!"
    echo "🎯 JAR ejecutable creado en: target/ZonaFit-1.0-SNAPSHOT-jar-with-dependencies.jar"
    echo "🚀 Para ejecutar use: ./run.sh"
else
    echo "❌ Error en la compilación"
    exit 1
fi 