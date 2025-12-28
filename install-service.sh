#!/bin/bash

# Script para instalar el servicio systemd

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Instalación de Agent Telegraph como servicio systemd ===${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Este script debe ejecutarse desde el directorio del proyecto${NC}"
    exit 1
fi

# Obtener rutas absolutas
CURRENT_DIR=$(pwd)
USERNAME=$(whoami)

echo -e "${YELLOW}Información del servicio:${NC}"
echo "Usuario: $USERNAME"
echo "Directorio: $CURRENT_DIR"
echo ""

# Verificar que el proyecto está compilado
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}El proyecto no está compilado. Compilando...${NC}"
    npm run build
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: No existe el archivo .env${NC}"
    echo "Copia .env.example a .env y configúralo con tus credenciales"
    exit 1
fi

# Crear archivo de servicio temporal
SERVICE_FILE=$(mktemp)
sed "s|%USERNAME%|$USERNAME|g; s|%WORKDIR%|$CURRENT_DIR|g" agent-telegraph.service > "$SERVICE_FILE"

echo -e "${YELLOW}Instalando servicio...${NC}"

# Copiar archivo de servicio
sudo cp "$SERVICE_FILE" /etc/systemd/system/agent-telegraph.service
rm "$SERVICE_FILE"

# Recargar systemd
sudo systemctl daemon-reload

echo -e "${GREEN}✓ Servicio instalado correctamente${NC}\n"

echo -e "${YELLOW}Comandos útiles:${NC}"
echo "  Iniciar servicio:    sudo systemctl start agent-telegraph"
echo "  Detener servicio:    sudo systemctl stop agent-telegraph"
echo "  Estado del servicio: sudo systemctl status agent-telegraph"
echo "  Habilitar al inicio: sudo systemctl enable agent-telegraph"
echo "  Ver logs:            journalctl -u agent-telegraph -f"
echo ""

read -p "¿Deseas iniciar el servicio ahora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    sudo systemctl start agent-telegraph
    echo -e "${GREEN}✓ Servicio iniciado${NC}"
    sleep 2
    sudo systemctl status agent-telegraph --no-pager
fi

echo ""
read -p "¿Deseas habilitar el servicio para que inicie automáticamente? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    sudo systemctl enable agent-telegraph
    echo -e "${GREEN}✓ Servicio habilitado para inicio automático${NC}"
fi

echo ""
echo -e "${GREEN}¡Instalación completada!${NC}"
