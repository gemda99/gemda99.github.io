# Rifa Pro-Fondos · Liga del Rock Academy

Control y transparencia de la rifa, conectado en tiempo real a una planilla de Google.

| Dirección | Para qué sirve | Quién la usa |
|---|---|---|
| `/` (index.html) | Página pública: estado de los números y gastos | Compradores y comunidad |
| `/panel/` | Panel de control: registrar ventas, pagos y gastos | Solo encargados |

## Importante: seguridad
- **Nunca escribas la URL de Apps Script ni la clave dentro de estos archivos.** El panel las guarda en el navegador de cada encargado (Ajustes) y nunca quedan en el código.
- Los encargados no necesitan cuenta de GitHub: solo abrir el enlace del panel y usar el *enlace de acceso* que entrega la persona administradora.
- No subas `backend_rifa.gs` a este repositorio: contiene la clave.

## Actualizar el sitio
1. Edita el archivo en tu computador (VS Code).
2. En GitHub: **Add file → Upload files**, arrastra el archivo y pulsa **Commit changes**.
3. En 1 o 2 minutos el sitio se actualiza.
