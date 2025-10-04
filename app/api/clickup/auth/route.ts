import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Contraseña requerida' },
        { status: 400 }
      );
    }

    const expectedPassword = process.env.CLICKUP_PASSWORD;
    
    if (!expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Configuración de contraseña no encontrada' },
        { status: 500 }
      );
    }

    if (password === expectedPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
