package org.zerock.mallapi.domain.board.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplyDto {
    private Long id;
    private Long boardId;
    private Long writerId;
    private String writerEmail; // 🔹 추가
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}