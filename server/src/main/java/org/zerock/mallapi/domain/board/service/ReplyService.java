package org.zerock.mallapi.domain.board.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.mallapi.domain.board.entity.Reply;

import java.util.List;

public interface ReplyService {
    Page<Reply> list(Long boardId, Pageable pageable);

    Long create(Long boardId, Long writerId, String content);

    // 수정: 작성자만 가능
    void update(Long replyId, String content, Long currentUserId);

    // 삭제: 작성자 또는 관리자 가능
    void delete(Long replyId, Long currentUserId, boolean isAdmin);

    List<Reply> listAll(Long boardId);
}