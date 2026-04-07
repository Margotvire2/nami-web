"use client"

import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import memoData from "@/lib/data/memo-seuils-critiques.json"

export function MemoSeuils() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-base font-semibold">Mémo seuils critiques</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{memoData.source}</p>
      </div>

      {memoData.sections.map((section) => (
        <Card key={section.titre} size="sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-500" />
              {section.titre}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-1.5 pr-3 text-left font-medium">Paramètre</th>
                    <th className="py-1.5 pr-3 text-left font-medium">Seuil</th>
                    <th className="py-1.5 pr-3 text-left font-medium">Action</th>
                    <th className="py-1.5 text-left font-medium">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-1.5 pr-3 font-medium">{item.parametre}</td>
                      <td className="py-1.5 pr-3">
                        <Badge variant="destructive" className="text-[10px] font-mono">
                          {item.seuil}
                        </Badge>
                      </td>
                      <td className="py-1.5 pr-3 text-muted-foreground">{item.action}</td>
                      <td className="py-1.5 text-xs text-muted-foreground">{item.detail || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
