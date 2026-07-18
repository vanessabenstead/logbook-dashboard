import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Logbook — Personal Dashboard",
    short_name: "Logbook",
    description: "A daily log for tasks, habits, and notes.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDE6DC",
    theme_color: "#8A7159",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
