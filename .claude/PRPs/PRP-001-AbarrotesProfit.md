# PRP-001: Abarrotes Profit - Control de Ventas y Ganancias

## Goal Description
Crear una aplicación minimalista y de alto impacto visual para el control de ventas diarias y el cálculo automático de una ganancia del 20%. El objetivo es proporcionar al dueño de un negocio de abarrotes una herramienta "nítida" para monitorear su rentabilidad diaria y mensual.

## Proposed Changes

### Database (Supabase)
- **[NEW]** Migración de tabla `sales`:
  - `id`: uuid (PK)
  - `amount`: decimal (Monto de venta)
  - `profit`: decimal (Ganancia calculada del 20%)
  - `sale_date`: date (Fecha de la venta)
  - `user_id`: uuid (Referencia a auth.users)
- **RLS Policy**: Permitir lectura/escritura solo al propietario de los datos.

### Business Logic
- Implementar el cálculo `profit = amount * 0.20` en el frontend (antes de enviar) o vía trigger en Supabase (preferido para consistencia).

### UI/UX (SaaS Factory V3 Standards)
- **Dashboard Feature**:
  - Widgets de alto contraste para métricas diarias y mensuales.
  - Gráfico de barras simple (Venta diaria última semana).
  - Lista de transacciones recientes.
- **Sales Feature**:
  - Formulario Modal o página simple para ingreso de ventas.
  - Validación con Zod para asegurar montos numéricos positivos.

## Verification Plan

### Automated Tests
- `npm run typecheck` para asegurar integridad de tipos.
- Test Playwright: Navegar al dashboard, abrir formulario de venta, ingresar "100", verificar que la ganancia calculada sea "20" y aparezca en el dashboard.

### Manual Verification
1. Hacer login con una cuenta de prueba.
2. Registrar una venta de $1000.
3. Verificar que el dashboard muestre $1000 en ventas y $200 en ganancias.
4. Cambiar la fecha a un día del mes pasado y verificar que no altere los totales del mes actual.
