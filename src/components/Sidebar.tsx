"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChefHat,
    ShoppingCart,
    Building2,
    Calculator,
    Users,
    CalendarDays,
    Handshake,
    Home,
    StickyNote,
} from "lucide-react";

const menuItems = [
    { href: "/", icon: Home, label: "홈", color: "text-wood-600" },
    { href: "/recipes", icon: ChefHat, label: "레시피", color: "text-primary-600" },
    { href: "/shopping", icon: ShoppingCart, label: "장보기", color: "text-orange-600" },
    { href: "/startup", icon: Building2, label: "창업준비", color: "text-blue-600" },
    { href: "/accounting", icon: Calculator, label: "세무", color: "text-purple-600" },
    { href: "/suppliers", icon: Handshake, label: "거래처", color: "text-teal-600" },
    { href: "/reservations", icon: CalendarDays, label: "예약", color: "text-pink-600" },
    { href: "/customers", icon: Users, label: "고객", color: "text-indigo-600" },
    { href: "/notes", icon: StickyNote, label: "특이사항", color: "text-amber-600" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* 데스크탑/태블릿 사이드바 */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white border-r border-wood-200 shadow-sm">
                {/* 로고 */}
                <div className="flex items-center gap-3 p-6 border-b border-wood-100">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-800">나만의레시피</h1>
                        <p className="text-xs text-gray-500">창업 준비 올인원</p>
                    </div>
                </div>

                {/* 메뉴 */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-primary-50 text-primary-700 font-semibold"
                                    : "text-gray-600 hover:bg-cream-100"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-600" : item.color}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* 하단 정보 */}
                <div className="p-4 border-t border-wood-100">
                    <p className="text-xs text-gray-400 text-center">
                        💚 아내의 꿈을 응원합니다
                    </p>
                </div>
            </aside>

            {/* 모바일 하단 네비게이션 */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-wood-200 shadow-lg z-50">
                <div className="flex justify-around items-center py-2">
                    {/* 홈, 레시피, 장보기, 특이사항, 고객 - 5개만 표시 */}
                    {[menuItems[0], menuItems[1], menuItems[2], menuItems[8], menuItems[7]].map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center p-2 rounded-lg transition-all min-w-[60px] ${isActive ? "text-primary-600" : "text-gray-500"
                                    }`}
                            >
                                <item.icon className={`w-6 h-6 ${isActive ? "text-primary-600" : ""}`} />
                                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
