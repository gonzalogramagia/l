import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código de autorización requerido' }, { status: 400 });
    }

    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Crear cliente de Sheets
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Verificar acceso a la hoja privada
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (!sheetId) {
      return NextResponse.json({ error: 'ID de hoja no configurado' }, { status: 500 });
    }

    try {
      // Intentar leer la hoja para verificar permisos
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        fields: 'properties.title,sheets.properties'
      });

      return NextResponse.json({
        success: true,
        sheetTitle: response.data.properties?.title,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      });
    } catch (error: any) {
      if (error.code === 403) {
        return NextResponse.json({ 
          error: 'No tienes permisos para acceder a esta hoja de cálculo' 
        }, { status: 403 });
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Error en autenticación Google Sheets:', error);
    return NextResponse.json({ 
      error: 'Error al autenticar con Google Sheets' 
    }, { status: 500 });
  }
}

export async function GET() {
  // Generar URL de autorización
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    prompt: 'consent'
  });

  return NextResponse.json({ authUrl });
}
