# 📊 Análisis - Súper Tienda El Maná
## Sistema de Control de Ventas y Ganancias Nítido

**Fecha de Análisis:** 14 de Febrero, 2026
**Versión:** 1.0.0
**Estado:** 🛠️ EN PLANIFICACIÓN

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo
Construir una aplicación web que permita al dueño de una tienda de abarrotes llevar el control exacto de sus ventas diarias y visualizar sus ganancias del 20% de forma nítida y profesional.

| Aspecto | Plan | Detalles |
|---------|------|----------|
| **Ventas** | Diarias | Carga manual simplificada |
| **Ganancia** | 20% Fijo | Cálculo automático en cada venta |
| **Visualización** | Dashboard | Vista diaria y mensual filtrada |
| **Diseño** | Premium | Estética moderna, modo oscuro por defecto |

---

## 📋 FUNCIONALIDADES PROPUESTAS

### 1. Carga de Ventas Diarias
- Formulario ultra-rápido donde solo se ingresa el monto total de la venta actual o del día.
- Cálculo de ganancia del 20% en tiempo real antes de guardar.
- Selección de fecha (por defecto hoy).

### 2. Dashboard Nitido
- **Métricas Top**:
  - Ventas Hoy | Ganancia Hoy (20%)
  - Ventas Mes | Ganancia Mes (20%)
- **Gráfico de Tendencia**: Visualización de ventas de los últimos 7 o 30 días.
- **Historial Reciente**: Lista de las últimas ventas cargadas con opción de borrar si hay error.

### 3. Autenticación
- Sistema de login simple para que solo el dueño acceda a sus datos.
- Perfil con configuración de moneda (opcional).

---

## 🏛️ ARQUITECTURA TÉCNICA

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  Next.js 16 + Tailwind CSS 3.4 (Nitidez)    │
│  Zustand (Estado Global del Dashboard)      │
├─────────────────────────────────────────────┤
│                  BACKEND                     │
│  Supabase (PostgreSQL + Auth)               │
│  RLS (Seguridad de datos por usuario)       │
└─────────────────────────────────────────────┘
```

---

## 💰 BENEFICIOS
1. **Claridad Inmediata**: No más dudas sobre cuánto se ganó realmente.
2. **Ahorro de Tiempo**: Registro en segundos, no minutos.
3. **Motivación Visual**: Ver el crecimiento de las ganancias en un panel elegante aumenta el control del negocio.

---
*Documento generado por Antigravity SaaS Factory*
