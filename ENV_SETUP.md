# Configuración de Variables de Entorno

Para que las aplicaciones funcionen correctamente, necesitas configurar las siguientes variables de entorno:

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Contraseñas para las aplicaciones
FINANCE_PASSWORD=tu_contraseña_finance_aqui
WHATSAPP_PASSWORD=tu_contraseña_whatsapp_aqui
CLICKUP_PASSWORD=tu_contraseña_clickup_aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## Configuración

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edita `.env.local`** y reemplaza las contraseñas y configuración de Supabase:
   ```bash
   FINANCE_PASSWORD=mi_contraseña_segura_finance
   WHATSAPP_PASSWORD=mi_contraseña_segura_whatsapp
   CLICKUP_PASSWORD=mi_contraseña_segura_clickup
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```

3. **Configura la base de datos en Supabase:**
   - Ve a tu proyecto en Supabase
   - Abre el SQL Editor
   - Ejecuta el contenido del archivo `supabase/schema.sql`

4. **Reinicia el servidor de desarrollo:**
   ```bash
   yarn dev
   ```

## Aplicaciones

- **Finance** (`/finance`): Usa `FINANCE_PASSWORD`
- **WhatsApp** (`/whatsapp`): Usa `WHATSAPP_PASSWORD`
- **ClickUp** (`/clickup`): Usa `CLICKUP_PASSWORD`

## Seguridad

- **Nunca** subas el archivo `.env.local` al repositorio
- Usa contraseñas seguras y únicas
- El archivo `.env.local` está en `.gitignore` por defecto

## Verificación

Una vez configurado, puedes verificar que las variables están cargadas correctamente revisando los logs del servidor o probando el login en cada aplicación:

- `/finance` - Usa `FINANCE_PASSWORD`
- `/whatsapp` - Usa `WHATSAPP_PASSWORD`
- `/clickup` - Usa `CLICKUP_PASSWORD`
