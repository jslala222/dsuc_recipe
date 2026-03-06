// Path: src/lib/format.ts
// Description: 데이터 포맷팅 유틸리티 (전화번호 하이픈 자동 추가 등)

/**
 * 전화번호에 자동으로 하이픈(-)을 추가합니다.
 * @param value - 숫자만 포함되거나 하이픈이 포함된 문자열
 * @returns 000-0000-0000 형식의 문자열
 */
export function formatPhoneNumber(value: string) {
    if (!value) return value;

    // 숫자만 추출
    const phoneNumber = value.replace(/[^\d]/g, "");
    const len = phoneNumber.length;

    if (len < 4) return phoneNumber;
    if (len < 7) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    if (len < 11) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
}
