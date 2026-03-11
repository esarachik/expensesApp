npm install -g expo-cli
npx create-expo-app compras-voz
cd compras-voz
npx expo start

Editá src/db/schema.ts
Corré npx drizzle-kit generate
La migración se aplica automáticamente al iniciar la app

-Agregar cambio de base de datos
Edita src/db/schema.ts
Ejecuta npm run db:generate
La migración se aplica automáticamente la próxima vez que la app inicie

package.json — Nuevos scripts:
npm run db:generate — genera una nueva migración cuando cambies el schema
npm run db:studio — abre Drizzle Studio para inspeccionar los datos