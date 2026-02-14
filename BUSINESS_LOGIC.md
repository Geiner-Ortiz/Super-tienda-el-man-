# BUSINESS_LOGIC.md - Abarrotes Profit

> Generado por SaaS Factory | Fecha: 2026-02-14

## 1. Problema de Negocio (El Dolor)

**Dolor:** Los dueños de pequeños negocios de abarrotes a menudo no tienen claridad sobre cuánto están ganando realmente día a día y mes a mes. El manejo manual de las cuentas es tedioso, propenso a errores y no ofrece una visualización clara del rendimiento del negocio.

**Costo actual:**
- Incertidumbre sobre la rentabilidad real.
- Tiempo perdido en cálculos manuales al final del día.
- Falta de datos históricos para toma de decisiones.

## 2. Solución

**Propuesta de valor:** Una aplicación ultra-simple y de alta calidad visual ("nítida") para registrar las ventas diarias y calcular automáticamente una ganancia fija del 20%. La aplicación centraliza estos datos en un dashboard mensual y diario.

**Flujo principal (Happy Path):**
1. El usuario ingresa las ventas totales del día.
2. El sistema calcula el 20% de ganancia de forma automática.
3. El sistema guarda el registro con la fecha actual.
4. El Dashboard muestra:
   - Resumen del día (Venta total | Ganancia 20%).
   - Resumen del mes actual (Venta acumulada | Ganancia acumulada).
   - Historial visual de ventas.

## 3. Usuario Objetivo

**Roles:**
- **Dueño del Negocio**: Único usuario que registra ventas y visualiza el panel de control.

## 4. Arquitectura de Datos

**Input:**
- Monto total de ventas (decimal).
- Fecha (automática o seleccionable).

**Output:**
- Ganancia calculada (Venta * 0.20).
- Dashboard nítido con métricas diarias y mensuales.

**Storage (Supabase tables):**

```sql
-- Tabla de ventas diarias
create table sales (
  id uuid primary key default gen_random_uuid(),
  amount decimal not null,
  profit decimal not null, -- amount * 0.20
  sale_date date not null default current_date,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id)
);

-- RLS habilitado para que cada usuario vea solo sus ventas
```

## 5. KPI de Éxito

- Registrar una venta en menos de 10 segundos.
- Visualización de ganancias mensuales al instante al abrir la app.
- Diseño visual premium (UI "Nítida").

## 6. Especificación Técnica

### Features a Implementar (Feature-First)

```
src/features/
├── auth/              # Autenticación (Supabase)
├── sales/             # Registro de ventas diarias
└── dashboard/         # Panel visual nítido con métricas
```

### Stack Confirmado
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4
- **Backend:** Supabase (Auth + Database)
- **Validación:** Zod
- **State:** Zustand (para el estado del dashboard)
