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

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  phoneForm.addEventListener("submit", handleSubmit)

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

    // Llamar a la API
    const response = await fetch(
      `https://script.google.com/macros/s/AKfycbyZIvkn6W0kXBzEVdroLWD09CZKxvegvylkB1_mlXpHkJoeCj8sBM5QhA28WoOviARe/exec?telefono=${fullPhone}`,
    )

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor")
    }

    const data = await response.json()
    console.log("[v0] Respuesta de la API:", data)

    // Buscar el cliente en la respuesta
    let foundClient = null

    if (Array.isArray(data)) {
      // Si la respuesta es un array, buscar el teléfono
      foundClient = data.find((client) => {
        const clientPhone = client.Telefono?.toString().replace(/\+/g, "")
        return clientPhone === fullPhone
      })
    } else if (data.Cliente && data.Telefono) {
      // Si la respuesta es un objeto único
      const clientPhone = data.Telefono.toString().replace(/\+/g, "")
      if (clientPhone === fullPhone) {
        foundClient = data
      }
    }

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
    showError("Error al verificar el número. Inténtalo de nuevo.")
  }
}

function showLoading() {
  isLoading = true
  loading.style.display = "block"
  submitBtn.disabled = true
  submitBtn.textContent = "Verificando..."
  hideError()
}

function hideLoading() {
  isLoading = false
  loading.style.display = "none"
  submitBtn.disabled = false
  submitBtn.textContent = "Verificar Acceso"
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
function showEmailDemo() {
  const emailInput = document.getElementById("emailInput")
  const email = emailInput.value.trim()

  if (!email) {
    alert("Por favor ingresa un correo electrónico")
    return
  }

  // Validar dominios permitidos
  const validDomains = ["@legalnetf.com", "@gmail.com", "@legalclub.com.co"]
  const isValidDomain = validDomains.some((domain) => email.includes(domain))

  if (isValidDomain) {
    alert(`✅ Correo válido: ${email}\nProcediendo con la verificación...`)
  } else {
    alert(`❌ Dominio no válido. Usa uno de estos dominios:\n${validDomains.join("\n")}`)
  }
}

// Función para limpiar el formulario
function resetForm() {
  phoneNumber.value = ""
  hideMessages()
  premiumContent.style.display = "none"
  verificationSection.style.display = "block"
}
