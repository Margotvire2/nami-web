import { revalidatePath } from "next/cache"
import { NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function sbHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    Prefer: "return=representation",
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = new Date().toISOString()

  // Récupérer les articles READY dont la date de publication est passée
  const fetchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/Article?status=eq.READY&scheduledPublishAt=lte.${encodeURIComponent(now)}&select=id,title,slug&order=scheduledPublishAt.asc&limit=20`,
    { headers: sbHeaders() }
  )

  if (!fetchRes.ok) {
    const err = await fetchRes.text()
    console.error("[cron/publish-articles] Erreur lecture:", err)
    return Response.json({ error: err }, { status: 500 })
  }

  const toPublish: { id: string; title: string; slug: string }[] = await fetchRes.json()

  if (!toPublish || toPublish.length === 0) {
    return Response.json({ message: "Aucun article à publier", count: 0 })
  }

  const published: string[] = []

  for (const article of toPublish) {
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/Article?id=eq.${article.id}`,
      {
        method: "PATCH",
        headers: sbHeaders(),
        body: JSON.stringify({
          status: "PUBLISHED",
          publishedAt: now,
          updatedAt: now,
        }),
      }
    )

    if (!updateRes.ok) {
      console.error(`[cron] Erreur article ${article.id}:`, await updateRes.text())
    } else {
      published.push(article.title)
      try {
        revalidatePath(`/blog/${article.slug}`)
        revalidatePath("/blog")
        revalidatePath("/sitemap.xml")
      } catch {
        // revalidatePath peut échouer hors contexte de rendu
      }
    }
  }

  console.log(`[cron/publish-articles] ${published.length} articles publiés`)

  return Response.json({
    message: `${published.length} articles publiés`,
    articles: published,
    timestamp: now,
  })
}
