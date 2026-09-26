import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          background: "#171717",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 220,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -8,
          }}
        >
          CB
        </div>
        <div style={{ display: "flex", width: 260, height: 24, marginTop: 28 }}>
          <div style={{ flex: 1, background: "#dc2626" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#2563eb" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
