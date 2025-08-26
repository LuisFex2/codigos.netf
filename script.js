// Variables globales
let isLoading = false

// Elementos del DOM
const phoneForm = document.getElementById("phoneForm")
const phoneNumber = document.getElementById("phoneNumber")
const countryCode = document.getElementById("countryCode")
const submitBtn = document.getElementById("submitBtn")
const loading = document.getElementById("loading")
const errorMessage = document.getElementById("errorMessage")
const verificationSection = document.getElementById("verificationSection")
const premiumContent = document.getElementById("premiumContent")
const clientName = document.getElementById("clientName")
const emailInput = document.getElementById("emailInput")
const emailButton = document.querySelector(".netflix-form button")
const emailError = document.getElementById("emailError")

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  phoneForm.addEventListener("submit", handleSubmit)

  if (emailButton) {
    emailButton.addEventListener("click", showEmailDemo)
  }

  // Limpiar mensajes cuando el usuario empiece a escribir
  phoneNumber.addEventListener("input", () => {
    hideMessages()
  })
})

async function handleSubmit(e) {
  e.preventDefault()

  if (isLoading) return

  const phone = phoneNumber.value.trim()
  const country = countryCode.value

  if (!phone) {
    showError("Por favor ingresa tu número de teléfono")
    return
  }

  // Mostrar loading
  showLoading()

  try {
    // Construir el número completo
    const fullPhone = country.replace("+", "") + phone

    console.log("[v0] Verificando número:", fullPhone)

    const response = await fetchWithTimeout(
      `https://script.google.com/macros/s/AKfycbyZIvkn6W0kXBzEVdroLWD09CZKxvegvylkB1_mlXpHkJoeCj8sBM5QhA28WoOviARe/exec?telefono=${fullPhone}`,
      10000,
    )

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor")
    }

    const data = await response.json()
    console.log("[v0] Respuesta de la API:", data)

    const foundClient = findClientOptimized(data, fullPhone)

    hideLoading()

    if (foundClient) {
      console.log("[v0] Cliente encontrado:", foundClient.Cliente)
      showPremiumContent(foundClient.Cliente)
    } else {
      console.log("[v0] Cliente no encontrado")
      showError("Número no encontrado. No tienes acceso al contenido premium.")
    }
  } catch (error) {
    console.error("[v0] Error en la verificación:", error)
    hideLoading()

    if (error.name === "TimeoutError") {
      showError("La verificación está tardando más de 10 segundos. Inténtalo de nuevo.")
    } else {
      showError("Error al verificar el número. Inténtalo de nuevo.")
    }
  }
}

async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-cache", // Evitar cache para datos actualizados
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timeout")
      timeoutError.name = "TimeoutError"
      throw timeoutError
    }
    throw error
  }
}

function findClientOptimized(data, fullPhone) {
  if (Array.isArray(data)) {
    // Búsqueda optimizada en array
    for (let i = 0; i < data.length; i++) {
      const client = data[i]
      if (client.Telefono) {
        const clientPhone = client.Telefono.toString().replace(/\+/g, "")
        if (clientPhone === fullPhone) {
          return client
        }
      }
    }
    return null
  } else if (data.Cliente && data.Telefono) {
    // Si la respuesta es un objeto único
    const clientPhone = data.Telefono.toString().replace(/\+/g, "")
    return clientPhone === fullPhone ? data : null
  }
  return null
}

function showLoading() {
  isLoading = true
  loading.style.display = "block"
  submitBtn.disabled = true
  submitBtn.textContent = "Verificando..."
  hideError()

  submitBtn.style.opacity = "0.7"
}

function hideLoading() {
  isLoading = false
  loading.style.display = "none"
  submitBtn.disabled = false
  submitBtn.textContent = "Verificar Acceso"
  submitBtn.style.opacity = "1"
}

function showError(message) {
  errorMessage.style.display = "block"
  errorMessage.querySelector("strong").textContent = "❌ " + message
}

function hideError() {
  errorMessage.style.display = "none"
}

function hideMessages() {
  hideError()
  hideLoading()
  hideEmailError()
}

function showPremiumContent(cliente) {
  // Ocultar sección de verificación
  verificationSection.style.display = "none"

  // Mostrar contenido premium
  premiumContent.style.display = "block"
  clientName.textContent = cliente

  // Scroll al contenido premium
  premiumContent.scrollIntoView({ behavior: "smooth" })
}

// Función para la demo de email
async function showEmailDemo() {
  const email = emailInput.value.trim()

  if (!email) {
    showEmailError("Por favor ingresa un correo electrónico")
    return
  }

  // Mostrar loading en el botón de email
  emailButton.disabled = true
  emailButton.textContent = "Verificando..."
  emailButton.style.opacity = "0.7"
  hideEmailError()

  try {
    console.log("[v0] Verificando correo:", email)

    const response = await fetchWithTimeout(
      `https://script.google.com/macros/s/AKfycbw1vpPONFAgRxOV835iDKVXLVf06-ljvuYQtfWOs358jXQneOFLuXfmD7WbwCwmf0_4bQ/exec?email=${encodeURIComponent(email)}`,
      10000,
    )

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor")
    }

    const data = await response.json()
    console.log("[v0] Respuesta de la API de correo:", data)

    // Restaurar botón
    emailButton.disabled = false
    emailButton.textContent = "Enviar"
    emailButton.style.opacity = "1"

    if (data.success === false) {
      // Mostrar mensaje de error de la API
      showEmailError(data.message || "No se encontraron correos para el destinatario especificado.")
    } else if (data.success === true) {
      // Mostrar botón de WhatsApp con el mensaje completo
      showWhatsAppButton(email, data.message)
    } else {
      showEmailError("Respuesta inesperada del servidor")
    }
  } catch (error) {
    console.error("[v0] Error en la verificación de correo:", error)

    // Restaurar botón
    emailButton.disabled = false
    emailButton.textContent = "Enviar"
    emailButton.style.opacity = "1"

    if (error.name === "TimeoutError") {
      showEmailError("La verificación está tardando más de 10 segundos. Inténtalo de nuevo.")
    } else {
      showEmailError("Error al verificar el correo. Inténtalo de nuevo.")
    }
  }
}

function showEmailError(message) {
  if (emailError) {
    emailError.style.display = "block"
    emailError.textContent = message
  }
}

function hideEmailError() {
  if (emailError) {
    emailError.style.display = "none"
  }
}

function showWhatsAppButton(email, apiMessage) {
  hideEmailError()

  // Crear o mostrar botón de WhatsApp
  let whatsappButton = document.getElementById("whatsappButton")

  if (!whatsappButton) {
    whatsappButton = document.createElement("button")
    whatsappButton.id = "whatsappButton"
    whatsappButton.innerHTML = "📱 Abrir en WhatsApp"
    whatsappButton.style.cssText = `
      background: #25D366;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 15px;
      width: 100%;
      transition: background-color 0.3s;
    `

    whatsappButton.addEventListener("mouseover", () => {
      whatsappButton.style.backgroundColor = "#128C7E"
    })

    whatsappButton.addEventListener("mouseout", () => {
      whatsappButton.style.backgroundColor = "#25D366"
    })

    // Insertar después del formulario de Netflix
    const netflixForm = document.querySelector(".netflix-form")
    netflixForm.appendChild(whatsappButton)
  }

  whatsappButton.style.display = "block"

  whatsappButton.onclick = () => openWhatsApp(email, apiMessage)
}

function openWhatsApp(email, apiMessage) {
  // Obtener el número de teléfono del cliente que ingresó inicialmente
  const clientPhone = phoneNumber.value.trim()
  const country = countryCode.value
  const fullClientPhone = country + clientPhone

  // Mensaje completo de la API para enviar por WhatsApp
  const whatsappMessage = `Correo verificado: ${email}\n\n${apiMessage}`

  // URL de WhatsApp con el número del cliente y el mensaje completo
  const whatsappUrl = `https://wa.me/${fullClientPhone.replace("+", "")}?text=${encodeURIComponent(whatsappMessage)}`

  // Abrir WhatsApp en nueva ventana
  window.open(whatsappUrl, "_blank")
}

// Función para limpiar el formulario
function resetForm() {
  phoneNumber.value = ""
  emailInput.value = ""
  hideMessages()
  premiumContent.style.display = "none"
  verificationSection.style.display = "block"
}
