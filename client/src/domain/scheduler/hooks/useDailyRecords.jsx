// src/domain/scheduler/hooks/useDailyRecords.js
import { useState, useEffect, useCallback } from "react";
import { fetchTodayStat, upsertTodayStat } from "../api/scheduleApi";

const useDailyRecords = (selectedDate) => {
  const [todayStat, setTodayStat] = useState(null);

  // 선택된 날짜의 ISO 문자열
  const selectedISO = selectedDate.toISOString().split("T")[0];

  // 기본값 생성 함수
  const createDefaultRecord = useCallback(
    () => ({
      weightKg: 70,
      waterMl: 0,
      calories: 0,
      minutes: 0,
    }),
    []
  );

  // 현재 선택된 날짜의 기록 가져오기
  const getCurrentRecord = useCallback(() => {
    if (!todayStat) return createDefaultRecord();

    return {
      weightKg: todayStat.weightKg || 70,
      waterMl: todayStat.waterMl || 0,
      calories: todayStat.calories || 0,
      minutes: todayStat.minutes || 0,
    };
  }, [todayStat, createDefaultRecord]);

  // 특정 날짜의 기록 업데이트
  const updateRecord = useCallback(
    async (date, field, value) => {
      const dateISO =
        typeof date === "string" ? date : date.toISOString().split("T")[0];

      try {
        // 서버 필드명 매핑
        const serverFieldMap = {
          weight: "weightKg",
          water: "waterMl",
          calories: "calories",
          minutes: "minutes",
        };

        const serverField = serverFieldMap[field] || field;

        // 현재 기록 가져오기
        const currentRecord = getCurrentRecord();

        // 업데이트할 데이터 준비
        const updateData = {
          statDate: dateISO,
          [serverField]: value,
          // 다른 필드들도 함께 전송 (전체 업데이트)
          weightKg: field === "weight" ? value : currentRecord.weightKg,
          waterMl: field === "water" ? value : currentRecord.waterMl,
          calories: field === "calories" ? value : currentRecord.calories,
          minutes: field === "minutes" ? value : currentRecord.minutes,
        };

        // 서버에 저장
        const updated = await upsertTodayStat(updateData);
        setTodayStat(updated);
      } catch (error) {
        console.error("일일 기록 저장 실패:", error);
      }
    },
    [getCurrentRecord]
  );

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTodayStat(selectedISO);
        setTodayStat(data);
      } catch (error) {
        console.error("일일 기록 로드 실패:", error);
        setTodayStat(null); // 실패 시 null로 설정하여 기본값 사용
      }
    };

    loadData();
  }, [selectedISO]);

  // 물 섭취량을 컵 단위로 포맷팅
  const formatCups = useCallback((ml) => {
    const cups = Math.floor(ml / 240);
    const remainder = ml % 240;
    if (remainder === 0) return `${cups}컵`;
    return `${cups}컵 ${remainder}ml`;
  }, []);

  return {
    currentRecord: getCurrentRecord(),
    updateRecord,
    formatCups,
  };
};

export default useDailyRecords;
