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
    console.error('BREVO_API_KEY missing - Check Vercel dashboard Environment Variables');
    return res.status(500).json({ message: 'Error de configuración del servidor. Contacta al administrador.' });
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f5f5f5; line-height: 1.6;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c6fff 0%, #38bdf8 100%); padding: 30px 25px; text-align: center;">
      <h1 style="color: white; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">📧 Nuevo mensaje de contacto</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Portafolio Yessid Cordero</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px 25px;">
      
      <!-- Datos del contacto -->
      <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #7c6fff;">
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
          <div style="flex: 1; min-width: 200px;">
            <strong style="color: #7c6fff; font-size: 15px;">👤 Nombre completo</strong><br>
            <span style="font-size: 18px; font-weight: 500;">${nombre} ${apellido}</span>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <strong style="color: #7c6fff; font-size: 15px;">📧 Email</strong><br>
            <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none; font-size: 18px; font-weight: 500;">${email}</a>
          </div>
        </div>
      </div>
      
      <!-- Mensaje -->
      <div style="background: #f8f9fa; border-radius: 10px; padding: 25px; border-left: 4px solid #38bdf8; margin-bottom: 25px;">
        <strong style="color: #333; font-size: 16px; margin-bottom: 12px; display: block;">💼 Descripción del proyecto:</strong>
        <p style="margin: 0; color: #333; font-size: 16px; white-space: pre-wrap;">${descripcion}</p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding-top: 25px; border-top: 1px solid #eee; color: #888; font-size: 13px;">
        <p style="margin: 0;">✨ Enviado desde el formulario de contacto del Portafolio Web</p>
        <p style="margin: 5px 0 0 0; opacity: 0.8;">Recibido el ${new Date().toLocaleString('es-CO')}</p>
      </div>
      
    </div>
  </div>
  
  <!-- Responsive mobile -->
  <style>
    @media only screen and (max-width: 480px) {
      body { padding: 10px !important; }
      div[style*="max-width: 600px"] { max-width: 100% !important; margin: 10px !important; }
      div[style*="padding: 30px"] { padding: 20px !important; }
      h1 { font-size: 24px !important; }
      div[style*="flex"] { flex-direction: column !important; gap: 10px !important; }
      div[style*="min-width: 200px"] { min-width: auto !important; }
      p, span { font-size: 16px !important; }
    }
  </style>
</body>
</html>
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
      console.error('Vercel BREVO API error:', result);
      return res.status(response.status).json({ message: result?.message || 'Error del proveedor de correo al enviar el mensaje.' });
    }

    return res.status(200).json({ success: true, message: 'Mensaje procesado correctamente por el servidor.' });
  } catch (error) {
    console.error('Vercel function error - Brevo connection failed:', error);
    return res.status(500).json({ message: 'Error de red en el servidor. Por favor verifica más tarde.' });
  }
}
