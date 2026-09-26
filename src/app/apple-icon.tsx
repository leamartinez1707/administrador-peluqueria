import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 78,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: -3,
          }}
        >
          CB
        </div>
        <div style={{ display: "flex", width: 92, height: 9, marginTop: 10 }}>
          <div style={{ flex: 1, background: "#dc2626" }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: "#2563eb" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
