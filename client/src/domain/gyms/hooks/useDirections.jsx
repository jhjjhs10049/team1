const useDirections = ({ selectedGym, userPos, userPosXY }) => {
    const openKakaoRouteToSelected = () => {
        if (!selectedGym) return;

        const startLatLng =
            userPos ?? (userPosXY && new window.kakao.maps.LatLng(userPosXY.lat, userPosXY.lng));
        if (!startLatLng) return;

        const gLat = Number(selectedGym.locationY ?? selectedGym.lat);
        const gLng = Number(selectedGym.locationX ?? selectedGym.lng);
        if (!Number.isFinite(gLat) || !Number.isFinite(gLng)) return;

        const s = startLatLng.toCoords(); // kakao.maps.Coords (WCONG)
        const e = new window.kakao.maps.LatLng(gLat, gLng).toCoords();

        const sName = encodeURIComponent("내 위치");
        const eName = encodeURIComponent(selectedGym.title || selectedGym.name || "목적지");
        const url = `https://map.kakao.com/?sX=${s.getX()}&sY=${s.getY()}&sName=${sName}&eX=${e.getX()}&eY=${e.getY()}&eName=${eName}`;

        window.open(url, "_blank", "noopener");
    };

    return { openKakaoRouteToSelected };
}

export default useDirections;

// 최소 단순화 버전 - 위경도(lat/lng) 기반 → Kakao 지도 길찾기 링크 열기 (위 코드는 오류, 입력 데이터의 형식의 불일치를 고려해 분기 처리가 포함된 코드임.)
// const useDirections({ selectedGym, userPos }) {
//     const openKakaoRouteToSelected = () => {
//         const s = userPos.toCoords();
//         const e = new window.kakao.maps.LatLng(selectedGym.lat, selectedGym.lng).toCoords();

//         const url = `https://map.kakao.com/?sX=${s.getX()}&sY=${s.getY()}&sName=${encodeURIComponent("내 위치")}&eX=${e.getX()}&eY=${e.getY()}&eName=${encodeURIComponent(selectedGym.name || "목적지")}`;

//         window.open(url, "_blank", "noopener");
//     };

//     return { openKakaoRouteToSelected };
// }