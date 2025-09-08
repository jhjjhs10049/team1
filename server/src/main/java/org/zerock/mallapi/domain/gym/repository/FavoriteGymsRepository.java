package org.zerock.mallapi.domain.gym.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.mallapi.domain.gym.entity.FavoriteGyms;
import org.zerock.mallapi.domain.gym.entity.Gym;
import org.zerock.mallapi.domain.member.entity.Member;

import java.util.List;
import java.util.Optional;

public interface FavoriteGymsRepository extends JpaRepository<FavoriteGyms, Long> {
    boolean existsByMember_MemberNoAndGym_GymNo(Long memberNo, Long gymNo);
    int countByGym_GymNo(Long gymNo);
    Optional<FavoriteGyms> findByMemberAndGym(Member member, Gym gym);
    List<FavoriteGyms> findByMember_MemberNo(Long memberNo);
}