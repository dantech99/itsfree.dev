interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

type SupportedLocale = "en" | "es"

function getPreferredLocale(header: string | null): SupportedLocale {
  if (!header) return "en"

  const candidates = header
    .split(",")
    .map((entry, index) => {
      const [range, ...parameters] = entry.trim().toLowerCase().split(";")
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="))
      const quality = qualityParameter ? Number.parseFloat(qualityParameter.split("=")[1]) : 1
      const locale = range.split("-")[0]

      return {
        locale: locale === "es" || locale === "en" ? locale : null,
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      }
    })
    .filter((candidate): candidate is { locale: SupportedLocale; quality: number; index: number } => (
      candidate.locale !== null && candidate.quality > 0
    ))
    .sort((first, second) => second.quality - first.quality || first.index - second.index)

  return candidates[0]?.locale ?? "en"
}

function withLanguageVary(response: Response): Response {
  const headers = new Headers(response.headers)
  const vary = new Set(
    (headers.get("Vary") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  )
  vary.add("Accept-Language")
  headers.set("Vary", [...vary].join(", "))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/") {
      if (getPreferredLocale(request.headers.get("Accept-Language")) === "es") {
        const destination = new URL("/es", url)
        destination.search = url.search

        return new Response(null, {
          status: 302,
          headers: {
            "Cache-Control": "private, no-store",
            Location: destination.toString(),
            Vary: "Accept-Language",
          },
        })
      }

      return withLanguageVary(await env.ASSETS.fetch(request))
    }

    const response = await env.ASSETS.fetch(request)

    if (url.pathname.startsWith("/es/") && response.status === 404) {
      const fallbackUrl = new URL("/es/404.html", url)
      const fallbackRequest = new Request(fallbackUrl, request)
      const fallback = await env.ASSETS.fetch(fallbackRequest)

      return new Response(request.method === "HEAD" ? null : fallback.body, {
        status: 404,
        headers: fallback.headers,
      })
    }

    return response
  },
}
