# Ejemplos de Uso Avanzado

## 1. Integración con Scripts de Shell

### Notificar cuando termina un comando largo

```bash
#!/bin/bash
# build-and-notify.sh

npm run build
if [ $? -eq 0 ]; then
    notify-send "Build" "Compilación exitosa ✓"
else
    notify-send "Build" "Compilación fallida ✗"
fi
```

### Notificar cuando termina cualquier comando

```bash
make build ; notify-send "Make" "Build finalizado"
```

## 2. Integración con Scripts de Python

```python
#!/usr/bin/env python3
# ai_agent.py

import subprocess
import time

def notify(title, message):
    subprocess.run(['notify-send', title, message])

# Tu código de IA
print("Iniciando agente de IA...")
notify("AI Agent", "Agente iniciado")

# Simular trabajo
time.sleep(5)

notify("AI Agent", "Trabajo completado - Esperando instrucciones")
```

## 3. Integración con VS Code Tasks

`.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build with notification",
      "type": "shell",
      "command": "npm run build && notify-send 'VS Code' 'Build completed'",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Test with notification",
      "type": "shell",
      "command": "npm test && notify-send 'VS Code' 'Tests passed' || notify-send 'VS Code' 'Tests failed'",
      "group": "test"
    }
  ]
}
```

## 4. Configuraciones de Filtros Comunes

### Solo errores y warnings
```env
FILTER_KEYWORDS=error,warning,failed,exception,critical
ENABLE_FILTERS=true
```

### Solo herramientas de desarrollo
```env
FILTER_APPS=VS Code,Code,PyCharm,IntelliJ,Terminal,Docker
ENABLE_FILTERS=true
```

### Solo agentes de IA
```env
FILTER_KEYWORDS=AI,agent,GPT,Claude,finished,completed,waiting
ENABLE_FILTERS=true
```

### Combinado: Solo errores de VS Code
```env
FILTER_APPS=VS Code,Code
FILTER_KEYWORDS=error,failed,warning
ENABLE_FILTERS=true
```

## 5. Automatización con Cron

### Notificar cada hora que el sistema sigue activo
```bash
crontab -e
```

Añadir:
```
0 * * * * notify-send "System Status" "Sistema activo - $(date)"
```

## 6. Integración con Docker

### Notificar cuando un contenedor termina
```bash
#!/bin/bash
# run-container-with-notification.sh

CONTAINER_NAME="my-ai-agent"

docker run --name $CONTAINER_NAME my-image

if [ $? -eq 0 ]; then
    notify-send "Docker" "Contenedor $CONTAINER_NAME terminó exitosamente"
else
    notify-send "Docker" "Contenedor $CONTAINER_NAME falló"
fi
```

## 7. Configuración para Múltiples Usuarios

Si quieres que diferentes usuarios reciban notificaciones a diferentes chats:

1. Crea múltiples archivos de configuración:
   - `.env.user1`
   - `.env.user2`

2. Ejecuta con diferentes configuraciones:
```bash
# Usuario 1
cp .env.user1 .env
npm start

# Usuario 2 (en otra sesión)
cp .env.user2 .env
npm start
```

## 8. Webhook desde Aplicaciones Web

Si tu aplicación web necesita enviar notificaciones al ordenador:

### Servidor Node.js simple
```javascript
// notification-webhook.js
const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

app.post('/notify', (req, res) => {
  const { title, message } = req.body;
  
  exec(`notify-send "${title}" "${message}"`, (error) => {
    if (error) {
      res.status(500).json({ error: 'Failed to send notification' });
    } else {
      res.json({ success: true });
    }
  });
});

app.listen(3000);
```

### Usar desde cualquier lugar
```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{"title":"AI Agent","message":"Task completed"}'
```

## 9. Monitoreo de Logs

### Notificar cuando aparece un error en logs
```bash
#!/bin/bash
# monitor-logs.sh

tail -f /var/log/myapp.log | while read line; do
  if echo "$line" | grep -i "error"; then
    notify-send "Log Monitor" "Error detectado: $line"
  fi
done
```

## 10. Integración con Git Hooks

### Post-commit hook
`.git/hooks/post-commit`:
```bash
#!/bin/bash
COMMIT_MSG=$(git log -1 --pretty=%B)
notify-send "Git" "Commit realizado: $COMMIT_MSG"
```

### Pre-push hook
`.git/hooks/pre-push`:
```bash
#!/bin/bash
notify-send "Git" "Iniciando push al repositorio..."
```

## 11. Monitoreo de Procesos Largos

```bash
#!/bin/bash
# long-task-monitor.sh

# Iniciar tarea en background
my-long-running-command &
PID=$!

notify-send "Task Monitor" "Tarea iniciada (PID: $PID)"

# Esperar a que termine
wait $PID
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    notify-send "Task Monitor" "Tarea completada exitosamente"
else
    notify-send "Task Monitor" "Tarea falló con código: $EXIT_CODE"
fi
```

## 12. Integración con Makefile

```makefile
.PHONY: build test deploy

build:
	@echo "Building project..."
	@npm run build
	@notify-send "Make" "Build completado"

test:
	@echo "Running tests..."
	@npm test && notify-send "Make" "Tests passed ✓" || notify-send "Make" "Tests failed ✗"

deploy:
	@echo "Deploying..."
	@./deploy.sh
	@notify-send "Make" "Deploy completado"

all: build test
	@notify-send "Make" "Build y tests completados"
```

## 13. Configuración Multi-Idioma

Edita `src/domain/services/NotificationService.ts` o `src/index.ts` para cambiar el formato de tiempo:

```typescript
// Español
const time = new Date().toLocaleTimeString('es-ES');

// Inglés
const time = new Date().toLocaleTimeString('en-US');

// Formato 24h
const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
```

## 14. Debugging y Logs Avanzados

### Habilitar logs detallados
Modifica `src/index.ts` para añadir más logs:

```typescript
this.monitor.onNotification(async (notification) => {
  console.log('[DEBUG] Notification received:', {
    app: notification.appName,
    summary: notification.summary,
    timestamp: new Date().toISOString()
  });
  
  try {
    await this.service.processNotification({
      appName: notification.appName,
      summary: notification.summary,
      body: notification.body
    });
    console.log('[DEBUG] Notification processed successfully');
  } catch (error) {
    console.error('[ERROR] Failed to process notification:', error);
  }
});
```

### Ver logs en tiempo real cuando corre como servicio
```bash
journalctl -u notification-forwarder -f --output cat
```

## 15. Extensión: Añadir Nuevo Adaptador (Discord)

```typescript
// src/infrastructure/adapters/DiscordAdapter.ts
import { NotificationSender } from '../../domain/services/NotificationService';

export interface DiscordConfig {
  webhookUrl: string;
}

export class DiscordAdapter implements NotificationSender {
  constructor(private config: DiscordConfig) {}

  async send(message: string): Promise<void> {
    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send Discord message');
    }
  }
}
```

Luego en `src/index.ts`:
```typescript
import { DiscordAdapter } from './infrastructure/adapters/DiscordAdapter';

// Usar Discord en lugar de Telegram
const discordAdapter = new DiscordAdapter({
  webhookUrl: process.env.DISCORD_WEBHOOK_URL!
});

this.service = new NotificationService(discordAdapter, config.filters);
```

---

¿Tienes un caso de uso específico? Combina estos ejemplos para crear tu solución personalizada!
