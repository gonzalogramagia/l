import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { taskId, password } = await request.json();

    if (!taskId || !password) {
      return NextResponse.json(
        { error: 'Task ID y password son requeridos' },
        { status: 400 }
      );
    }

    if (password !== process.env.CLICKUP_PASSWORD) {
      return NextResponse.json(
        { error: 'Password incorrecto' },
        { status: 401 }
      );
    }

    const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
    if (!CLICKUP_API_KEY) {
      return NextResponse.json(
        { error: 'ClickUp API key no configurada' },
        { status: 500 }
      );
    }

    // Eliminar la tarea en ClickUp
    const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': CLICKUP_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error eliminando tarea en ClickUp:', errorData);
      return NextResponse.json(
        { error: `Error eliminando tarea: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tarea eliminada correctamente',
      taskId: taskId
    });

  } catch (error) {
    console.error('Error en delete-task API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
