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

  // Verificar la contraseña del request
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== configPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Contraseña requerida' },
      { status: 401 }
    );
  }

  try {
    // Primero, obtener el usuario autenticado
    const userResponse = await fetch('https://api.clickup.com/api/v2/user', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Error al obtener información del usuario');
    }

    const userData = await userResponse.json();

    // Obtener los equipos (workspaces)
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
    
    // Buscar el workspace personal (generalmente el primero o el que tiene el nombre del usuario)
    const personalWorkspace = teamsData.teams[0];

    if (!personalWorkspace) {
      return NextResponse.json(
        { error: 'No se encontró workspace personal' },
        { status: 404 }
      );
    }

    // Obtener los espacios del workspace
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

    // Obtener todas las tareas de todos los espacios
    const allTasks: any[] = [];
    const allStatuses: Set<string> = new Set();
    const allLists: any[] = [];

    // Obtener estados del workspace completo
    try {
      const workspaceResponse = await fetch(
        `https://api.clickup.com/api/v2/team/${personalWorkspace.id}`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (workspaceResponse.ok) {
        const workspaceData = await workspaceResponse.json();
        if (workspaceData.team && workspaceData.team.statuses) {
          workspaceData.team.statuses.forEach((status: any) => {
            allStatuses.add(status.status);
          });
        }
      }
    } catch (error) {
      console.error('Error obteniendo estados del workspace:', error);
    }

    for (const space of spacesData.spaces) {
      // Obtener listas del espacio
      const foldersResponse = await fetch(
        `https://api.clickup.com/api/v2/space/${space.id}/folder?archived=false`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const foldersData = await foldersResponse.json();

      // Obtener listas sin carpeta
      const listsResponse = await fetch(
        `https://api.clickup.com/api/v2/space/${space.id}/list?archived=false`,
        {
          headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const listsData = await listsResponse.json();

      // Obtener tareas de listas sin carpeta
      for (const list of listsData.lists || []) {
        // Agregar lista a la colección
        allLists.push({
          id: list.id,
          name: list.name,
          folder_id: null,
          space_id: space.id,
          space_name: space.name
        });
        // Obtener estados de la lista
        const listResponse = await fetch(
          `https://api.clickup.com/api/v2/list/${list.id}`,
          {
            headers: {
              'Authorization': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

        if (listResponse.ok) {
          const listData = await listResponse.json();
          if (listData.statuses) {
            listData.statuses.forEach((status: any) => {
              allStatuses.add(status.status);
            });
          }
        }

        const tasksResponse = await fetch(
          `https://api.clickup.com/api/v2/list/${list.id}/task?archived=false`,
          {
            headers: {
              'Authorization': apiKey,
              'Content-Type': 'application/json',
            },
          }
        );

          const tasksData = await tasksResponse.json();
          // Agregar list_id a cada tarea
          const tasksWithListId = (tasksData.tasks || []).map((task: any) => ({
            ...task,
            list_id: list.id
          }));
          allTasks.push(...tasksWithListId);
      }

      // Obtener tareas de listas en carpetas
      for (const folder of foldersData.folders || []) {
        for (const list of folder.lists || []) {
          // Agregar lista a la colección
          allLists.push({
            id: list.id,
            name: list.name,
            folder_id: folder.id,
            folder_name: folder.name,
            space_id: space.id,
            space_name: space.name
          });
          // Obtener estados de la lista
          const listResponse = await fetch(
            `https://api.clickup.com/api/v2/list/${list.id}`,
            {
              headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
              },
            }
          );

          if (listResponse.ok) {
            const listData = await listResponse.json();
            if (listData.statuses) {
              listData.statuses.forEach((status: any) => {
                allStatuses.add(status.status);
              });
            }
          }

          const tasksResponse = await fetch(
            `https://api.clickup.com/api/v2/list/${list.id}/task?archived=false`,
            {
              headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
              },
            }
          );

          const tasksData = await tasksResponse.json();
          // Agregar list_id a cada tarea
          const tasksWithListId = (tasksData.tasks || []).map((task: any) => ({
            ...task,
            list_id: list.id
          }));
          allTasks.push(...tasksWithListId);
        }
      }
    }

    
    return NextResponse.json({
      user: userData.user,
      workspace: personalWorkspace,
      tasks: allTasks,
      availableStatuses: Array.from(allStatuses),
      availableLists: allLists,
    });
  } catch (error) {
    console.error('Error al obtener tareas de ClickUp:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas de ClickUp' },
      { status: 500 }
    );
  }
}
