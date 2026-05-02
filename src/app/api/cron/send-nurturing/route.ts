import { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://nami-production-f268.up.railway.app"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!process.env.CRON_SECRET) {
    console.error("[cron/send-nurturing] CRON_SECRET non configuré — toute exécution refusée")
    return new Response("Server misconfigured: CRON_SECRET missing", { status: 503 })
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const res = await fetch(`${API_URL}/nurturing/send-due`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cron-secret": process.env.CRON_SECRET,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[cron/send-nurturing] Backend error:", err)
    return Response.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  console.log("[cron/send-nurturing] Résultat:", data)
  return Response.json({ ok: true, ...data })
}
