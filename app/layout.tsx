import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { InvoiceProvider } from "@/contexts/InvoiceContext";

const notoSansJp = localFont({
  src: "../public/fonts/NotoSansJP-Regular.otf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ポケサーチ",
  description: "ポケモンカードの買取価格を検索できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJp.className} antialiased`}>
        <InvoiceProvider>{children}</InvoiceProvider>
      </body>
    </html>
  );
}
