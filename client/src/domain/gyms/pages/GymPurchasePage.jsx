import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BasicLayout from "../../../layouts/BasicLayout.jsx";
import { createSchedule } from "../../scheduler/api/scheduleApi.jsx";
import { fetchGymDetail } from "../api/gymApi.jsx";
import { dateTimeUtils } from "../../../common/utils/dateTimeUtils.jsx";

const DUMMY_TRAINERS = [
  { id: 101, name: "홍길동", basePrice: 40000 },
  { id: 102, name: "김트레이너", basePrice: 50000 },
  { id: 103, name: "최PT", basePrice: 60000 },
];

// 오늘부터 2주간의 날짜 생성
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

// 운영 시간 (09:00 ~ 21:00, 1시간 간격) - PT 세션은 1시간 단위
const generateTimeSlots = () => {
  const times = [];
  for (let hour = 9; hour <= 21; hour++) {
    times.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return times;
};

const AVAILABLE_DATES = generateDates();
const AVAILABLE_TIMES = generateTimeSlots();

const GymPurchasePage = () => {
  const { gymno } = useParams(); // 라우터에서 :gymno로 설정했으므로
  const navigate = useNavigate();
  // 헬스장 정보 상태
  const [gymInfo, setGymInfo] = useState(null);

  // 실제 헬스장 정보 가져오기
  useEffect(() => {
    const fetchGymInfo = async () => {
      try {
        const data = await fetchGymDetail(gymno);
        setGymInfo(data);
      } catch (error) {
        console.error("헬스장 정보 가져오기 실패:", error);
        // 에러 시 하드코딩된 이름 사용
        setGymInfo({ title: `헬스장 #${gymno}` });
      }
    };

    if (gymno) {
      fetchGymInfo();
    }
  }, [gymno]);
  // 헬스장 이름
  const gymName = gymInfo?.title || `헬스장 #${gymno ?? "?"}`;

  const [trainerId, setTrainerId] = useState(DUMMY_TRAINERS[0].id);
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0]);
  const [selectedTime, setSelectedTime] = useState(AVAILABLE_TIMES[0]);
  const [count, setCount] = useState(1);

  const selectedTrainer = useMemo(
    () => DUMMY_TRAINERS.find((t) => t.id === trainerId),
    [trainerId]
  );

  const totalPrice = useMemo(() => {
    const unit = selectedTrainer?.basePrice ?? 0;
    return unit * count;
  }, [selectedTrainer, count]);
  const handlePay = async () => {
    try {
      // 결제 확인
      const paymentConfirmed = window.confirm(
        `${gymName} PT ${count}회\n트레이너: ${selectedTrainer?.name
        }\n날짜: ${selectedDate}\n시간: ${selectedTime}\n총 ${totalPrice.toLocaleString()}원을 결제하시겠습니까?`
      );
      if (!paymentConfirmed) return;

      // 스케줄 등록을 위한 시간 계산 (한국 시간대 고려)
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1); // 1시간 세션

      // 안전한 로컬 ISO 문자열 변환
      const formatSafeLocalISO = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      // 스케줄 등록 데이터 준비
      const scheduleData = {
        date: selectedDate,
        title: `${gymName} PT 세션`,
        startTime: formatSafeLocalISO(startDateTime),
        endTime: formatSafeLocalISO(endDateTime),
        gym: gymName,
        trainerName: selectedTrainer?.name,
        color: "bg-teal-500", // 헬스장 색상 (Tailwind 클래스)
      };

      // 스케줄에 등록
      await createSchedule(scheduleData);

      alert("결제가 완료되었습니다!\n스케줄에 자동으로 등록되었습니다.");
      navigate("/scheduler/schedule");
    } catch (error) {
      console.error("결제 또는 스케줄 등록 실패:", error);
      alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };
  return (
    <BasicLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>💪 헬스장 PT 예약</h1>
          <p style={styles.subtitle}>
            날짜와 시간을 선택하여 PT 세션을 예약하세요
          </p>
        </div>
        {/* 헬스장 이름 */}
        <section style={styles.section}>
          <label style={styles.label}>헬스장</label>
          <div style={styles.fakeInput}>{gymName}</div>
        </section>
        {/* 트레이너 선택 */}
        <section style={styles.section}>
          <label htmlFor="trainer" style={styles.label}>
            트레이너 선택
          </label>
          <select
            id="trainer"
            value={trainerId}
            onChange={(e) => setTrainerId(Number(e.target.value))}
            style={styles.select}
          >
            {DUMMY_TRAINERS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (회당 {t.basePrice.toLocaleString()}원)
              </option>
            ))}
          </select>
        </section>
        {/* 날짜 선택 */}
        <section style={styles.section}>
          <label htmlFor="date" style={styles.label}>
            날짜 선택
          </label>
          <select
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.select}
          >
            {AVAILABLE_DATES.map((date) => {
              const dateObj = new Date(date);
              const dayName = ["일", "월", "화", "수", "목", "금", "토"][
                dateObj.getDay()
              ];
              return (
                <option key={date} value={date}>
                  {date} ({dayName})
                </option>
              );
            })}
          </select>
        </section>
        {/* 시간 선택 */}
        <section style={styles.section}>
          <label htmlFor="time" style={styles.label}>
            시간 선택
          </label>
          <select
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={styles.select}
          >
            {AVAILABLE_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </section>
        {/* 예약 정보 확인 */}
        <section style={styles.section}>
          <label style={styles.label}>예약 정보 확인</label>
          <div style={styles.summaryBox}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>헬스장:</span>
              <span style={styles.summaryValue}>{gymName}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>트레이너:</span>
              <span style={styles.summaryValue}>{selectedTrainer?.name}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>날짜:</span>
              <span style={styles.summaryValue}>
                {selectedDate} (
                {
                  ["일", "월", "화", "수", "목", "금", "토"][
                  new Date(selectedDate).getDay()
                  ]
                }
                )
              </span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>시간:</span>
              <span style={styles.summaryValue}>
                {selectedTime} ~
                {(() => {
                  const [hour, minute] = selectedTime.split(":").map(Number);
                  const endHour = hour + 1;
                  return `${endHour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                })()}
              </span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>세션 횟수:</span>
              <span style={styles.summaryValue}>{count}회</span>
            </div>
          </div>
        </section>
        {/* 횟수/요금 */}
        <section style={styles.sectionRow}>
          <div style={{ flex: 1 }}>
            <label htmlFor="count" style={styles.label}>
              횟수
            </label>
            <input
              id="count"
              type="number"
              min={1}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Number(e.target.value || 1)))
              }
              style={styles.input}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>예상 요금</label>
            <div style={styles.priceBox}>{totalPrice.toLocaleString()}원</div>
          </div>
        </section>
        {/* 결제 버튼 */}
        <div style={styles.buttonRow}>
          <button style={styles.secondaryBtn} onClick={() => navigate(-1)}>
            ← 이전
          </button>
          <button style={styles.primaryBtn} onClick={handlePay}>
            💳 {totalPrice.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    </BasicLayout>
  );
};

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "1.5rem",
    fontFamily: "sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "linear-gradient(135deg, #14b8a6, #0d9488)",
    borderRadius: 12,
    color: "#fff",
  },
  title: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: "0.5rem 0 0 0",
    fontSize: "1rem",
    opacity: 0.9,
  },
  section: { marginBottom: "1rem" },
  sectionRow: {
    marginBottom: "1rem",
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
  },
  label: { display: "block", marginBottom: 6, color: "#444", fontWeight: 600 },
  fakeInput: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#fafafa",
  },
  select: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#fff",
  },
  input: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
  },
  priceBox: {
    border: "2px solid #222",
    borderRadius: 8,
    padding: "10px 12px",
    fontWeight: 700,
    fontSize: "1.05rem",
    background: "#fff",
  },
  summaryBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "16px",
    background: "#f9fafb",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  summaryValue: {
    color: "#1f2937",
    fontWeight: 600,
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    justifyContent: "space-between",
    marginTop: "2rem",
  },
  primaryBtn: {
    flex: 2,
    padding: "14px 20px",
    background: "linear-gradient(135deg, #14b8a6, #0d9488)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 600,
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 12px rgba(20, 184, 166, 0.3)",
  },
  secondaryBtn: {
    flex: 1,
    padding: "14px 20px",
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 500,
    transition: "background-color 0.2s",
  },
};

export default GymPurchasePage;
