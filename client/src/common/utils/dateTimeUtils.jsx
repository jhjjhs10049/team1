// 날짜/시간 처리 유틸리티
export const dateTimeUtils = {
    /**
     * Date 객체를 로컬 시간대 기준 ISO 문자열로 변환
     * (UTC 변환 없이 현재 시간대 유지)
     */
    toLocalISOString: (date) => {
        if (!date || !(date instanceof Date)) return null;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    },

    /**
     * YYYY-MM-DD 형식의 날짜 문자열로 변환
     */
    toDateString: (date) => {
        if (!date) return null;

        if (date instanceof Date) {
            return date.toISOString().slice(0, 10);
        }

        if (typeof date === "string") {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date;
            }
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
                return d.toISOString().slice(0, 10);
            }
        }

        return String(date);
    },

    /**
     * 문자열이나 Date 객체를 로컬 시간대 기준 ISO DateTime 문자열로 변환
     */
    toLocalISODateTime: (input) => {
        if (!input) return null;

        if (input instanceof Date) {
            return dateTimeUtils.toLocalISOString(input);
        }

        if (typeof input === "string") {
            const date = new Date(input);
            if (!isNaN(date.getTime())) {
                return dateTimeUtils.toLocalISOString(date);
            }
            return input; // 이미 올바른 형식이라 가정
        }

        if (Array.isArray(input) || typeof input === "object") {
            console.error("Invalid datetime parameter: received array or object", input);
            throw new Error(
                `Invalid datetime parameter: expected string or Date, got ${typeof input}`
            );
        }

        return String(input);
    },

    /**
     * 시간을 더하는 헬퍼 함수
     */
    addHours: (date, hours) => {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
    }
};