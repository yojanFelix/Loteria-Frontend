// Imágenes locales de las cartas (1..54), indexadas por id.
// El backend manda imgUrl relativo (/cards/N.webp) que no resuelve en el
// front; por eso mapeamos por id a los assets empaquetados por Vite.
const imagenesCartas = import.meta.glob('../assets/cards/*.webp', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const porId = new Map<number, string>()

for (const [ruta, imagen] of Object.entries(imagenesCartas)) {
  const nombreArchivo = ruta.split('/').pop() ?? ''
  const id = parseInt(nombreArchivo.split('.')[0].trim(), 10)
  if (!Number.isNaN(id)) porId.set(id, imagen)
}

export const imagenDeCarta = (id: number): string | undefined => porId.get(id)
