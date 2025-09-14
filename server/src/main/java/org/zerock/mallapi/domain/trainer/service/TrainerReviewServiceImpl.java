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

    @Override
    public void createTestReviewData() {
        // 기존 트레이너와 멤버 조회
        List<Trainer> trainers = trainerRepository.findAll();
        List<Member> members = memberRepository.findAll();

        if (trainers.isEmpty() || members.isEmpty()) {
            throw new IllegalStateException("트레이너 또는 회원 데이터가 없습니다. 먼저 기본 데이터를 생성해주세요.");
        }

        // 다양한 리뷰 댓글과 점수 배열
        String[] reviewComments = {
            "정말 친절하고 운동 지도를 잘해주세요! 추천합니다.",
            "체계적인 운동 계획으로 목표를 달성할 수 있었어요.",
            "전문적인 지식과 경험이 풍부한 트레이너입니다.",
            "운동이 재미있어졌어요. 감사합니다!",
            "PT 받은 후 확실히 실력이 늘었습니다.",
            "꼼꼼하게 자세 교정도 해주시고 만족해요.",
            "운동 초보자도 쉽게 따라할 수 있도록 도와주셔서 좋았습니다.",
            "멘탈도 관리해주시면서 운동 동기부여가 되었어요.",
            "개인 맞춤형 운동으로 효과를 확실히 봤습니다.",
            "다음에도 또 PT 받고 싶어요!"
        };
        
        double[] scores = {4.5, 5.0, 4.0, 4.8, 5.0, 4.2, 4.7, 4.9, 4.6, 5.0};

        // 각 트레이너에 대해 3-5개의 리뷰 생성
        for (Trainer trainer : trainers) {
            int reviewCount = 3 + (int)(Math.random() * 3); // 3-5개
            
            for (int i = 0; i < reviewCount; i++) {
                Member randomMember = members.get((int)(Math.random() * members.size()));
                String comment = reviewComments[i % reviewComments.length];
                double score = scores[i % scores.length];
                
                // 중복 리뷰 확인 (같은 트레이너에 같은 사용자가 리뷰를 남기지 않도록)
                boolean exists = trainerReviewRepository.findByTrainer_TrainerNo(trainer.getTrainerNo())
                    .stream()
                    .anyMatch(review -> review.getWriter().getMemberNo().equals(randomMember.getMemberNo()));
                
                if (!exists) {
                    TrainerReview review = TrainerReview.builder()
                        .trainer(trainer)
                        .writer(randomMember)
                        .score(score)
                        .comment(comment)
                        .build();
                    
                    trainerReviewRepository.save(review);
                }
            }
        }
    }
}