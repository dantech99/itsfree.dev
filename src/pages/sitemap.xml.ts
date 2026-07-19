import type { APIRoute } from "astro"
import { resources, sourceReviewedAt } from "../data/resources"

const siteUrl = "https://itsfree.dev"

const escapeXml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;")

export const GET: APIRoute = () => {
  const urls = [
    { loc: `${siteUrl}/`, priority: "1.0" },
    { loc: `${siteUrl}/sponsor`, priority: "0.5" },
    ...resources.map((resource) => ({ loc: `${siteUrl}/tools/${resource.slug}`, priority: "0.8" })),
  ]
  const body = urls.map(({ loc, priority }) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${sourceReviewedAt}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`).join("\n")

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
