import { NextRequest, NextResponse } from 'next/server';
import { NotionService } from '../../../../lib/services/notion';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Iniciando request para obtener página');
    
    const pageId = process.env.NOTION_PAGE_ID;
    console.log('📋 Page ID desde env:', pageId ? `${pageId.substring(0, 8)}...` : 'NO CONFIGURADO');

    if (!pageId) {
      console.error('❌ NOTION_PAGE_ID no está configurado');
      return NextResponse.json(
        { error: 'NOTION_PAGE_ID no está configurado' },
        { status: 500 }
      );
    }

    console.log('🚀 Llamando a NotionService.getPage...');
    const page = await NotionService.getPage(pageId);
    console.log('✅ Página obtenida exitosamente');
    
    return NextResponse.json(page);
  } catch (error: any) {
    console.error('❌ Error en API fetching page:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || 'Error al obtener la página' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, blockId, content, type } = await request.json();
    const pageId = process.env.NOTION_PAGE_ID;

    if (!pageId) {
      return NextResponse.json(
        { error: 'NOTION_PAGE_ID no está configurado' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'update':
        await NotionService.updateBlock(blockId, content);
        break;
      case 'append':
        await NotionService.appendBlock(pageId, content, type);
        break;
      case 'delete':
        await NotionService.deleteBlock(blockId);
        break;
      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar la página' },
      { status: 500 }
    );
  }
}
