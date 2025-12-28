#!/bin/bash

# Script para probar notificaciones
# Envia notificaciones de prueba para verificar que el forwarder funciona

echo "Enviando notificaciones de prueba..."

# Notificación simple
notify-send "Test" "Esta es una notificación de prueba"
sleep 2

# Notificación de VS Code
notify-send "VS Code" "Build completed" -i vscode
sleep 2

# Notificación de Terminal con palabra clave
notify-send "Terminal" "AI agent finished working"
sleep 2

# Notificación con cuerpo largo
notify-send "OpenCode" "Agent completed task" "The AI agent has finished processing your request and is waiting for your next instruction."
sleep 2

echo "Notificaciones enviadas. Verifica tu Telegram!"
