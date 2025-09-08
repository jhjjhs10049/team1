package org.zerock.mallapi.global.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@ToString
public class PageResponseDTO<E> {

    private int page;
    private int size;
    private int total;

    // 실제 목록 데이터
    private List<E> dtoList;

    // 시작 페이지 번호
    private int start;
    // 끝 페이지 번호  
    private int end;

    // 이전 페이지의 존재 여부
    private boolean prev;
    // 다음 페이지의 존재 여부
    private boolean next;

    // 전체 페이지 수
    private int totalCount;
    // 이전 페이지 번호
    private int prevPage;
    // 다음 페이지 번호
    private int nextPage;
    // 현재 페이지 번호
    private int current;

    @Builder(builderMethodName = "withAll")
    public PageResponseDTO(PageRequestDTO pageRequestDTO, List<E> dtoList, long totalCount) {

        if (totalCount <= 0) {
            return;
        }

        this.page = pageRequestDTO.getPage() + 1; // 1부터 시작하도록
        this.size = pageRequestDTO.getSize();
        this.total = (int) totalCount;
        this.dtoList = dtoList;

        // 마지막 페이지 번호 계산
        int tempEnd = (int) (Math.ceil(this.page / 10.0)) * 10;

        this.start = tempEnd - 9;

        // 전체 페이지 번호 계산
        int last = (int) (Math.ceil((totalCount / (double) size)));

        this.end = tempEnd > last ? last : tempEnd;

        this.prev = this.start > 1;

        this.next = totalCount > tempEnd * size;

        this.totalCount = (int) totalCount;
        this.prevPage = this.prev ? this.start - 1 : 0;
        this.nextPage = this.next ? this.end + 1 : 0;
        this.current = this.page;
    }
}
