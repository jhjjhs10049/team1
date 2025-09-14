-- fitness_tips 테이블 생성
CREATE TABLE fitness_tips (
    tip_no BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(500) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(100) NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date DATETIME ON UPDATE CURRENT_TIMESTAMP,
    modified_by VARCHAR(100)
);

-- 기본 운동 팁 데이터 삽입
INSERT INTO fitness_tips (content, created_by) VALUES
('꾸준한 스트레칭은 부상의 위험을 줄여줍니다!', 'system'),
('운동 전 5분 워밍업은 필수입니다.', 'system'),
('물을 충분히 마시며 운동하세요.', 'system'),
('운동 후 단백질 섭취는 근육 회복에 도움이 됩니다.', 'system'),
('주 3회 이상 꾸준한 운동이 효과적입니다.', 'system'),
('충분한 수면은 운동 효과를 높입니다.', 'system'),
('과도한 운동보다는 꾸준한 운동이 중요합니다.', 'system'),
('운동 중 올바른 자세를 유지하세요.', 'system'),
('운동 강도는 서서히 늘려가는 것이 좋습니다.', 'system'),
('운동 후 쿨다운 스트레칭을 잊지 마세요.', 'system'),
('근력 운동과 유산소 운동을 균형있게 하세요.', 'system'),
('운동 일지를 작성하면 동기부여에 도움이 됩니다.', 'system'),
('부상이 있을 때는 무리하지 말고 휴식을 취하세요.', 'system'),
('운동 전후 영양 섭취도 중요합니다.', 'system'),
('다양한 운동을 통해 전신을 골고루 발달시키세요.', 'system');