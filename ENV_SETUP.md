# Configuración de Variables de Entorno

Para que las aplicaciones funcionen correctamente, necesitas configurar las siguientes variables de entorno:

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# Contraseñas para las aplicaciones
FINANCE_PASSWORD=tu_contraseña_finance_aqui
WHATSAPP_PASSWORD=tu_contraseña_whatsapp_aqui
CLICKUP_PASSWORD=tu_contraseña_clickup_aqui
NOTION_PASSWORD=tu_contraseña_notion_aqui

# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# Notion
NOTION_TOKEN=tu_token_de_notion_aqui
NOTION_PAGE_ID=tu_page_id_de_notion_aqui
```

## Configuración

1. **Copia el archivo de ejemplo:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edita `.env.local`** y reemplaza las contraseñas y configuración:
   ```bash
   FINANCE_PASSWORD=mi_contraseña_segura_finance
   WHATSAPP_PASSWORD=mi_contraseña_segura_whatsapp
   CLICKUP_PASSWORD=mi_contraseña_segura_clickup
   NOTION_PASSWORD=mi_contraseña_segura_notion
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   NOTION_TOKEN=secret_tu_token_de_notion
   NOTION_PAGE_ID=tu_page_id_de_notion
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
- **Notion** (`/notion`): Usa `NOTION_PASSWORD`, `NOTION_TOKEN` y `NOTION_PAGE_ID`

## Seguridad

- **Nunca** subas el archivo `.env.local` al repositorio
- Usa contraseñas seguras y únicas
- El archivo `.env.local` está en `.gitignore` por defecto

## Configuración de Notion

Para obtener tu token y page ID de Notion:

1. **Crear una integración en Notion:**
   - Ve a https://www.notion.so/my-integrations
   - Haz clic en "New integration"
   - Dale un nombre y selecciona el workspace
   - Copia el "Internal Integration Token" (este es tu `NOTION_TOKEN`)

2. **Obtener el Page ID:**
   - Abre la página de Notion que quieres editar
   - Copia el ID de la URL. Por ejemplo, en:
     `https://www.notion.so/Mi-Pagina-123abc456def789`
   - El Page ID es: `123abc456def789`

3. **Compartir la página con tu integración:**
   - Abre la página en Notion
   - Haz clic en "Share" (Compartir)
   - Invita a tu integración por nombre
   - Dale permisos de edición

## Verificación

Una vez configurado, puedes verificar que las variables están cargadas correctamente revisando los logs del servidor o probando el login en cada aplicación:

- `/finance` - Usa `FINANCE_PASSWORD`
- `/whatsapp` - Usa `WHATSAPP_PASSWORD`
- `/clickup` - Usa `CLICKUP_PASSWORD`
- `/notion` - Usa `NOTION_PASSWORD`, `NOTION_TOKEN` y `NOTION_PAGE_ID`
