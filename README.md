# Agent Telegraph

Reenvía eventos de agentes de IA a Telegram en tiempo real. Ideal para monitorear trabajos de Claude Code mientras estás lejos del ordenador.

## Características

- ✅ Integración con hooks de Claude Code para notificaciones de tareas completadas
- ✅ Envío automático a Telegram
- ✅ Filtrado por nombre de agente y tipos de eventos
- ✅ Clean Architecture + DDD (Domain-Driven Design)
- ✅ 100% TypeScript
- ✅ Tests completos (TDD)
- ✅ Extensible a otros agentes de IA

## Requisitos

- Node.js 18+
- Bot de Telegram
- npm o yarn

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd agent-telegraph
```

2. Instala dependencias:
```bash
npm install
```

3. Configura el archivo `.env` (ver sección de configuración)

## Configuración

### 1. Crear un Bot de Telegram

1. Abre Telegram y busca [@BotFather](https://t.me/botfather)
2. Envía `/newbot` y sigue las instrucciones
3. Guarda el token que te proporciona
4. Busca [@userinfobot](https://t.me/userinfobot) para obtener tu Chat ID

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Telegram Bot Configuration (REQUERIDO)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789

# Filtros de Eventos de Agentes IA (OPCIONAL)
# Filtrar por nombre de agente (separado por comas)
FILTER_AGENT_NAMES=Claude Code

# Filtrar por tipo de evento (separado por comas)
# Tipos disponibles: agent_started, agent_stopped, waiting_for_input, task_completed, tool_used, error_occurred
FILTER_EVENT_TYPES=agent_stopped,waiting_for_input

# Habilitar/deshabilitar filtros de eventos de agentes IA
ENABLE_AGENT_FILTERS=false
```

### Opciones de Filtrado

#### Filtros de Eventos de Agentes IA
- **Sin filtros** (`ENABLE_AGENT_FILTERS=false`): Todos los eventos de agentes se envían a Telegram
- **FILTER_AGENT_NAMES**: Solo eventos de los agentes especificados (ej: "Claude Code")
- **FILTER_EVENT_TYPES**: Solo eventos de los tipos especificados
- **Ambos**: Debe cumplir ambas condiciones (agente Y tipo de evento)

## Uso

### Desarrollo

```bash
# Ejecutar en modo desarrollo (mantiene el servicio vivo para hooks)
npm run dev
```

### Producción

```bash
# Compilar
npm run build

# Ejecutar (mantiene el servicio vivo para hooks)
npm start
```

### Tests

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Cobertura de tests
npm run test:coverage
```

## Arquitectura

El proyecto sigue **Clean Architecture** con **DDD (Domain-Driven Design)** y **TDD (Test-Driven Development)**:

```
src/
├── domain/                          # Capa de Dominio - Lógica de negocio pura
│   ├── entities/
│   │   └── AgentEvent.ts            # Entity inmutable con invariantes
│   ├── value-objects/
│   │   ├── AgentName.ts             # Value Object para nombres de agentes
│   │   ├── EventType.ts             # Value Object para tipos de eventos
│   │   ├── EventTimestamp.ts        # Value Object para timestamps
│   │   └── EventMetadata.ts         # Value Object para metadata
│   └── ports/
│       └── EventNotifier.ts         # Interface para notificaciones
│
├── application/                     # Capa de Aplicación - Casos de uso
│   ├── use-cases/
│   │   └── ProcessAgentEventUseCase.ts  # Orquesta el procesamiento de eventos
│   └── services/
│       └── EventFilterService.ts    # Servicio de filtrado de eventos
│
├── infrastructure/                  # Capa de Infraestructura - Detalles técnicos
│   ├── adapters/
│   │   └── TelegramAdapter.ts       # Adaptador de Telegram (implementa EventNotifier)
│   └── config/
│       └── ConfigLoader.ts          # Configuración de la aplicación
│
├── presentation/                    # Capa de Presentación - UI/Formateo
│   ├── formatters/
│   │   └── TelegramMessageFormatter.ts  # Formatea eventos para Telegram
│   └── handlers/
│       ├── claude-stop-handler.ts   # Handler de eventos stop de Claude
│       └── claude-notification-handler.ts  # Handler de notificaciones de Claude
│
└── index.ts                         # Punto de entrada de la aplicación
```

### Principios Aplicados

1. **Clean Architecture**: Separación estricta de capas con dependencias apuntando hacia el dominio
2. **DDD**:
   - Value Objects inmutables (AgentName, EventType, EventTimestamp, EventMetadata)
   - Entities con invariantes (AgentEvent)
   - Ubiquitous Language en nombres
3. **TDD**: 144 tests unitarios (100% de cobertura en domain y application)
4. **SOLID**: Dependency Inversion, Single Responsibility, etc.
5. **Inmutabilidad**: Todos los objetos del dominio son inmutables y thread-safe

Esta arquitectura permite:
- Cambiar implementaciones sin afectar el dominio (ej: cambiar Telegram por otro servicio)
- Testear lógica de negocio sin dependencias externas
- Agregar nuevos agentes IA sin modificar el core
- Mantener el código limpio y mantenible a largo plazo

## Ejemplos de Notificaciones

### Claude Code - Tarea completada
```
✅ Agent Finished

Agent: Claude Code
Task: Add authentication system

15:22:10
```

### Claude Code - Esperando input del usuario
```
⏸️ Waiting for Input

Agent: Claude Code
Message: Agent is waiting for your response

10:30:45
```

## Troubleshooting

### El bot no recibe eventos de agentes

1. Verifica que el servicio esté corriendo:
```bash
npm run dev
```

2. Verifica que los hooks de Claude Code estén configurados correctamente (ver CLAUDE_HOOKS.md)

3. Revisa los logs de la aplicación

### Error de conexión con Telegram

1. Verifica tu token del bot:
```bash
curl https://api.telegram.org/bot<TU_TOKEN>/getMe
```

2. Verifica tu Chat ID iniciando una conversación con tu bot

### Los hooks no se ejecutan

1. Verifica que los scripts tengan permisos de ejecución:
```bash
chmod +x hooks/*.sh
```

2. Verifica la configuración en `.claude/settings.local.json`

## Integración con Agentes de IA

### Claude Code

Para recibir notificaciones cuando Claude Code termina una tarea, consulta [CLAUDE_HOOKS.md](CLAUDE_HOOKS.md) para instrucciones detalladas.

Resumen rápido:

```bash
# 1. Compilar el proyecto
npm run build:hooks

# 2. Ver instrucciones de configuración
./scripts/setup-claude-hook.sh

# 3. Probar el hook
npm run hook:test
```

## Scripts Disponibles

### Aplicación Principal
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Ejecuta la aplicación compilada
- `npm run dev` - Ejecuta en modo desarrollo con ts-node

### Integración con Claude Code
- `npm run build:hooks` - Compila y prepara hooks para Claude Code
- `npm run hook:test` - Prueba el hook de Claude Code

### Testing
- `npm test` - Ejecuta todos los tests
- `npm run test:watch` - Ejecuta tests en modo watch
- `npm run test:coverage` - Genera reporte de cobertura

## Ejecutar como Servicio (systemd)

### Opción 1: Script de Instalación Automática

El proyecto incluye un script de instalación que configura el servicio automáticamente:

```bash
./install-service.sh
```

Este script:
- Crea el archivo de servicio systemd
- Configura el usuario y rutas correctamente
- Habilita el servicio para inicio automático

### Opción 2: Instalación Manual

Crea un archivo `/etc/systemd/system/agent-telegraph.service`:

```ini
[Unit]
Description=Agent Telegraph - AI Agent Events to Telegram
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/a/agent-telegraph
ExecStart=/usr/bin/node /ruta/a/agent-telegraph/dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
```

Habilita e inicia el servicio:
```bash
sudo systemctl daemon-reload
sudo systemctl enable agent-telegraph
sudo systemctl start agent-telegraph
```

### Ver Logs del Servicio

```bash
journalctl -u agent-telegraph -f
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Escribe tests para tu código
4. Asegúrate de que todos los tests pasan (`npm test`)
5. Commit tus cambios (`git commit -m 'Add amazing feature'`)
6. Push a la rama (`git push origin feature/amazing-feature`)
7. Abre un Pull Request

## Licencia

ISC

## Autor

Desarrollado con TypeScript, DDD y TDD
