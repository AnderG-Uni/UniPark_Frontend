import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProtectedImage({ src, alt, className, fallbackSrc }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Si no hay ruta, mostramos la imagen por defecto
    if (!src) {
      setHasError(true);
      return;
    }

    const fetchImage = async () => {
      try {
        // 1. Armamos la URL completa (igual que hacíamos en el Home)
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
        const cleanPath = src.startsWith('/') ? src : `/${src}`;
        const fullUrl = src.startsWith('http') ? src : `${baseUrl}${cleanPath}`;

        // 2. Traemos el token de la memoria
        const token = localStorage.getItem('access_token');

        // 3. Usamos axios para descargar la imagen como BLOB (Archivo binario)
        const response = await axios.get(fullUrl, {
          responseType: 'blob', // MUY IMPORTANTE
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // 4. Convertimos el binario en una URL visible para la etiqueta <img>
        const objectUrl = URL.createObjectURL(response.data);
        setImgSrc(objectUrl);
      } catch (error) {
        console.error("No se pudo cargar la imagen protegida:", error);
        setHasError(true);
      }
    };

    fetchImage();

    // Limpieza de memoria cuando el componente desaparece
    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [src]); // Se vuelve a ejecutar si la ruta de la imagen cambia

  // Si hubo error o aún está cargando, mostramos la imagen genérica
  if (hasError || !imgSrc) {
    return (
      <img 
        src={fallbackSrc || "https://m.media-amazon.com/images/I/71Y0v2xY4VL._AC_SL1500_.jpg"} 
        alt={alt} 
        className={className} 
      />
    );
  }

  // Si todo salió bien, mostramos la imagen desencriptada
  return <img src={imgSrc} alt={alt} className={className} />;
}