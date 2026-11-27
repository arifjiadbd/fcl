
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fclbd.vercel.app";

  const pages = [
    {
      url: "",
      priority: 1.0,
      changeFrequency: "daily" as const,
    },
    {
      url: "/play",
      priority: 0.9,
      changeFrequency: "daily" as const,
    },
    {
      url: "/players",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    {
      url: "/rankings",
      priority: 0.9,
      changeFrequency: "weekly" as const,
    },
    {
      url: "/news",
      priority: 0.8,
      changeFrequency: "daily" as const,
    },
    {
      url: "/records",
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
    {
      url: "/rules",
      priority: 0.6,
      changeFrequency: "monthly" as const,
    },
    {
      url: "/series",
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
    {
      url: "/thrillers",
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
