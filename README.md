# EMDoryoku — Landing Page

Landing page de una sola página (HTML5 + Tailwind CSS vía CDN) para distribuir el APK de **EMDoryoku**.
No requiere build ni dependencias: es un único `index.html`.

## Estructura

```
index.html                       ← toda la landing (HTML + estilos + JS)
releases/
  README.md                      ← instrucciones para el APK
  EMDoryoku-latest.apk           ← (tú lo añades) instalador real
```

## Ver el sitio en local

El enlace de descarga apunta a `/releases/EMDoryoku-latest.apk` (ruta absoluta desde la raíz),
así que conviene servir la carpeta con un servidor estático desde su raíz.

Con Python (desde WSL o Windows):

```bash
python3 -m http.server 8080
```

Con Node:

```bash
npx serve .
```

Abre <http://localhost:8080>.

> Si abres `index.html` con doble clic (`file://`), todo se ve igual, pero la descarga no encontrará el APK
> porque `/releases/...` se resolvería en la raíz del disco.

## Antes de publicar

1. Copia el APK real en `releases/EMDoryoku-latest.apk`.
2. Calcula su SHA-256 y pégalo en `index.html` (elemento `#sha-value`). Ver `releases/README.md`.
3. Ajusta el tamaño (`~35 MB`) si cambia.
4. Sustituye `https://github.com/` por la URL real del repositorio (footer y diálogo de demo).
5. Sustituye el bloque de la demo (`#dlg-demo`) por tu `<video>` o `<iframe>`.
6. Revisa con asesoría legal los textos provisionales de Términos y Privacidad.
7. Para producción, considera compilar Tailwind (CLI) en lugar del CDN `cdn.tailwindcss.com`.

## Stack

- Tailwind CSS (CDN) con paleta propia: `carbon #0E1116`, `asphalt #161B22`, `neon #00E676`, `crimson #FF1744`, `fire #FFB300`.
- Tipografías: Syne (títulos), Inter (texto), Roboto Mono (métricas).
- JS vanilla: menú móvil, acordeón FAQ accesible, diálogos nativos `<dialog>`, copiar hash y animación del mockup.
