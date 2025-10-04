import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
    const body = await request.json();
    const { password, name, description, dueDate, priority, listId } = body;

    // Verificar contraseña
    if (!password || password !== configPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la tarea es requerido' },
        { status: 400 }
      );
    }

    // Obtener el workspace y la primera lista disponible
    const teamsResponse = await fetch('https://api.clickup.com/api/v2/team', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!teamsResponse.ok) {
      throw new Error('Error al obtener equipos');
    }

    const teamsData = await teamsResponse.json();
    const personalWorkspace = teamsData.teams[0];

    if (!personalWorkspace) {
      return NextResponse.json(
        { error: 'No se encontró workspace' },
        { status: 404 }
      );
    }

    // Obtener espacios
    const spacesResponse = await fetch(
      `https://api.clickup.com/api/v2/team/${personalWorkspace.id}/space?archived=false`,
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!spacesResponse.ok) {
      throw new Error('Error al obtener espacios');
    }

    const spacesData = await spacesResponse.json();
    const firstSpace = spacesData.spaces[0];

    if (!firstSpace) {
      return NextResponse.json(
        { error: 'No se encontró espacio' },
        { status: 404 }
      );
    }

    // Obtener listas del espacio
    const listsResponse = await fetch(
      `https://api.clickup.com/api/v2/space/${firstSpace.id}/list?archived=false`,
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!listsResponse.ok) {
      throw new Error('Error al obtener listas');
    }

    const listsData = await listsResponse.json();
    const firstList = listsData.lists[0];

    if (!firstList) {
      return NextResponse.json(
        { error: 'No se encontró lista' },
        { status: 404 }
      );
    }

    // Crear la tarea
    const taskData: any = {
      name,
      description: description || '',
      status: 'to do',
    };

    // Agregar fecha si existe
    if (dueDate) {
      const date = new Date(dueDate);
      const argentinaTime = new Date(date.getTime() + (3 * 3600000)); // Sumar 3 horas para GMT-3
      taskData.due_date = argentinaTime.getTime();
    }

    // Agregar prioridad si existe
    if (priority) {
      // Convertir string de prioridad a número para ClickUp
      const priorityMap: Record<string, number> = {
        'urgent': 1,
        'high': 2,
        'normal': 3,
        'low': 4
      };
      
      // Si es un string, convertir a número; si ya es número, usar directamente
      const priorityValue = typeof priority === 'string' ? priorityMap[priority] : priority;
      taskData.priority = priorityValue;
    }

    // Usar la lista seleccionada o la primera disponible
    const targetListId = listId || firstList.id;

    const createTaskResponse = await fetch(
      `https://api.clickup.com/api/v2/list/${targetListId}/task`,
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      }
    );

    if (!createTaskResponse.ok) {
      const errorData = await createTaskResponse.json();
      throw new Error(errorData.err || 'Error al crear tarea');
    }

    const newTask = await createTaskResponse.json();

    return NextResponse.json({
      success: true,
      task: newTask,
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear tarea en ClickUp' },
      { status: 500 }
    );
  }
}
