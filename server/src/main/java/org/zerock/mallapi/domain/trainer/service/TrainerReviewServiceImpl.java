package org.zerock.mallapi.domain.trainer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.entity.MemberRole;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.trainer.dto.TrainerReviewDTO;
import org.zerock.mallapi.domain.trainer.entity.Trainer;
import org.zerock.mallapi.domain.trainer.entity.TrainerReview;
import org.zerock.mallapi.domain.trainer.repository.TrainerRepository;
import org.zerock.mallapi.domain.trainer.repository.TrainerReviewRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrainerReviewServiceImpl implements TrainerReviewService {

    private final TrainerReviewRepository trainerReviewRepository;
    private final TrainerRepository trainerRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TrainerReviewDTO> getReviewsByTrainer(Long trainerNo) {
        return trainerReviewRepository.findByTrainer_TrainerNo(trainerNo).stream()
                .map(r -> TrainerReviewDTO.builder()
                        .reviewNo(r.getReviewNo())
                        .score(r.getScore())
                        .trainerNo(trainerNo)
                        .writerNo(r.getWriter().getMemberNo())
                        .writerNickname(r.getWriter().getNickname())
                        .comment(r.getComment())
                        .createdDate(r.getCreatedDate())
                        .modifiedDate(r.getModifiedDate())
                        .build())
                .toList();
    }

    @Override
    public TrainerReviewDTO addReview(TrainerReviewDTO dto) {
        Trainer trainer = trainerRepository.findById(dto.getTrainerNo())
                .orElseThrow(() -> new IllegalArgumentException("트레이너가 없습니다."));
        Member writer = memberRepository.findById(dto.getWriterNo())
                .orElseThrow(() -> new IllegalArgumentException("작성자가 없습니다."));

        TrainerReview review = TrainerReview.builder()
                .trainer(trainer)
                .writer(writer)
                .score(dto.getScore())
                .comment(dto.getComment())
                .build();

        TrainerReview saved = trainerReviewRepository.save(review);

        return TrainerReviewDTO.builder()
                .reviewNo(saved.getReviewNo())
                .score(saved.getScore())
                .trainerNo(saved.getTrainer().getTrainerNo())
                .writerNo(saved.getWriter().getMemberNo())
                .writerNickname(saved.getWriter().getNickname())
                .comment(saved.getComment())
                .createdDate(saved.getCreatedDate())
                .modifiedDate(saved.getModifiedDate())
                .build();
    }

    @Override
    public void deleteReview(Long reviewNo, Long memberNo) {
        TrainerReview review = trainerReviewRepository.findById(reviewNo)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 권한: ADMIN은 모두, USER는 본인만
        if (member.getRole() != MemberRole.ADMIN && !review.getWriter().getMemberNo().equals(member.getMemberNo())) {
            throw new SecurityException("리뷰를 삭제할 권한이 없습니다.");
        }

        trainerReviewRepository.delete(review);
    }
}