# Classic Barber Studio - Administrador

MVP para reemplazar la planilla de Excel de Classic Barber Studio. Permite
anotar los cortes que se hacen, quien los hizo, y ver cuanto genero la
peluqueria y cuanto genero cada barbero.

## Funcionalidad

- **Instalable en el celular**: se puede agregar a la pantalla de inicio
  (Android/iOS) con icono propio y sin barra de direcciones.
- **Tema claro/oscuro**: sigue el tema del sistema operativo por defecto, con
  un boton (☀️/🌙) en la barra superior para forzarlo manualmente. La
  preferencia manual se guarda en el navegador de cada persona.
- **Login por PIN**: cada barbero y el administrador ingresan eligiendo su
  nombre y un PIN numerico (sin usuarios/contraseñas complejos).
- **Roles diferenciados**:
  - **Barbero**: registra sus propios cortes y puede editar/borrar solo los
    que el cargo. Ve unicamente su propio resumen de ganancias (hoy/semana/mes)
    y su propio historial, nunca el de otros barberos.
  - **Administrador**: ademas de lo anterior, ve el panel completo de la
    barberia (totales generales y ranking de ganancias por barbero), y puede
    crear/editar barberos y servicios.
- **Comision o alquiler de silla por barbero**: el admin configura, para cada
  barbero, si cobra un % de comision (ej. 50/50, 60/40) o si paga un monto
  fijo por dia trabajado (ej. $1500 de silla). El panel descuenta esto
  automaticamente y muestra cuanto le queda neto a cada barbero (y cuanto es
  la ganancia neta de la barberia) ademas del total bruto generado.
- **Registrar cortes**: barbero (fijo si sos barbero, a elegir si sos admin),
  servicio (con precio sugerido) o monto libre, cliente, fecha y metodo de
  pago.
- **Panel general**: total generado hoy / ultimos 7 dias / este mes, ranking
  de ganancias por barbero (solo admin), y ultimos cortes registrados.
- **Historial de cortes**: listado completo con filtros por barbero y rango de
  fechas. Editar/eliminar solo disponible para el dueño del corte o el admin.
- **Barberos** (solo admin): alta con nombre/telefono/PIN, edicion, y
  activar/desactivar.
- **Servicios** (solo admin): alta y edicion de nombre/precio, y
  activar/desactivar.
- **Mi cuenta**: cualquier usuario logueado puede cambiar su propio nombre y
  PIN.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions, Proxy) +
  TypeScript + Tailwind CSS.
- [Supabase](https://supabase.com) (Postgres) como base de datos.
- Autenticacion propia y liviana: PIN + `bcryptjs` para el hash, cookie de
  sesion firmada (HMAC) sin librerias externas de auth.

## Configuracion

1. Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto
   de Supabase (Project Settings → API) y un secreto de sesion propio:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SESSION_SECRET=   # generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Instala dependencias y corre el proyecto:

   ```bash
   npm install
   npm run dev
   ```

3. Abri [http://localhost:3000](http://localhost:3000).

## Base de datos

El esquema (tablas `admins`, `barbers`, `services`, `cuts`) esta pensado para
Postgres / Supabase. Las cuatro tablas tienen Row Level Security habilitado
con politicas publicas a nivel de base de datos (todo el control de acceso
real se hace en la app, con la cookie de sesion firmada y los chequeos de rol
en cada Server Action).

- `admins.pin_hash` / `barbers.pin_hash`: hash bcrypt del PIN de acceso. Un
  barbero sin `pin_hash` todavia no puede loguearse hasta que un admin le
  asigne uno desde **Barberos → Editar**.
- `barbers.compensation_type` (`percentage` o `fixed_daily`),
  `commission_percentage` y `daily_fee`: definen como se le paga a cada
  barbero. Un "dia trabajado" (para `fixed_daily`) se calcula como un dia en
  el que el barbero cargo al menos un corte; si un dia no carga nada, ese dia
  no se le cobra alquiler de silla (no hay control de asistencia aparte).

## Roles y permisos (resumen tecnico)

- La cookie de sesion (`cbs_session`) guarda `{ role, id, name }` firmada con
  `SESSION_SECRET` (HMAC-SHA256). No se puede falsificar sin conocer el
  secreto.
- `src/proxy.ts` (proxy de Next.js, antes "middleware") bloquea el acceso sin
  sesion a toda la app salvo `/login`, y bloquea `/barberos` y `/servicios` a
  quien no sea admin.
- Cada Server Action vuelve a validar el rol del lado del servidor (no confia
  solo en el proxy), siguiendo la recomendacion oficial de Next.js.

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com) (o cualquier hosting
de Next.js) configurando las mismas variables de entorno (incluido
`SESSION_SECRET`, que debe ser distinto y secreto en produccion).
