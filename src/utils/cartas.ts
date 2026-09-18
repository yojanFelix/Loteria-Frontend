// Las imágenes ahora se sirven desde la carpeta public/cards/ para
// evitar saturar el servidor de desarrollo de Vite con importaciones de módulos.
export const imagenDeCarta = (id: number): string | undefined => {
  if (id >= 1 && id <= 54) {
    return `/cards/${id}.webp`;
  }
  return undefined;
};
