package org.zerock.mallapi.domain.trainer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.gym.entity.Gym;
import org.zerock.mallapi.domain.gym.repository.GymRepository;
import org.zerock.mallapi.domain.trainer.dto.TrainerDetailDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerListItemDTO;
import org.zerock.mallapi.domain.trainer.dto.TrainerUpsertDTO;
import org.zerock.mallapi.domain.trainer.entity.Trainer;
import org.zerock.mallapi.domain.trainer.repository.TrainerRepository;
import org.zerock.mallapi.domain.trainer.repository.TrainerReviewRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrainerServiceImpl implements TrainerService {

    private final TrainerRepository trainerRepository;
    private final TrainerReviewRepository trainerReviewRepository;
    private final GymRepository gymRepository;

    /** 트레이너 목록 조회 */
    @Override
    public List<TrainerListItemDTO> list(String q, Long gymNo, Integer limit) {
        List<Trainer> trainers = trainerRepository.findAll();

        return trainers.stream()
                .filter(t -> q == null || q.isBlank()
                        || t.getName().contains(q)
                        || (t.getSpecialty() != null && t.getSpecialty().contains(q)))
                .filter(t -> gymNo == null || (t.getGym() != null && t.getGym().getGymNo().equals(gymNo)))
                .limit(limit != null && limit > 0 ? limit : 30)
                .map(t -> {
                    Double avg = trainerReviewRepository.getAverageScoreByTrainerNo(t.getTrainerNo());
                    long cnt = trainerReviewRepository.countByTrainer_TrainerNo(t.getTrainerNo());
                    Gym g = t.getGym();

                    return TrainerListItemDTO.builder()
                            .trainerNo(t.getTrainerNo())
                            .name(t.getName())
                            .photo(t.getPhoto())
                            .gymNo(g != null ? g.getGymNo() : null)
                            .gymTitle(g != null ? g.getTitle() : null)
                            .specialty(t.getSpecialty())
                            .rate(avg != null ? avg : 0)
                            .reviewCount(cnt)
                            .build();
                })
                .toList();
    }

    /** 트레이너 상세 조회 */
    @Override
    public TrainerDetailDTO get(Long trainerNo) {
        Trainer t = trainerRepository.findById(trainerNo)
                .orElseThrow(() -> new IllegalArgumentException("트레이너가 없습니다."));

        Double avg = trainerReviewRepository.getAverageScoreByTrainerNo(trainerNo);
        long cnt = trainerReviewRepository.countByTrainer_TrainerNo(trainerNo);
        Gym g = t.getGym();

        return TrainerDetailDTO.builder()
                .trainerNo(t.getTrainerNo())
                .name(t.getName())
                .photo(t.getPhoto())
                .gymNo(g != null ? g.getGymNo() : null)
                .gymTitle(g != null ? g.getTitle() : null)
                .specialty(t.getSpecialty())
                .rate(avg != null ? avg : 0)
                .reviewCount(cnt)
                .build();
    }

    /** 트레이너 등록 */
    @Transactional
    @Override
    public TrainerDetailDTO createTrainer(TrainerUpsertDTO dto) {
        Gym gym = gymRepository.findById(dto.getGymNo())
                .orElseThrow(() -> new IllegalArgumentException("해당 Gym이 존재하지 않습니다."));

        Trainer trainer = Trainer.builder()
                .name(dto.getName())
                .photo(dto.getPhoto())
                .specialty(dto.getSpecialty())
                .gym(gym)
                .build();

        Trainer saved = trainerRepository.save(trainer);

        return TrainerDetailDTO.builder()
                .trainerNo(saved.getTrainerNo())
                .name(saved.getName())
                .photo(saved.getPhoto())
                .gymNo(saved.getGym().getGymNo())
                .gymTitle(saved.getGym().getTitle())
                .specialty(saved.getSpecialty())
                .rate(0.0)
                .reviewCount(0)
                .build();
    }

    /** 트레이너 수정 */
    @Transactional
    @Override
    public TrainerDetailDTO updateTrainer(Long trainerNo, TrainerUpsertDTO dto) {
        Trainer trainer = trainerRepository.findById(trainerNo)
                .orElseThrow(() -> new IllegalArgumentException("트레이너가 없습니다."));

        Gym gym = gymRepository.findById(dto.getGymNo())
                .orElseThrow(() -> new IllegalArgumentException("해당 Gym이 존재하지 않습니다."));

        trainer.update(dto.getName(), dto.getPhoto(), gym, dto.getSpecialty());

        return TrainerDetailDTO.builder()
                .trainerNo(trainer.getTrainerNo())
                .name(trainer.getName())
                .photo(trainer.getPhoto())
                .gymNo(gym.getGymNo())
                .gymTitle(gym.getTitle())
                .specialty(trainer.getSpecialty())
                .rate(trainerReviewRepository.getAverageScoreByTrainerNo(trainer.getTrainerNo()))
                .reviewCount(trainerReviewRepository.countByTrainer_TrainerNo(trainer.getTrainerNo()))
                .build();
    }

    /** 트레이너 삭제 */
    @Transactional
    @Override
    public void deleteTrainer(Long trainerNo) {
        Trainer trainer = trainerRepository.findById(trainerNo)
                .orElseThrow(() -> new IllegalArgumentException("트레이너가 없습니다."));
        trainerRepository.delete(trainer);
    }
}