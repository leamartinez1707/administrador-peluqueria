# Administrador de Peluqueria

MVP para reemplazar la planilla de Excel de la peluqueria. Permite anotar los
cortes que se hacen, quien los hizo, y ver cuanto genero la peluqueria y cuanto
genero cada barbero.

## Funcionalidad

- **Registrar cortes**: barbero, servicio (con precio sugerido) o monto libre,
  cliente, fecha y metodo de pago.
- **Panel general**: total generado hoy / ultimos 7 dias / este mes, ranking
  de ganancias por barbero, y ultimos cortes registrados.
- **Historial de cortes**: listado completo con filtros por barbero y rango de
  fechas, y opcion de eliminar un registro cargado por error.
- **Barberos**: alta y baja (activar/desactivar) de barberos.
- **Servicios**: alta y baja de servicios con precio de referencia (se puede
  sobreescribir el monto al cargar un corte).

No tiene login: es una sola pantalla compartida, pensada para usarse desde el
celular o la compu del local, igual que se usaba el Excel.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions) + TypeScript +
  Tailwind CSS.
- [Supabase](https://supabase.com) (Postgres) como base de datos.

## Configuracion

1. Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto
   de Supabase (Project Settings → API):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

2. Instala dependencias y corre el proyecto:

   ```bash
   npm install
   npm run dev
   ```

3. Abri [http://localhost:3000](http://localhost:3000).

## Base de datos

El esquema (tablas `barbers`, `services`, `cuts`) esta pensado para Postgres /
Supabase. Las tres tablas tienen Row Level Security habilitado con politicas
publicas (lectura y escritura abiertas), ya que el MVP no tiene login. Si en
el futuro se agrega autenticacion por barbero, hay que reemplazar esas
politicas por unas que validen el usuario autenticado.

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com) (o cualquier hosting
de Next.js) configurando las mismas variables de entorno de Supabase.
