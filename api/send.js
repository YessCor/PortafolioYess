export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido. Solo se acepta POST.' });
  }

  const { nombre, apellido, email, descripcion } = req.body;

  if (!nombre || !apellido || !email || !descripcion) {
    return res.status(400).json({ message: 'Por favor completa todos los campos del formulario.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Por favor ingresa un correo electrónico válido.' });
  }

  // La API Key ahora vendrá desde Vercel
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error('BREVO_API_KEY no está configurada en las variables de entorno de Vercel');
    return res.status(500).json({ message: 'Error de configuración del servidor. Contacta al administrador.' });
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #7c6fff, #38bdf8); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo mensaje de contacto</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Portafolio Yessid Cordero</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
              <strong style="color: #7c6fff;">👤 Nombre completo:</strong>
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-size: 16px;">
              ${nombre} ${apellido}
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
              <strong style="color: #7c6fff;">📧 Email:</strong>
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
              <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
              <strong style="color: #7c6fff;">💼 Descripción del trabajo:</strong>
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #eee;"></td>
          </tr>
        </table>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #7c6fff;">
          <p style="margin: 0; line-height: 1.6; color: #333;">${descripcion}</p>
        </div>
        
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            Enviado desde el formulario de contacto del Portafolio Web
          </p>
        </div>
      </div>
    </div>
  `;

  const payload = {
    sender: {
      name: "Formulario Web",
      email: "yesidcordero1@gmail.com"
    },
    to: [
      {
        email: "yesidcordero1@gmail.com",
        name: "Yessid Cordero"
      }
    ],
    subject: `Nuevo contacto de ${nombre} ${apellido} - Portafolio`,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const bodyText = await response.text();
    let result;
    try {
      result = JSON.parse(bodyText);
    } catch(e) {
      result = bodyText;
    }

    if (!response.ok) {
      console.error('Error de Brevo al enviar:', result);
      return res.status(response.status).json({ message: result?.message || 'Error del proveedor de correo al enviar el mensaje.' });
    }

    return res.status(200).json({ success: true, message: 'Mensaje procesado correctamente por el servidor.' });
  } catch (error) {
    console.error('Error de fetch para conectar con Brevo:', error);
    return res.status(500).json({ message: 'Error de red en el servidor. Por favor verifica más tarde.' });
  }
}
