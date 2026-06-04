"use client";

/**
 * QAClinique — mode "QA Clinique" de la page Intelligence clinique.
 *
 * ⚠️ COMPLIANCE AI Act Art. 50 : le disclaimer amber "Brouillon IA — à
 * vérifier par le soignant" est NON-MASQUABLE. Toute modification de ce
 * texte ou de sa visibilité = violation MDR. Préservé intact.
 */

import { useState, useEffect, useRef } from "react";
import { AlertCircle, Send } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { slugToCategory, CATEGORY_META } from "./_utils";

interface QAMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; slug: string }[];
  confidence?: number;
}

export default function QAClinique() {
  const { accessToken } = useAuthStore();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async () => {
    const q = question.trim();
    if (!q || loading) return;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/intelligence/clinical-qa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error("[QAClinique] HTTP", res.status, body.slice(0, 300));
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json() as {
        answer: string;
        sources?: { title: string; slug: string }[];
        confidence?: number;
      };
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        confidence: data.confidence,
      }]);
    } catch (err) {
      console.error("[QAClinique]", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Réessayez ou utilisez la Recherche documentaire.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const EXAMPLES = [
    "Critères diagnostiques DSM-5 de l'anorexie mentale",
    "Quelle est la prise en charge nutritionnelle en phase de renutrition ?",
    "Indications de l'hospitalisation en TCA",
    "Critères biologiques d'hospitalisation en anorexie",
  ];

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* MDR Disclaimer — non masquable */}
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 flex items-start gap-2">
        <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 leading-snug">
          <strong>Brouillon IA — à vérifier par le soignant.</strong> Les réponses sont générées à partir de la base documentaire Nami et ne constituent pas un avis médical. Toujours croiser avec les sources citées. Conforme AI Act Art. 50.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4 min-h-[200px]">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Questions fréquentes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => { setQuestion(ex); }}
                  className="text-left text-[12px] px-4 py-3 rounded-xl border border-gray-100 bg-white text-gray-600 hover:border-[#5B4EC4] hover:text-[#5B4EC4] hover:bg-[rgba(91,78,196,0.04)] transition-all leading-snug"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-[#5B4EC4] text-white text-[13px] leading-relaxed">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[90%] space-y-2">
                <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-gray-100 shadow-sm text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.confidence !== undefined && (
                  <div className="px-1">
                    {(() => {
                      const pct = Math.round(msg.confidence * 100);
                      const cfg = msg.confidence >= 0.7
                        ? { label: "Élevée", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                        : msg.confidence >= 0.4
                        ? { label: "Moyenne", cls: "bg-amber-50 text-amber-700 border-amber-200" }
                        : { label: "Faible", cls: "bg-red-50 text-red-600 border-red-200" };
                      return (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                          Confiance {cfg.label} · {pct}%
                        </span>
                      );
                    })()}
                  </div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="px-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Sources</p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((s, j) => {
                        const cat = slugToCategory(s.slug ?? "");
                        const meta = CATEGORY_META[cat];
                        const catColor = meta?.color ?? "#6B7280";
                        const catBg = meta?.bg ?? "rgba(138,138,150,0.10)";
                        return (
                          <span
                            key={j}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={
                              {
                                "--cat-color": catColor,
                                "--cat-bg": catBg,
                                background: "var(--cat-bg)",
                                color: "var(--cat-color)",
                                borderColor: `${catColor}22`,
                              } as React.CSSProperties
                            }
                          >
                            [{j + 1}] {s.title || s.slug}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white border border-gray-100 shadow-sm">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#5B4EC4] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 items-end">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
          placeholder="Posez une question clinique… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
          rows={2}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] resize-none transition-all"
        />
        <button
          onClick={ask}
          disabled={loading || !question.trim()}
          className="h-[52px] w-[52px] flex items-center justify-center rounded-xl bg-[#5B4EC4] text-white hover:bg-[#4940A8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
