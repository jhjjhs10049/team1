-- chat_message 테이블의 charset을 UTF8MB4로 변경하는 마이그레이션 스크립트
-- UTF8MB4는 이모지 및 다양한 유니코드 문자를 지원합니다.

-- 1:1 채팅 chat_message 테이블의 charset을 UTF8MB4로 변경
USE yunsung0732;

-- 현재 테이블 구조 확인
SHOW CREATE TABLE chat_message;

-- chat_message 테이블의 message 컬럼을 UTF8MB4로 변경
ALTER TABLE chat_message 
MODIFY COLUMN message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

-- 테이블 전체 charset도 UTF8MB4로 변경 (더 안전한 방법)
ALTER TABLE chat_message CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 변경 후 확인
SHOW CREATE TABLE chat_message;

-- 테스트용 이모지 삽입 (선택사항)
-- INSERT INTO chat_message (chat_room_no, sender_no, message, message_type, sent_at, read_status, delete_status) 
-- VALUES (1, 1, '😀😂❤️👍👎😢😮😡✨🎉', 'USER', NOW(), 'N', 'N');
