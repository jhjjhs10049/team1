package org.zerock.mallapi.domain.board.dto;

import lombok.*;
import org.zerock.mallapi.domain.board.entity.Board;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BoardDto {
    private Long bno;
    private Long writerId;
    private String title;
    private String content;
    private String writerEmail;
    private String writerName;
    private Integer viewCount;
    private Long replyCount;
    private Board.PostType postType;
    private List<BoardImageDto> images;
    private LocalDateTime regDate;
    private LocalDateTime modDate;
}
