/**
 * API para enviar correos a través de Brevo (Sendinblue)
 * 
 * El formulario envía los siguientes datos:
 * - nombre: Nombre del cliente
 * - apellido: Apellido del cliente
 * - email: Correo electrónico del cliente
 * - descripcion: Descripción del trabajo/proyecto
 * 
 * El correo se envía a: yesidcordero1@gmail.com
 */

/**
 * Envía un correo usando la API de Brevo
 * @param {Object} datos - Datos del formulario
 * @param {string} datos.nombre - Nombre del cliente
 * @param {string} datos.apellido - Apellido del cliente
 * @param {string} datos.email - Emaildelcliente
 * @param {string} datos.descripcion - Descripción del trabajo
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendEmail(datos) {
  const { nombre, apellido, email, descripcion } = datos;

  // Validar datos requeridos
  if (!nombre || !apellido || !email || !descripcion) {
    return {
      success: false,
      message: 'Por favor completa todos los campos del formulario.'
    };
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Por favor ingresa un correo electrónico válido.'
    };
  }

  try {
    // Obtener la API Key desde las variables globales (definida en el HTML)
    const apiKey = window.BREVO_API_KEY;

    if (!apiKey) {
      console.error('API Key de Brevo no configurada');
      return {
        success: false,
        message: 'Error de configuración. Contacta al administrador.'
      };
    }

    // Construir el contenido del correo
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
              Enviado desde <a href="https://yessidcordero.dev" style="color: #7c6fff;">yessidcordero.dev</a>
            </p>
          </div>
        </div>
      </div>
    `;

// Datos para la API de Brevo
    // IMPORTANTE: El remitente DEBE ser un email verificado en tu cuenta de Brevo
    const payload = {
      sender: {
        name: "Portafolio Web",
        email: "yesidcordero1@gmail.com"
      },
      to: [
        {
          email: "yesidcordero1@gmail.com",
          name: "Yessid Cordero"
        }
      ],
subject: `Nuevo contacto de ${nombre} ${apellido} - Portafolio Web`,
      htmlContent: htmlContent
    };

// Realizar la petición a la API de Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Brevo Response:', response.status, result);

    if (!response.ok) {
      console.error('Error de Brevo:', result);
      return {
        success: false,
        message: result.message || 'Error al enviar. Verifica tu conexión e intenta de nuevo.'
      };
    }

    return {
      success: true,
      message: '¡Mensaje enviado correctamente! Te contactaré pronto.'
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      message: 'Error de conexión. Por favor verifica tu conexión a internet.'
    };
  }
}

/**
 * Maneja el envío del formulario de contacto
 * @param {Event} event - Evento del formulario
 */
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const statusMessage = document.getElementById('formStatus');

  // Obtener valores del formulario
  const datos = {
    nombre: form.querySelector('#contactName')?.value?.trim() || '',
    apellido: form.querySelector('#contactApellido')?.value?.trim() || '',
    email: form.querySelector('#contactEmail')?.value?.trim() || '',
    descripcion: form.querySelector('#contactMensaje')?.value?.trim() || ''
  };

  // Guardar texto original del botón
  const originalText = submitBtn.innerHTML;
  
  // Estado de carga
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  
  if (statusMessage) {
    statusMessage.className = '';
    statusMessage.textContent = '';
  }

  // Enviar el correo
  const resultado = await sendEmail(datos);

  // Restaurar botón
  submitBtn.disabled = false;
  submitBtn.innerHTML = originalText;

  // Mostrar resultado
  if (statusMessage) {
    if (resultado.success) {
      statusMessage.className = 'form-status success';
      statusMessage.textContent = resultado.message;
      form.reset(); // Limpiar formulario
    } else {
      statusMessage.className = 'form-status error';
      statusMessage.textContent = resultado.message;
    }
  }

  return resultado;
}

// Hacer la función disponible globalmente
window.sendEmail = sendEmail;
window.handleSubmit = handleSubmit;
