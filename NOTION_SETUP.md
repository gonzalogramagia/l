# Configuración de Notion

Esta guía te ayudará a configurar la integración con Notion para poder ver y editar páginas desde `/notion`.

## Paso 1: Crear una Integración en Notion

1. Ve a https://www.notion.so/my-integrations
2. Haz clic en **"+ New integration"**
3. Completa los siguientes campos:
   - **Name**: Dale un nombre (ej: "Mi Blog Integration")
   - **Associated workspace**: Selecciona tu workspace
   - **Type**: Deja "Internal integration"
4. Haz clic en **"Submit"**
5. **Copia el "Internal Integration Token"** - Este será tu `NOTION_TOKEN`

## Paso 2: Obtener el Page ID

1. Abre la página de Notion que quieres editar en tu navegador
2. Copia la URL de la página. Se verá algo así:
   ```
   https://www.notion.so/Mi-Pagina-123abc456def789ghi
   ```
3. El **Page ID** es la parte después del último guión. En este ejemplo: `123abc456def789ghi`
   - Si la URL tiene guiones en el nombre, el Page ID es todo lo que viene después del último guión antes de cualquier `?` o `#`
   - Ejemplo completo: `https://www.notion.so/workspace/Titulo-de-Pagina-abc123def456` → Page ID: `abc123def456`

## Paso 3: Compartir la Página con tu Integración

1. Abre la página en Notion
2. Haz clic en **"Share"** (Compartir) en la esquina superior derecha
3. En el campo de búsqueda, escribe el nombre de tu integración
4. Selecciona tu integración de la lista
5. Asegúrate de que tenga permisos de **"Can edit"** (Puede editar)

## Paso 4: Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# Notion
NOTION_PASSWORD=tu_contraseña_para_acceder_a_la_interfaz
NOTION_TOKEN=secret_tu_token_de_integracion_aqui
NOTION_PAGE_ID=tu_page_id_aqui
```

Ejemplo:
```bash
NOTION_PASSWORD=miContraseñaSegura123
NOTION_TOKEN=secret_ntn_123abc456def789ghi
NOTION_PAGE_ID=abc123def456789ghi
```

## Paso 5: Reiniciar el Servidor

```bash
yarn dev
```

## Uso

1. Ve a http://localhost:3000/notion
2. Ingresa tu contraseña (`NOTION_PASSWORD`)
3. Verás el contenido de tu página de Notion
4. Puedes:
   - **Editar bloques**: Haz clic en el ícono de lápiz
   - **Eliminar bloques**: Haz clic en el ícono de basura
   - **Agregar nuevos bloques**: Usa el formulario al final de la página
   - **Recargar**: Haz clic en "Recargar Página" para ver los cambios más recientes

## Tipos de Bloques Soportados

- **Párrafo**: Texto normal
- **Título 1**: Encabezado principal
- **Título 2**: Encabezado secundario
- **Título 3**: Encabezado terciario

## Solución de Problemas

### Error: "NOTION_TOKEN no está configurado"
- Verifica que hayas agregado `NOTION_TOKEN` a tu `.env.local`
- Asegúrate de que el token comience con `secret_`
- Reinicia el servidor después de agregar la variable

### Error: "Could not find page"
- Verifica que el `NOTION_PAGE_ID` sea correcto
- Asegúrate de haber compartido la página con tu integración
- Verifica que la integración tenga permisos de edición

### Error: "Unauthorized"
- Verifica que tu integración tenga acceso a la página
- Ve a la página en Notion → Share → Verifica que tu integración esté en la lista
- Asegúrate de que tenga permisos de "Can edit"

### Los cambios no se reflejan
- Haz clic en "Recargar Página" para ver los cambios más recientes
- Verifica en Notion que los cambios se hayan guardado correctamente
- Revisa la consola del navegador para ver si hay errores

## Limitaciones

- Solo se puede editar una página a la vez (la configurada en `NOTION_PAGE_ID`)
- Los bloques complejos (bases de datos, embeds, etc.) se mostrarán pero no se podrán editar
- Las imágenes y archivos adjuntos no se muestran en la interfaz

## Seguridad

- **Nunca** compartas tu `NOTION_TOKEN`
- **Nunca** subas el archivo `.env.local` al repositorio
- El token da acceso a todas las páginas compartidas con la integración
- Usa una contraseña segura para `NOTION_PASSWORD`
