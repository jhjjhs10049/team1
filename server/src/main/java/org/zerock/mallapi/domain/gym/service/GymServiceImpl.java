package org.zerock.mallapi.domain.gym.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.gym.dto.*;
import org.zerock.mallapi.domain.gym.entity.FavoriteGyms;
import org.zerock.mallapi.domain.gym.entity.Gym;
import org.zerock.mallapi.domain.gym.repository.FavoriteGymsRepository;
import org.zerock.mallapi.domain.gym.repository.GymRepository;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.trainer.dto.TrainerDTO;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
@Log4j2
public class GymServiceImpl implements GymService {

    private final GymRepository gymRepository;
    private final FavoriteGymsRepository favoriteGymsRepository;
    private final MemberRepository memberRepository;
    private final GymReviewService gymReviewService;

    @Override
    public GymDetailDTO getGym(Long gymNo, Long memberNo) {
        Gym gym = gymRepository.findById(gymNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 헬스장이 없습니다."));

        Double rate = gymReviewService.getAverageScore(gymNo);
        List<TrainerDTO> trainers = gym.getTrainerList().stream()
                .map(t -> TrainerDTO.builder()
                        .trainerNo(t.getTrainerNo())
                        .name(t.getName())
                        .photo(t.getPhoto()) // trainer 엔티티에서 photo 정보 추가
                        .specialty(t.getSpecialty())
                        .gymNo(gymNo) // 파라미터로 받은 gymNo를 사용
                        .build())
                .toList();

        List<GymReviewDTO> reviews = gymReviewService.getReviewsByGym(gymNo);

        boolean isFavorite = memberNo != null &&
                favoriteGymsRepository.existsByMember_MemberNoAndGym_GymNo(memberNo, gymNo);
        int favoriteCount = favoriteGymsRepository.countByGym_GymNo(gymNo);

        return GymDetailDTO.builder()
                .gymNo(gym.getGymNo())
                .title(gym.getTitle())
                .content(gym.getContent())
                .address(gym.getAddress())
                .phoneNumber(gym.getPhoneNumber())
                .openingHours(gym.getOpeningHours())
                .facilities(gym.getFacilities())
                .rate(rate)
                .imageList(gym.getImageList())
                .trainers(trainers)
                .reviews(reviews)
                .locationX(gym.getLocationX())
                .locationY(gym.getLocationY())
                .isFavorite(isFavorite)
                .favoriteCount(favoriteCount)
                .build();
    }

    @Transactional
    @Override
    public Map<String, Object> setFavorite(Long gymNo, Long memberNo, boolean favorite) {
        Gym gym = gymRepository.findById(gymNo)
                .orElseThrow(() -> new IllegalArgumentException("헬스장이 없습니다."));

        // ⭐ 수정: getReferenceById 대신 findById를 사용하여 회원의 존재 여부를 확인
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));

        favoriteGymsRepository.findByMemberAndGym(member, gym).ifPresentOrElse(existing -> {
            if (!favorite) {
                favoriteGymsRepository.delete(existing);
            }
        }, () -> {
            if (favorite) {
                favoriteGymsRepository.save(
                        FavoriteGyms.builder().member(member).gym(gym).createdDate(LocalDateTime.now()).build()
                );
            }
        });

        return Map.of(
                "isFavorite", favoriteGymsRepository.existsByMember_MemberNoAndGym_GymNo(memberNo, gymNo),
                "favoriteCount", favoriteGymsRepository.countByGym_GymNo(gymNo)
        );
    }

    @Override
    public Page<GymListItemDTO> searchGyms(String q, Double lat, Double lng, Integer radius, Pageable pageable) {
        final String query = (q == null) ? "" : q.trim();

        log.info(pageable.getPageNumber());
        log.info(pageable.getPageSize());
        log.info("여기 안찍혀?");

        if (lat != null && lng != null && radius != null && radius > 0) {
            Page<Object[]> rows = gymRepository.searchByKeywordWithinRadiusRaw(query, lat, lng, radius, pageable);
            return rows.map(this::mapListRowWithDistance);
        }

        Page<Object[]> rows = gymRepository.searchByKeywordRaw(query, pageable);
        System.out.println("totalElements = " + rows.getTotalElements());
        System.out.println("content size = " + rows.getContent().size());
        rows.getContent().forEach(r -> System.out.println(Arrays.toString(r)));

        return rows.map(this::mapListRow);
    }

    // [gym_no, title, address, location_x, location_y, rate]
    private GymListItemDTO mapListRow(Object[] r) {
        return GymListItemDTO.builder()
                .gymNo(((Number) r[0]).longValue())
                .title((String) r[1])
                .address((String) r[2])
                .locationX(r[3] == null ? null : ((Number) r[3]).doubleValue())
                .locationY(r[4] == null ? null : ((Number) r[4]).doubleValue())
                .rate(r[5] == null ? 0.0 : ((Number) r[5]).doubleValue())
                .distance(null)
                .build();
    }

    // [gym_no, title, address, location_x, location_y, rate, distance]
    private GymListItemDTO mapListRowWithDistance(Object[] r) {
        return GymListItemDTO.builder()
                .gymNo(((Number) r[0]).longValue())
                .title((String) r[1])
                .address((String) r[2])
                .locationX(r[3] == null ? null : ((Number) r[3]).doubleValue())
                .locationY(r[4] == null ? null : ((Number) r[4]).doubleValue())
                .rate(r[5] == null ? 0.0 : ((Number) r[5]).doubleValue())
                .distance(r[6] == null ? null : ((Number) r[6]).doubleValue())
                .build();
    }

    @Override
    public List<FavoriteListDTO> getFavoriteGyms(Long memberNo) {
        List<FavoriteGyms> favorites = favoriteGymsRepository.findByMember_MemberNo(memberNo);

        return favorites.stream()
                .map(favorite -> {
                    Gym gym = favorite.getGym();
                    return FavoriteListDTO.builder()
                            .gymNo(gym.getGymNo())
                            .title(gym.getTitle())
                            .address(gym.getAddress())
                            .imageUrl(gym.getImageList().isEmpty() ? null : gym.getImageList().get(0))
                            .rate(gymReviewService.getAverageScore(gym.getGymNo()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public GymDetailDTO createGym(GymUpsertDTO dto, Long actorMemberNo) {
        // ★ DB에서 실제 Member 엔티티 조회 (FK 안전 보장)
        Member writer = memberRepository.findById(actorMemberNo)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원을 찾을 수 없습니다."));

        Gym gym = Gym.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .address(dto.getAddress())
                .phoneNumber(dto.getPhoneNumber())
                .openingHours(dto.getOpeningHours())
                .facilities(new ArrayList<>(dto.getFacilities()))
                .imageList(new ArrayList<>(dto.getImageList()))
                .locationX(dto.getLocationX())
                .locationY(dto.getLocationY())
                .writer(writer)   // ← 반드시 실제 Member 엔티티를 세팅
                .build();

        gymRepository.save(gym);

        return getGym(gym.getGymNo(), actorMemberNo);
    }

    @Transactional
    @Override
    public GymDetailDTO updateGym(Long gymNo, GymUpsertDTO dto, Long actorMemberNo) {
        // 수정은 영속 엔티티에 도메인 메서드로 반영 (세터 없음)
        Gym gym = gymRepository.findById(gymNo)
                .orElseThrow(() -> new IllegalArgumentException("헬스장을 찾을 수 없습니다."));

        gym.applyUpsert(
                dto.getTitle(), dto.getContent(), dto.getAddress(),
                dto.getPhoneNumber(), dto.getOpeningHours(),
                dto.getFacilities(), dto.getImageList(),
                dto.getLocationX(), dto.getLocationY()
        );
        // 더티체킹으로 UPDATE

        return getGym(gymNo, actorMemberNo);
    }

    @Transactional
    @Override
    public void deleteGym(Long gymNo, Long actorMemberNo) {
        Gym gym = gymRepository.findById(gymNo)
                .orElseThrow(() -> new IllegalArgumentException("헬스장을 찾을 수 없습니다."));
        // trainers, reviews는 orphanRemoval=true라 함께 정리됨
        gymRepository.delete(gym);
    }
}