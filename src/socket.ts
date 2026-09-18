import { io, type Socket } from 'socket.io-client'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

let socket: Socket | null = null

/**
 * Devuelve el socket conectado y autenticado con el JWT guardado en
 * localStorage (ver LogIn.tsx). Reutiliza la misma conexion en toda
 * la app en vez de crear una nueva cada vez.
 */
export const getSocket = (): Socket => {
  if (socket) return socket

  const token = localStorage.getItem('token')

  socket = io(BASE_URL, {
    auth: { token },
  })

  return socket
}

/** Cierra la conexion (usar al hacer logout). */
export const disconnectSocket = (): void => {
  socket?.disconnect()
  socket = null
}