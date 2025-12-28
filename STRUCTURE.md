# Estructura del Proyecto

```
agent-telegraph/
├── src/
│   ├── domain/                         # Capa de Dominio (Lógica de negocio)
│   │   ├── entities/
│   │   │   ├── Notification.ts         # Entidad de dominio Notification
│   │   │   └── __tests__/
│   │   │       └── Notification.test.ts
│   │   └── services/
│   │       ├── NotificationService.ts  # Servicio de dominio
│   │       └── __tests__/
│   │           └── NotificationService.test.ts
│   │
│   ├── infrastructure/                 # Capa de Infraestructura (Adaptadores)
│   │   ├── adapters/
│   │   │   ├── TelegramAdapter.ts      # Adaptador para Telegram API
│   │   │   └── __tests__/
│   │   │       └── TelegramAdapter.test.ts
│   │   └── monitors/
│   │       ├── DBusNotificationMonitor.ts  # Monitor de DBus
│   │       └── __tests__/
│   │           └── DBusNotificationMonitor.test.ts
│   │
│   ├── config/                         # Configuración
│   │   ├── ConfigLoader.ts             # Cargador de configuración
│   │   └── __tests__/
│   │       └── ConfigLoader.test.ts
│   │
│   └── index.ts                        # Punto de entrada de la aplicación
│
├── dist/                               # Código compilado (generado)
├── coverage/                           # Reportes de cobertura (generado)
├── node_modules/                       # Dependencias (generado)
│
├── .env                                # Variables de entorno (NO en git)
├── .env.example                        # Ejemplo de variables de entorno
├── .gitignore                          # Archivos ignorados por git
├── package.json                        # Configuración de npm
├── tsconfig.json                       # Configuración de TypeScript
├── jest.config.js                      # Configuración de Jest
├── README.md                           # Documentación principal
├── STRUCTURE.md                        # Este archivo
└── test-notifications.sh               # Script de prueba
```

## Principios Arquitectónicos

### Domain-Driven Design (DDD)

La aplicación sigue los principios de DDD con una clara separación de capas:

1. **Dominio (Domain Layer)**
   - Contiene la lógica de negocio pura
   - No tiene dependencias de infraestructura
   - Define interfaces que la infraestructura debe implementar
   - Entities: `NotificationEntity`
   - Services: `NotificationService`
   - Interfaces: `NotificationSender`, `NotificationFilter`

2. **Infraestructura (Infrastructure Layer)**
   - Implementa los adaptadores para servicios externos
   - Adaptadores: `TelegramAdapter` (implementa `NotificationSender`)
   - Monitores: `DBusNotificationMonitor`
   - Depende del dominio, no al revés

3. **Aplicación (Application Layer)**
   - Orquesta el dominio y la infraestructura
   - Punto de entrada: `index.ts`
   - Maneja el ciclo de vida de la aplicación

### Test-Driven Development (TDD)

Todos los componentes tienen tests:
- 41 tests en total
- Cobertura completa de funcionalidad
- Tests unitarios para cada clase
- Mocks para dependencias externas

### Hexagonal Architecture (Ports & Adapters)

- **Ports**: Interfaces definidas en el dominio (`NotificationSender`)
- **Adapters**: Implementaciones en infraestructura (`TelegramAdapter`)
- El dominio no conoce a los adaptadores concretos
- Facilita el cambio de tecnologías sin afectar el dominio

## Flujo de Datos

```
Ubuntu DBus Notification
         ↓
DBusNotificationMonitor (Infrastructure)
         ↓
NotificationService (Domain)
         ↓
NotificationSender Interface (Domain)
         ↓
TelegramAdapter (Infrastructure)
         ↓
Telegram API
```

## Extensibilidad

Para añadir nuevos adaptadores (ej: Discord, Slack):

1. Implementa la interfaz `NotificationSender`
2. Crea el adaptador en `infrastructure/adapters/`
3. Escribe tests para el adaptador
4. Úsalo en `index.ts` en lugar de `TelegramAdapter`

No es necesario modificar el dominio!

## Tests

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Ver cobertura
npm run test:coverage
```

## Dependencias Principales

### Producción
- `dbus-next`: Cliente DBus para Node.js
- `node-telegram-bot-api`: Cliente de Telegram Bot API
- `dotenv`: Gestión de variables de entorno

### Desarrollo
- `typescript`: Compilador TypeScript
- `jest`: Framework de testing
- `ts-jest`: Preset de Jest para TypeScript
- `@types/*`: Definiciones de tipos
