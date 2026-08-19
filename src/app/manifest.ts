import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guia Digital RF Tecnologia",
    short_name: "RF Tecnologia",
    description: "Plataforma de Guia Digital da RF Tecnologia",
    start_url: "/",
    display: "standalone",
    theme_color: "#071A3A",
    background_color: "#FFFFFF",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/rf-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/rf-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
