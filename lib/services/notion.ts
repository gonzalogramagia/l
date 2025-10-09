import { Client } from '@notionhq/client';

export interface NotionPage {
  id: string;
  title: string;
  content: any[];
  lastEdited: string;
}

export class NotionService {
  private static getClient() {
    const notionToken = process.env.NOTION_TOKEN;
    
    if (!notionToken) {
      throw new Error('NOTION_TOKEN no está configurado en las variables de entorno');
    }

    return new Client({ auth: notionToken });
  }

  static async getPage(pageId: string): Promise<NotionPage> {
    try {
      console.log('🔍 Intentando obtener página con ID:', pageId);
      
      const notion = this.getClient();
      console.log('✅ Cliente de Notion inicializado correctamente');

      // Obtener metadata de la página
      console.log('📄 Obteniendo metadata de la página...');
      const page = await notion.pages.retrieve({ page_id: pageId });
      console.log('✅ Metadata obtenida:', page);

      // Obtener el contenido de la página (bloques)
      console.log('🧱 Obteniendo bloques de la página...');
      const blocks = await notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
      });
      console.log('✅ Bloques obtenidos:', blocks.results.length, 'bloques');

      // Extraer el título
      let title = 'Sin título';
      if ('properties' in page && page.properties.title) {
        const titleProp = page.properties.title;
        if (titleProp.type === 'title' && titleProp.title.length > 0) {
          title = titleProp.title[0].plain_text;
        }
      }
      console.log('📝 Título extraído:', title);

      return {
        id: page.id,
        title,
        content: blocks.results,
        lastEdited: 'last_edited_time' in page ? page.last_edited_time : new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('❌ Error detallado al obtener página de Notion:', {
        message: error.message,
        status: error.status,
        code: error.code,
        pageId: pageId
      });
      throw new Error(`Error al obtener la página de Notion: ${error.message}`);
    }
  }

  static async updateBlock(blockId: string, content: string): Promise<void> {
    try {
      const notion = this.getClient();

      await notion.blocks.update({
        block_id: blockId,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      } as any);
    } catch (error) {
      console.error('Error updating Notion block:', error);
      throw new Error('Error al actualizar el bloque de Notion');
    }
  }

  static async appendBlock(pageId: string, content: string, type: 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' = 'paragraph'): Promise<void> {
    try {
      const notion = this.getClient();

      const blockData: any = {
        rich_text: [
          {
            type: 'text',
            text: {
              content: content,
            },
          },
        ],
      };

      await notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            object: 'block',
            type: type,
            [type]: blockData,
          } as any,
        ],
      });
    } catch (error) {
      console.error('Error appending Notion block:', error);
      throw new Error('Error al agregar bloque a Notion');
    }
  }

  static async deleteBlock(blockId: string): Promise<void> {
    try {
      const notion = this.getClient();

      await notion.blocks.delete({
        block_id: blockId,
      });
    } catch (error) {
      console.error('Error deleting Notion block:', error);
      throw new Error('Error al eliminar el bloque de Notion');
    }
  }

  static renderBlockToText(block: any): string {
    if (!block.type) return '';

    const type = block.type;
    const content = block[type];

    if (!content || !content.rich_text) return '';

    return content.rich_text.map((text: any) => text.plain_text).join('');
  }
}
