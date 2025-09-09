import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BasicLayout from "../../../layouts/BasicLayout.jsx";

const DUMMY_TRAINERS = [
  { id: 101, name: "홍길동", basePrice: 40000 },
  { id: 102, name: "김트레이너", basePrice: 50000 },
  { id: 103, name: "최PT", basePrice: 60000 },
];

const DUMMY_TIMES = [
  "2025-09-01 09:00",
  "2025-09-01 11:00",
  "2025-09-01 14:00",
  "2025-09-01 18:00",
];

const GymPurchasePage = () => {
  const { gymno } = useParams(); // 라우터에서 :gymno로 설정했으므로
  const navigate = useNavigate();
  // 더미: 헬스장 이름 (실제 연동 전까지 하드코딩)
  const gymName = useMemo(() => {
    if (gymno === "1") return "하드코딩 헬스장";
    return `GYM #${gymno ?? "?"}`;
  }, [gymno]);

  const [trainerId, setTrainerId] = useState(DUMMY_TRAINERS[0].id);
  const [time, setTime] = useState(DUMMY_TIMES[0]);
  const [count, setCount] = useState(1);

  const selectedTrainer = useMemo(
    () => DUMMY_TRAINERS.find((t) => t.id === trainerId),
    [trainerId]
  );

  const totalPrice = useMemo(() => {
    const unit = selectedTrainer?.basePrice ?? 0;
    return unit * count;
  }, [selectedTrainer, count]);
  const handlePay = () => {
    // 결제 자체는 더미 — 바로 confirm
    const ok = window.confirm("스케줄러에 등록하시겠습니까?");
    if (ok) {
      navigate("/scheduler/schedule");
    }
  };

  return (
    <BasicLayout>
      <div style={styles.container}>
        <h1 style={styles.title}>결제/등록</h1>

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

        {/* 시간 선택 */}
        <section style={styles.section}>
          <label htmlFor="time" style={styles.label}>
            시간 선택
          </label>
          <select
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={styles.select}
          >
            {DUMMY_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
            이전
          </button>
          <button style={styles.primaryBtn} onClick={handlePay}>
            결제하기
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
  title: { marginTop: 0 },
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
  buttonRow: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: "1.2rem",
  },
  primaryBtn: {
    padding: "10px 14px",
    background: "#3F75FF",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 14px",
    background: "#efefef",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default GymPurchasePage;
