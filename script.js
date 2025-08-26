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

// Funciones auxiliares
function hideEmailError() {
  emailError.style.display = "none"
}

function showEmailError(message) {
  emailError.style.display = "block"
  emailError.querySelector("strong").textContent = "❌ " + message
}

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

    const apiUrl = `https://script.google.com/macros/s/AKfycbw1vpPONFAgRxOV835iDKVXLVf06-ljvuYQtfWOs358jXQneOFLuXfmD7WbwCwmf0_4bQ/exec?email=${encodeURIComponent(email)}`
    console.log("[v0] URL de la API de correo:", apiUrl)

    const response = await fetchWithTimeout(apiUrl, 10000)

    console.log("[v0] Status de respuesta:", response.status)
    console.log("[v0] Headers de respuesta:", response.headers)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const responseText = await response.text()
    console.log("[v0] Respuesta cruda de la API:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
      console.log("[v0] Respuesta parseada de la API de correo:", data)
    } catch (parseError) {
      console.error("[v0] Error al parsear JSON:", parseError)
      console.log("[v0] Respuesta no es JSON válido:", responseText)
      throw new Error("La respuesta del servidor no es JSON válido")
    }

    // Restaurar botón
    emailButton.disabled = false
    emailButton.textContent = "Enviar"
    emailButton.style.opacity = "1"

    if (data.success === false) {
      // Mostrar mensaje de error de la API
      console.log("[v0] API devolvió error:", data.message)
      showEmailError(data.message || "No se encontraron correos para el destinatario especificado.")
    } else if (data.success === true) {
      // Mostrar botón de WhatsApp con el mensaje completo
      console.log("[v0] API devolvió éxito, creando botón de WhatsApp")
      showWhatsAppButton(email, data.message)
    } else {
      console.log("[v0] Respuesta inesperada:", data)
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
      showEmailError(`Error al verificar el correo: ${error.message}`)
    }
  }
}

function showWhatsAppButton(email, apiMessage) {
  hideEmailError()

  const whatsappContainer = document.getElementById("whatsappContainer")
  const whatsappButton = document.getElementById("whatsappButton")

  if (whatsappContainer && whatsappButton) {
    whatsappContainer.style.display = "block"

    // Update the click handler
    whatsappButton.onclick = () => openWhatsApp(email, apiMessage)
  }
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
