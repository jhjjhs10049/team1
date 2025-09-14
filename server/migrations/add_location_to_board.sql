-- 게시판 테이블에 위치 정보 필드 추가
-- 실행 전에 반드시 데이터베이스 백업을 수행하세요!

USE team_db;

-- 위치 정보 컬럼 추가
ALTER TABLE board 
ADD COLUMN location_lat DOUBLE NULL COMMENT '위도',
ADD COLUMN location_lng DOUBLE NULL COMMENT '경도',
ADD COLUMN location_address VARCHAR(500) NULL COMMENT '주소';

-- 인덱스 추가 (위치 기반 검색 성능 향상)
CREATE INDEX idx_board_location ON board(location_lat, location_lng);

-- 컬럼 추가 확인
DESCRIBE board;

-- 샘플 데이터로 테스트 (선택사항)
-- INSERT INTO board (writer_id, title, content, location_lat, location_lng, location_address, created_at, updated_at) 
-- VALUES (1, '테스트 게시글', '위치 정보가 포함된 테스트 게시글입니다.', 37.5665, 126.9780, '서울특별시 중구 태평로1가 31', NOW(), NOW());

-- 마이그레이션 완료 확인
SELECT 
    COUNT(*) as total_posts,
    COUNT(location_lat) as posts_with_location,
    ROUND(COUNT(location_lat) * 100.0 / COUNT(*), 2) as location_percentage
FROM board 
WHERE is_deleted = false;