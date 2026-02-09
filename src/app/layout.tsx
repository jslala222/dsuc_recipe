import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "나만의레시피 - 창업 준비 올인원",
    description: "레시피, 장보기, 창업 준비, 세무까지 한곳에서 관리하세요",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="min-h-screen bg-cream-50">
                <div className="flex flex-col md:flex-row min-h-screen">
                    {/* 사이드바 (PC/태블릿) 또는 하단바 (모바일) */}
                    <Sidebar />

                    {/* 메인 컨텐츠 */}
                    <main className="flex-1 pb-20 md:pb-0 md:ml-64">
                        <div className="container mx-auto px-4 py-6 max-w-6xl">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
}
