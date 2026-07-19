interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

type SupportedLocale = "en" | "es"
const localeCookieName = "itsfree_locale"
const localeCookieMaxAge = 60 * 60 * 24 * 365

function getCookieLocale(header: string | null): SupportedLocale | null {
  if (!header) return null

  const value = header
    .split(";")
    .map((cookie) => cookie.trim().split("="))
    .find(([name]) => name === localeCookieName)?.[1]

  return value === "en" || value === "es" ? value : null
}

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

function withLocaleVary(response: Response): Response {
  const headers = new Headers(response.headers)
  const vary = new Set(
    (headers.get("Vary") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  )
  vary.add("Accept-Language")
  vary.add("Cookie")
  headers.set("Vary", [...vary].join(", "))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

function getSafeLanguageRedirect(locale: SupportedLocale, requestedPath: string | null): string {
  const fallback = locale === "es" ? "/es" : "/"
  if (!requestedPath?.startsWith("/") || requestedPath.startsWith("//")) return fallback

  const destination = new URL(requestedPath, "https://itsfree.dev")
  const isSpanishPath = destination.pathname === "/es" || destination.pathname.startsWith("/es/")

  if ((locale === "es" && !isSpanishPath) || (locale === "en" && isSpanishPath)) return fallback
  return `${destination.pathname}${destination.search}${destination.hash}`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const languageRoute = url.pathname.match(/^\/language\/(en|es)\/?$/)

    if (languageRoute) {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } })
      }

      const locale = languageRoute[1] as SupportedLocale
      const destination = new URL(getSafeLanguageRedirect(locale, url.searchParams.get("redirect")), url)

      return new Response(null, {
        status: 302,
        headers: {
          "Cache-Control": "private, no-store",
          Location: destination.toString(),
          "Set-Cookie": `${localeCookieName}=${locale}; Max-Age=${localeCookieMaxAge}; Path=/; Secure; HttpOnly; SameSite=Lax`,
        },
      })
    }

    if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/") {
      const locale = getCookieLocale(request.headers.get("Cookie"))
        ?? getPreferredLocale(request.headers.get("Accept-Language"))

      if (locale === "es") {
        const destination = new URL("/es", url)
        destination.search = url.search

        return new Response(null, {
          status: 302,
          headers: {
            "Cache-Control": "private, no-store",
            Location: destination.toString(),
            Vary: "Accept-Language, Cookie",
          },
        })
      }

      return withLocaleVary(await env.ASSETS.fetch(request))
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
