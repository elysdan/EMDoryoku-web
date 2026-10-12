# Carpeta de releases

Coloca aquí el instalador de la app con el nombre exacto:

```
EMDoryoku-latest.apk
```

La landing page lo enlaza como `/releases/EMDoryoku-latest.apk` (con el atributo `download`, que lo guarda como `EMDoryoku-v1.0.apk`).

Para calcular el hash SHA-256 que se muestra en la sección de descarga (PowerShell):

```powershell
Get-FileHash .\releases\EMDoryoku-latest.apk -Algorithm SHA256
```

En Linux / WSL:

```bash
sha256sum releases/EMDoryoku-latest.apk
```

Después reemplaza el valor del atributo `data-sha256` y el texto dentro de `#sha-value` en `index.html`.
