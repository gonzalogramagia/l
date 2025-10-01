import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { subject, message } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Asunto y mensaje son requeridos' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Cambiar cuando tengas dominio verificado
      to: 'gonzalogramagia@gmail.com',
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nuevo mensaje desde tu web</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            Enviado desde ${new Date().toLocaleString('es-AR')}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Error de Resend:', error)
      return NextResponse.json(
        { error: 'Error al enviar el email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error en la API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

