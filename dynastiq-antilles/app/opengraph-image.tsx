import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.nom;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0B1B29",
        backgroundImage: "linear-gradient(135deg, #0B1B29 0%, #112937 60%, #0C8689 140%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 140,
          height: 140,
          borderRadius: 32,
          border: "3px solid #118F92",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "6px solid #118F92",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: -1,
        }}
      >
        {site.nom}
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 32,
          color: "#118F92",
        }}
      >
        {site.baseline}
      </div>
    </div>,
    { ...size },
  );
}
