import jwtAxios from "../../member/util/JWTUtil";

// ----- Routines -----
export const fetchRoutines = () =>
  jwtAxios.get(`/api/routines`).then((res) => res.data);

export const fetchRoutineDetail = (routineNo) =>
  jwtAxios.get(`/api/routines/${routineNo}`).then((res) => res.data);

export const createRoutine = (dto) =>
  jwtAxios.post(`/api/routines`, dto).then((res) => res.data);

export const updateRoutine = (routineNo, dto) =>
  jwtAxios.put(`/api/routines/${routineNo}`, dto).then((res) => res.data);

export const deleteRoutine = (routineNo) =>
  jwtAxios.delete(`/api/routines/${routineNo}`).then((res) => res.data);

// ----- Schedules -----
const toISODate = (d) => {
  if (!d) return null;

  // Date 객체인 경우
  if (d instanceof Date) {
    return d.toISOString().slice(0, 10);
  }

  // 문자열인 경우
  if (typeof d === "string") {
    // 이미 YYYY-MM-DD 형식인지 확인
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return d;
    }
    // 다른 형식의 문자열이면 Date로 변환
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  // 배열이나 객체인 경우 오류 발생
  if (Array.isArray(d) || typeof d === "object") {
    console.error("Invalid date parameter: received array or object", d);
    throw new Error(
      `Invalid date parameter: expected string or Date, got ${typeof d}`
    );
  }

  // 그 외의 경우 문자열로 변환 시도
  return String(d);
};

const toISODateTime = (d) => {
  if (!d) return null;

  // Date 객체인 경우
  if (d instanceof Date) {
    return d.toISOString();
  }

  // 문자열인 경우
  if (typeof d === "string") {
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    return d; // 이미 ISO 형식이라 가정
  }

  // 배열이나 객체인 경우 오류 발생
  if (Array.isArray(d) || typeof d === "object") {
    console.error("Invalid datetime parameter: received array or object", d);
    throw new Error(
      `Invalid datetime parameter: expected string or Date, got ${typeof d}`
    );
  }

  return String(d);
};

export const fetchSchedulesByDate = (date) => {
  const d = toISODate(date);
  if (!d) {
    return Promise.reject(new Error("Invalid date parameter"));
  }
  return jwtAxios.get(`/api/schedules/day/${d}`).then((res) => res.data);
};

export const fetchSchedulesByRange = (from, to) => {
  const f = toISODate(from);
  const t = toISODate(to);
  if (!f || !t) {
    return Promise.reject(new Error("Invalid date range parameters"));
  }
  return jwtAxios
    .get(`/api/schedules`, { params: { from: f, to: t } })
    .then((res) => res.data);
};

export const fetchSchedulesByStartTime = (from, to) => {
  const f = toISODateTime(from);
  const t = toISODateTime(to);
  if (!f || !t) {
    return Promise.reject(new Error("Invalid datetime range parameters"));
  }
  return jwtAxios
    .get(`/api/schedules/range`, { params: { from: f, to: t } })
    .then((res) => res.data);
};

export const createSchedule = (dto) =>
  jwtAxios.post(`/api/schedules`, dto).then((res) => res.data);

export const updateSchedule = (scheduleNo, dto) =>
  jwtAxios.put(`/api/schedules/${scheduleNo}`, dto).then((res) => res.data);

export const setScheduleCompleted = (scheduleNo, value) =>
  jwtAxios
    .patch(`/api/schedules/${scheduleNo}/completed`, null, {
      params: { value },
    })
    .then((res) => res.data);

export const deleteSchedule = (scheduleNo) =>
  jwtAxios.delete(`/api/schedules/${scheduleNo}`).then((res) => res.data);

// ----- Today Stat -----
export const fetchTodayStat = (date) => {
  const d = toISODate(date);
  if (!d) {
    return Promise.reject(new Error("Invalid date parameter"));
  }
  return jwtAxios
    .get(`/api/stats/today`, { params: { date: d } })
    .then((res) => res.data);
};

export const upsertTodayStat = (dto) =>
  jwtAxios.put(`/api/stats/today`, dto).then((res) => res.data);

// ----- Weekly Goal -----
export const fetchWeeklyGoal = (weekStart) => {
  const w = toISODate(weekStart);
  if (!w) {
    return Promise.reject(new Error("Invalid weekStart parameter"));
  }
  return jwtAxios
    .get(`/api/weekly-goal`, { params: { weekStart: w } })
    .then((res) => res.data);
};

export const upsertWeeklyGoal = (dto) =>
  jwtAxios.put(`/api/weekly-goal`, dto).then((res) => res.data);
