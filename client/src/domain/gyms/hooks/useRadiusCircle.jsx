import { useEffect } from "react";

const useRadiusCircle = ({
  mapRef,
  circleRef,
  userPos,
  radius,
  showRadius,
  onlyInRadius,
}) => {
  useEffect(() => {
    if (!mapRef.current) return;
    if (circleRef.current) circleRef.current.setMap(null);
    if (showRadius && onlyInRadius && userPos) {
      circleRef.current = new window.kakao.maps.Circle({
        center: userPos,
        radius,
        strokeWeight: 2,
        strokeColor: "#14b8a6",
        strokeOpacity: 0.8,
        fillColor: "#14b8a6",
        fillOpacity: 0.2,
        map: mapRef.current,
      });
    }
  }, [userPos, radius, showRadius, onlyInRadius, mapRef, circleRef]);
};

export default useRadiusCircle;
