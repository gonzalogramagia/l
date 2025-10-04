import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Verificar contraseña (puedes cambiar esta lógica)
    const correctPassword = process.env.GOOGLE_SHEETS_PASSWORD || 'finanzas2025';
    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Configurar Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Crear cliente de Sheets
    const sheets = google.sheets({ version: 'v4', auth });

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

      // Obtener datos de la primera hoja
      const firstSheet = response.data.sheets?.[0];
      const sheetName = firstSheet?.properties?.title || 'Hoja 1';

      const dataResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:Z1000`, // Ajustar rango según necesites
      });

      return NextResponse.json({
        success: true,
        sheetTitle: response.data.properties?.title,
        sheetData: dataResponse.data.values || [],
        sheetName: sheetName
      });
    } catch (error: any) {
      console.error('Error accediendo a la hoja:', error);
      if (error.code === 403) {
        return NextResponse.json({ 
          error: 'No tienes permisos para acceder a esta hoja de cálculo. Verifica que el Service Account tenga acceso.' 
        }, { status: 403 });
      }
      if (error.code === 404) {
        return NextResponse.json({ 
          error: 'Hoja de cálculo no encontrada. Verifica el ID de la hoja.' 
        }, { status: 404 });
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Error en autenticación Service Account:', error);
    return NextResponse.json({ 
      error: 'Error al acceder a Google Sheets' 
    }, { status: 500 });
  }
}
