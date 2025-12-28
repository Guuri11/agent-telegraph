# Guía Rápida de Inicio

## 1. Instalación (5 minutos)

### Instalar dependencias
```bash
npm install
```

### Compilar el proyecto
```bash
npm run build
```

## 2. Configurar Telegram Bot (5 minutos)

### Crear Bot
1. Abre Telegram
2. Busca **@BotFather**
3. Envía: `/newbot`
4. Sigue las instrucciones
5. Guarda el **token** que te da

### Obtener tu Chat ID
1. Busca **@userinfobot** en Telegram
2. Inicia la conversación
3. El bot te mostrará tu **Chat ID**

## 3. Configurar la Aplicación (2 minutos)

```bash
cp .env.example .env
nano .env  # o usa tu editor favorito
```

Edita el archivo `.env`:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
ENABLE_FILTERS=false
```

## 4. Ejecutar (1 minuto)

### Modo desarrollo (con logs)
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

## 5. Probar (1 minuto)

Abre otra terminal y ejecuta:
```bash
./test-notifications.sh
```

Verifica que recibes las notificaciones en Telegram!

---

## Configuración con Filtros (Opcional)

Si solo quieres recibir ciertas notificaciones, edita `.env`:

```env
# Solo notificaciones de VS Code y Terminal
FILTER_APPS=VS Code,Terminal

# Solo notificaciones con estas palabras
FILTER_KEYWORDS=AI,agent,finished,completed,error

# Activar filtros
ENABLE_FILTERS=true
```

**Nota**: Si configuras ambos filtros (FILTER_APPS y FILTER_KEYWORDS), la notificación debe cumplir AMBAS condiciones.

---

## Instalar como Servicio (para que siempre esté activo)

```bash
./install-service.sh
```

El script te guiará en el proceso.

---

## Casos de Uso

### 1. Monitorear Agentes de IA
```env
FILTER_KEYWORDS=AI,agent,finished,waiting,completed
ENABLE_FILTERS=true
```

### 2. Solo notificaciones de desarrollo
```env
FILTER_APPS=VS Code,Code,Terminal,PyCharm
ENABLE_FILTERS=true
```

### 3. Todo (sin filtros)
```env
ENABLE_FILTERS=false
```

---

## Troubleshooting Rápido

### No recibo notificaciones

**1. Verifica que el bot funciona:**
```bash
# En otra terminal, durante la ejecución
notify-send "Test" "Hola mundo"
```

**2. Verifica el token de Telegram:**
```bash
curl https://api.telegram.org/bot<TU_TOKEN>/getMe
```

Debe devolver información del bot.

**3. Verifica que DBus está funcionando:**
```bash
dbus-monitor --session "interface='org.freedesktop.Notifications'"
```

Envía una notificación con `notify-send` y deberías ver actividad.

### El servicio no inicia

```bash
# Ver logs
journalctl -u notification-forwarder -n 50

# Ver estado
sudo systemctl status notification-forwarder
```

---

## Tests

```bash
# Ejecutar tests
npm test

# Ver cobertura
npm run test:coverage
```

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Ejecutar en modo desarrollo
npm run build            # Compilar TypeScript
npm test                 # Ejecutar tests

# Servicio
sudo systemctl start notification-forwarder    # Iniciar
sudo systemctl stop notification-forwarder     # Detener
sudo systemctl status notification-forwarder   # Ver estado
journalctl -u notification-forwarder -f        # Ver logs en tiempo real

# Pruebas
./test-notifications.sh  # Enviar notificaciones de prueba
notify-send "App" "Mensaje"  # Enviar notificación manual
```

---

¿Necesitas ayuda? Revisa el README.md completo o STRUCTURE.md para entender la arquitectura.
