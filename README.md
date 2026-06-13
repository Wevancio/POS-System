# POS System

Punto de ventas — arquitectura PWA + hardware agent local.

## Estructura

```
pos-system/
├── apps/
│   ├── web/              # Next.js PWA (frontend + API)
│   └── hardware-agent/   # Node.js local — impresora y cajón
└── packages/
    └── shared/           # Tipos y utilidades compartidas
```

## Tecnologías

- **Frontend:** Next.js 14, Tailwind CSS, TypeScript
- **Base de datos:** SQLite (local/offline) + Supabase (sync cloud)
- **Hardware:** node-escpos, serialport
- **Offline:** Service Worker + PouchDB

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Levantar web (dev)
npm run dev:web

# Levantar hardware agent
npm run dev:agent
```
