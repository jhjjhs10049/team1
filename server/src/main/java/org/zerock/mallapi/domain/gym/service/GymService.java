package org.zerock.mallapi.domain.gym.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.gym.dto.FavoriteListDTO;
import org.zerock.mallapi.domain.gym.dto.GymDetailDTO;
import org.zerock.mallapi.domain.gym.dto.GymListItemDTO;
import org.zerock.mallapi.domain.gym.dto.GymUpsertDTO;

import java.util.List;
import java.util.Map;

public interface GymService {
    public GymDetailDTO getGym(Long gymNo, Long memberNo);
    Map<String, Object> setFavorite(Long gymNo, Long memberNo, boolean favorite);
    Page<GymListItemDTO> searchGyms(String q, Double lat, Double lng, Integer radius, Pageable pageable);
    List<FavoriteListDTO> getFavoriteGyms(Long memberNo);

    @Transactional
    GymDetailDTO updateGym(Long gymNo, GymUpsertDTO dto, Long actorMemberNo);

    @Transactional
    GymDetailDTO createGym(GymUpsertDTO dto, Long actorMemberNo);

    @Transactional
    void deleteGym(Long gymNo, Long actorMemberNo);
}