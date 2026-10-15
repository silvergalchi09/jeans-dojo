import type { Metadata } from "next";
import { IBM_Plex_Sans_KR, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "진스 도장 — 선형회귀 빈칸 훈련",
  description:
    "목둘레로 허리둘레를 맞히는 선형회귀 코드의 빈칸을, 한글 설명을 보고 채우는 수행평가 연습.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
