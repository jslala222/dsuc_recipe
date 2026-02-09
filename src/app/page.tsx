// Path: src/app/page.tsx
// Description: 메인 페이지 컴포넌트 (GitHub 연동 테스트용 주석)
import Link from "next/link";
import {
    ChefHat,
    ShoppingCart,
    Building2,
    Calculator,
    Users,
    CalendarDays,
    Handshake,
    ArrowRight,
    StickyNote,
} from "lucide-react";

const features = [
    {
        href: "/recipes",
        icon: ChefHat,
        title: "레시피 저장소",
        description: "사진과 함께 요리법 기록",
        color: "bg-primary-500",
        bgColor: "bg-primary-50",
    },
    {
        href: "/shopping",
        icon: ShoppingCart,
        title: "장보기/재료관리",
        description: "시장 정보와 체크리스트",
        color: "bg-orange-500",
        bgColor: "bg-orange-50",
    },
    {
        href: "/startup",
        icon: Building2,
        title: "창업 준비 로그",
        description: "입지 분석, 행정 절차",
        color: "bg-blue-500",
        bgColor: "bg-blue-50",
    },
    {
        href: "/accounting",
        icon: Calculator,
        title: "세무/회계 노트",
        description: "지출 기록, 상담 메모",
        color: "bg-purple-500",
        bgColor: "bg-purple-50",
    },
    {
        href: "/suppliers",
        icon: Handshake,
        title: "거래처 관리",
        description: "식자재 업체 정보",
        color: "bg-teal-500",
        bgColor: "bg-teal-50",
    },
    {
        href: "/reservations",
        icon: CalendarDays,
        title: "예약 시스템",
        description: "예약 현황과 캘린더",
        color: "bg-pink-500",
        bgColor: "bg-pink-50",
    },
    {
        href: "/customers",
        icon: Users,
        title: "고객 관리",
        description: "단골 고객 정보",
        color: "bg-indigo-500",
        bgColor: "bg-indigo-50",
    },
    {
        href: "/notes",
        icon: StickyNote,
        title: "특이사항",
        description: "일별 메모와 기록",
        color: "bg-amber-500",
        bgColor: "bg-amber-50",
    },
];

export default function Home() {
    return (
        <div className="space-y-8">
            {/* 환영 메시지 */}
            <section className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                        <ChefHat className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">나만의레시피</h1>
                        <p className="text-primary-100">사장님을 위한 창업 준비 올인원 관리 🚀 (자동 배포 테스트 성공!)</p>
                    </div>
                </div>
                <p className="text-primary-100 leading-relaxed">
                    배운 요리법, 시장 정보, 창업 준비까지<br />
                    모든 것을 한 곳에서 관리하세요 ✨
                </p>
            </section>

            {/* 빠른 시작 */}
            <section>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
                    무엇을 하시겠어요?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature) => (
                        <Link
                            key={feature.href}
                            href={feature.href}
                            className="group bg-white rounded-2xl p-5 shadow-sm border border-wood-100 hover:shadow-md hover:border-primary-200 transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {feature.description}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 응원 메시지 */}
            <section className="bg-wood-50 rounded-2xl p-6 text-center border border-wood-100">
                <p className="text-wood-700 font-medium">
                    💚 오늘도 열심히 준비하는 당신을 응원합니다!
                </p>
            </section>
        </div>
    );
}
