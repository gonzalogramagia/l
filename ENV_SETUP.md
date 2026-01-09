# Configuración de Variables de Entorno

Para que las aplicaciones funcionen correctamente, necesitas configurar las siguientes variables de entorno:

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Contraseñas para las aplicaciones

CLICKUP_PASSWORD=tu_contraseña_clickup_aqui
```

## Configuración

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edita `.env.local`** y reemplaza las contraseñas:
   ```bash

   CLICKUP_PASSWORD=mi_contraseña_segura_clickup
   ```

3. **Reinicia el servidor de desarrollo:**
   ```bash
   yarn dev
   ```

## Aplicaciones


- **ClickUp** (`/clickup`): Usa `CLICKUP_PASSWORD`

## Seguridad

- **Nunca** subas el archivo `.env.local` al repositorio
- Usa contraseñas seguras y únicas
- El archivo `.env.local` está en `.gitignore` por defecto

## Verificación

Una vez configurado, puedes verificar que las variables están cargadas correctamente probando el login en cada aplicación:


- `/clickup` - Usa `CLICKUP_PASSWORD`
