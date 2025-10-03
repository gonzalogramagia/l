import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.CLICKUP_API_KEY;
  const configPassword = process.env.CLICKUP_PASSWORD;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'CLICKUP_API_KEY no configurada' },
      { status: 500 }
    );
  }

  if (!configPassword) {
    return NextResponse.json(
      { error: 'CLICKUP_PASSWORD no configurada' },
      { status: 500 }
    );
  }

  try {
    const { password, taskId, name, description, dueDate, priority, status } = await request.json();

    if (!password || !taskId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: password y taskId son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar la contraseña del request
    if (password !== configPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    // Preparar el payload para la actualización
    const updatePayload: any = {};

    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (dueDate !== undefined) {
      if (dueDate) {
        // Convertir fecha a timestamp en milisegundos
        updatePayload.due_date = new Date(dueDate).getTime();
      } else {
        updatePayload.due_date = null;
      }
    }
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) updatePayload.status = status;

    // Hacer la llamada real a la API de ClickUp
    const clickupResponse = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!clickupResponse.ok) {
      const errorData = await clickupResponse.json();
      console.error('Error from ClickUp API:', errorData);
      return NextResponse.json(
        { error: `Error al actualizar tarea en ClickUp: ${errorData.err || 'Error desconocido'}` },
        { status: clickupResponse.status }
      );
    }

    const updatedTask = await clickupResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Tarea actualizada correctamente en ClickUp',
      task: updatedTask
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
