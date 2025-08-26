"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, XCircle, Loader2 } from "lucide-react"

export default function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+51")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; cliente?: string } | null>(null)
  const [showPremiumContent, setShowPremiumContent] = useState(false)
  const [emailInput, setEmailInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber.trim()) {
      setResult({ success: false, message: "Por favor ingresa tu número de WhatsApp" })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const fullPhone = countryCode + phoneNumber
      console.log("[v0] Número ingresado:", phoneNumber)
      console.log("[v0] Código país:", countryCode)
      console.log("[v0] Número completo enviado:", fullPhone)

      const apiUrl = `https://script.google.com/macros/s/AKfycbyZIvkn6W0kXBzEVdroLWD09CZKxvegvylkB1_mlXpHkJoeCj8sBM5QhA28WoOviARe/exec?telefono=${encodeURIComponent(fullPhone)}`
      console.log("[v0] URL de la API:", apiUrl)

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error("Error en la consulta")
      }

      const data = await response.json()
      console.log("[v0] Respuesta de la API:", data)

      const phoneToSearch = fullPhone.replace("+", "") // Remover el + para comparar
      console.log("[v0] Número a buscar (sin +):", phoneToSearch)

      // Buscar en el array de clientes
      const foundClient = Array.isArray(data) ? data.find((client) => client.Telefono === phoneToSearch) : null

      console.log("[v0] Cliente encontrado:", foundClient)

      if (foundClient && foundClient.Cliente) {
        setResult({
          success: true,
          message: `¡Bienvenido ${foundClient.Cliente}! Tienes acceso al contenido premium.`,
          cliente: foundClient.Cliente,
        })
        setShowPremiumContent(true)
      } else {
        setResult({
          success: false,
          message: "Número no encontrado. No tienes acceso al contenido premium.",
        })
      }
    } catch (error) {
      console.log("[v0] Error en la consulta:", error)
      setResult({
        success: false,
        message: "Error al verificar el número. Inténtalo de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailDemo = () => {
    if (emailInput.trim()) {
      alert(`✅ Correo registrado: ${emailInput}\nVerifica tu bandeja de entrada para el código de verificación.`)
    } else {
      alert("❌ Por favor ingresa un correo electrónico válido")
    }
  }

  if (showPremiumContent) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-6xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-5xl font-bold text-red-600 mb-4">🎉 ¡ACCESO DESBLOQUEADO!</h1>
            <p className="text-xl text-gray-300">Ahora tienes acceso al contenido premium</p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Instructions Section */}
            <div className="bg-gray-900 p-8 rounded-2xl border-2 border-gray-800">
              <h2 className="text-3xl font-bold text-red-600 mb-8 tracking-wider">INSTRUCCIONES</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">Ingresa la cuenta Netflix en tu dispositivo</h3>
                    <p className="text-gray-400 text-sm">
                      Solicita el código desde la opción <strong>"Estoy de viaje"</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">Digita el correo de tu cuenta Netflix</h3>
                    <p className="text-gray-400 text-sm">
                      En <strong>"Escribir Correo Aquí"</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">Clic en el botón "Enviar"</h3>
                    <p className="text-gray-400 text-sm">Para obtener los correos correspondientes</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                  <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">Clic en el botón "Ver"</h3>
                    <p className="text-gray-400 text-sm">Fíjate que coincida la fecha y hora del envío de tu código</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Netflix Demo Section */}
            <div className="bg-black p-8 rounded-2xl border-3 border-red-600">
              <div className="text-center mb-8">
                <h2 className="text-5xl font-bold text-red-600 tracking-tight">NETFLIX</h2>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-white text-lg mb-4">Correo Electrónico</h3>
                <Input
                  type="email"
                  placeholder="Escribir correo aquí"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full mb-4 bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                />
                <Button
                  onClick={handleEmailDemo}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                >
                  Enviar
                </Button>

                <div className="mt-6 text-center">
                  <h4 className="text-green-400 font-bold mb-3">CORREOS VÁLIDOS PARA CONSULTA</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">@legalnetf.com</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">@gmail.com</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">@legalclub.com.co</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="mt-8 bg-red-600 p-6 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wider">📝 NOTA</h3>
            <p className="text-white">
              Espera 2 o 3 min desde el envío del código para que aparezca en la consulta. Asegúrate de seguir todos los
              pasos correctamente. Si tienes algún problema, contacta a soporte técnico.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Premium</h1>
            <p className="text-gray-600">Ingresa tu número de WhatsApp para acceder al contenido exclusivo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Ingresa tu WhatsApp</h2>
              <p className="text-sm text-gray-500 mb-4 text-center">Escribe tu número sin espacios (Ej: 960744787)</p>

              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+51">PE +51</SelectItem>
                    <SelectItem value="+1">US +1</SelectItem>
                    <SelectItem value="+52">MX +52</SelectItem>
                    <SelectItem value="+57">CO +57</SelectItem>
                    <SelectItem value="+54">AR +54</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="tel"
                  placeholder="Número de WhatsApp"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  className="flex-1"
                  maxLength={15}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "ENVIAR"
              )}
            </Button>
          </form>

          {result && !result.success && (
            <div className="mt-6 p-4 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{result.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
