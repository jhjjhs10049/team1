package org.zerock.mallapi.domain.board.dto;

import lombok.*;
import org.zerock.mallapi.domain.board.entity.Board;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class BoardDetailDto {
    private Long bno;
    private Long writerId;
    private String writerEmail;
    private String title;
    private String content;
    private String writerName;
    private Integer viewCount;
    private Board.PostType postType;
    private List<BoardImageDto> images;
    private List<ReplyDto> replies;
    private LocalDateTime regDate;
    private LocalDateTime modDate;
}