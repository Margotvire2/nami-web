import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nami — Cockpit clinique de coordination des soins";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 800, color: "#fff" }}>N</span>
        </div>
        <span
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-1px",
          }}
        >
          Nami
        </span>
        <span
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.8)",
            marginTop: 12,
          }}
        >
          Cockpit clinique de coordination des soins
        </span>
        <span
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            marginTop: 32,
          }}
        >
          TCA · Obésité · Nutrition pluridisciplinaire
        </span>
      </div>
    ),
    { ...size }
  );
}
