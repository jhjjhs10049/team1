// client/src/domain/tip/hooks/useRandomTip.js
import { useState, useEffect } from 'react';
import { fetchRandomTip } from '../api/fitnessTipApi';

const useRandomTip = () => {
    const [tip, setTip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadRandomTip = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchRandomTip();

                if (isMounted) {
                    setTip(data);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('랜덤 팁 로딩 실패:', err);
                    setError('운동 팁을 불러오는데 실패했습니다.');
                    // 기본 팁 설정
                    setTip({
                        content: '꾸준한 운동이 건강의 비결입니다!'
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadRandomTip();

        return () => {
            isMounted = false;
        };
    }, []);

    return { tip, loading, error };
};

export default useRandomTip;