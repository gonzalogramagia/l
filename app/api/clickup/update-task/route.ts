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
    const { password, taskId, name, description, dueDate, priority, status, listId } = await request.json();

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

    // Solo incluir campos que realmente han cambiado
    if (name !== undefined && name.trim() !== '') updatePayload.name = name;
    if (description !== undefined && description.trim() !== '') updatePayload.description = description;
    
    if (dueDate !== undefined) {
      if (dueDate) {
        // Convertir fecha a timestamp en milisegundos, ajustando a GMT-3 (Argentina)
        const date = new Date(dueDate);
        const argentinaTime = new Date(date.getTime() + (3 * 3600000)); // Sumar 3 horas para GMT-3
        updatePayload.due_date = argentinaTime.getTime();
      } else {
        updatePayload.due_date = null;
      }
    }
    
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) updatePayload.status = status;
    
    // Nota: El cambio de lista está deshabilitado debido a limitaciones del plan de ClickUp
    // Solo se pueden actualizar otros campos de la tarea

    // Si no hay nada que actualizar, devolver éxito sin hacer llamada
    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay cambios para actualizar',
        task: null
      });
    }

    // Hacer la llamada real a la API de ClickUp para actualizar otros campos
    const clickupResponse = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (!clickupResponse.ok) {
      let errorData;
      try {
        errorData = await clickupResponse.json();
      } catch (e) {
        // Si no es JSON válido, obtener el texto de la respuesta
        const responseText = await clickupResponse.text();
        console.error('ClickUp API returned non-JSON response:', responseText);
        return NextResponse.json(
          { error: `Error al actualizar tarea en ClickUp: ${responseText}` },
          { status: clickupResponse.status }
        );
      }
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
