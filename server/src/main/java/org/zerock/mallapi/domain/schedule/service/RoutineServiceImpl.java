package org.zerock.mallapi.domain.schedule.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.member.entity.Member;
import org.zerock.mallapi.domain.member.repository.MemberRepository;
import org.zerock.mallapi.domain.schedule.dto.RoutineDTO;
import org.zerock.mallapi.domain.schedule.dto.RoutineItemDTO;
import org.zerock.mallapi.domain.schedule.entity.Routine;
import org.zerock.mallapi.domain.schedule.entity.RoutineItem;
import org.zerock.mallapi.domain.schedule.repository.RoutineItemRepository;
import org.zerock.mallapi.domain.schedule.repository.RoutineRepository;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoutineServiceImpl implements RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineItemRepository routineItemRepository;
    private final MemberRepository memberRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoutineDTO> getRoutines(Long memberNo) {
        return routineRepository.findByMemberMemberNo(memberNo)
                .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoutineDTO getRoutine(Long memberNo, Long routineNo) {
        Routine routine = routineRepository.findByRoutineNoAndMemberMemberNo(routineNo, memberNo)
                .orElseThrow(() -> new IllegalArgumentException("루틴을 찾을 수 없습니다."));
        return toDTO(routine);
    }    @Override
    public RoutineDTO createRoutine(Long memberNo, RoutineDTO dto) {
        Member member = memberRepository.findById(memberNo)
                .orElseThrow(() -> new IllegalArgumentException("회원이 없습니다."));
        
        // routineKey가 없으면 자동 생성
        String routineKey = dto.getRoutineKey();
        if (routineKey == null || routineKey.trim().isEmpty()) {
            routineKey = java.util.UUID.randomUUID().toString();
        }
        
        if (routineRepository.existsByMemberMemberNoAndRoutineKey(memberNo, routineKey)) {
            throw new IllegalArgumentException("이미 존재하는 routine_key 입니다.");
        }        Routine routine = Routine.builder()
                .member(member)
                .routineKey(routineKey)
                .name(dto.getName())
                .color(dto.getColor() != null ? dto.getColor() : "bg-blue-500") // 기본 색상 설정
                .build();

        // items 처리 - 기존 items 형식과 새로운 exerciseList 형식 모두 지원
        java.util.List<RoutineItem> items = new java.util.ArrayList<>();
        
        // 새로운 exerciseList 형식 처리
        if (dto.getExerciseList() != null && !dto.getExerciseList().trim().isEmpty()) {
            String[] exercises = dto.getExerciseList().split("\n");
            for (int i = 0; i < exercises.length; i++) {
                String exercise = exercises[i].trim();
                if (!exercise.isEmpty()) {
                    items.add(RoutineItem.builder()
                            .routine(routine)
                            .sortOrder(i)
                            .content(exercise)
                            .build());
                }
            }
        }
        // 기존 items 형식 처리 (하위 호환성)
        else if (dto.getItems() != null) {
            for (RoutineItemDTO it : dto.getItems()) {
                String content = it.getContent() == null ? "" : it.getContent().trim();
                if (content.isEmpty()) continue;
                int sort = it.getSortOrder() == null ? 0 : it.getSortOrder();
                items.add(RoutineItem.builder()
                        .routine(routine)
                        .sortOrder(Math.max(0, sort))
                        .content(content)
                        .build());
            }
        }
        routine.replaceItems(items);

        Routine saved = routineRepository.save(routine);
        return toDTO(saved);
    }

    @Override
    public RoutineDTO updateRoutine(Long memberNo, RoutineDTO dto) {
        Routine routine = routineRepository.findByRoutineNoAndMemberMemberNo(dto.getRoutineNo(), memberNo)
                .orElseThrow(() -> new IllegalArgumentException("루틴을 찾을 수 없습니다."));

        if (dto.getRoutineKey() != null && !dto.getRoutineKey().equals(routine.getRoutineKey())) {
            if (routineRepository.existsByMemberMemberNoAndRoutineKey(memberNo, dto.getRoutineKey())) {
                throw new IllegalArgumentException("이미 존재하는 routine_key 입니다.");
            }
        }        routine.changeHeader(dto.getRoutineKey(), dto.getName(), dto.getColor());

        // items 업데이트 - exerciseList 형식과 기존 items 형식 모두 지원
        if (dto.getExerciseList() != null || dto.getItems() != null) {
            routineItemRepository.deleteByRoutineRoutineNo(routine.getRoutineNo());

            java.util.List<RoutineItem> items = new java.util.ArrayList<>();
            
            // 새로운 exerciseList 형식 처리
            if (dto.getExerciseList() != null && !dto.getExerciseList().trim().isEmpty()) {
                String[] exercises = dto.getExerciseList().split("\n");
                for (int i = 0; i < exercises.length; i++) {
                    String exercise = exercises[i].trim();
                    if (!exercise.isEmpty()) {
                        items.add(RoutineItem.builder()
                                .routine(routine)
                                .sortOrder(i)
                                .content(exercise)
                                .build());
                    }
                }
            }
            // 기존 items 형식 처리 (하위 호환성)
            else if (dto.getItems() != null) {
                dto.getItems().stream()
                        .sorted(java.util.Comparator.comparing(
                                RoutineItemDTO::getSortOrder,
                                java.util.Comparator.nullsFirst(java.util.Comparator.naturalOrder())))
                        .forEach(it -> {
                            String content = it.getContent() == null ? "" : it.getContent().trim();
                            if (content.isEmpty()) return;
                            int sort = it.getSortOrder() == null ? 0 : it.getSortOrder();
                            items.add(RoutineItem.builder()
                                    .routine(routine)
                                    .sortOrder(Math.max(0, sort))
                                    .content(content)
                                    .build());
                        });
            }

            routine.replaceItems(items);
        }

        return toDTO(routineRepository.save(routine));
    }

    @Override
    public void deleteRoutine(Long memberNo, Long routineNo) {
        Routine routine = routineRepository.findByRoutineNoAndMemberMemberNo(routineNo, memberNo)
                .orElseThrow(() -> new IllegalArgumentException("루틴을 찾을 수 없습니다."));
        routineRepository.delete(routine);
    }    private RoutineDTO toDTO(Routine r) {
        List<RoutineItemDTO> itemDTOs = r.getItems() == null ? List.of() :
                r.getItems().stream()
                        .sorted(Comparator.comparingInt(a -> a.getSortOrder() == null ? 0 : a.getSortOrder()))
                        .map(it -> RoutineItemDTO.builder()
                                .routineItemNo(it.getRoutineItemNo())
                                .sortOrder(it.getSortOrder())
                                .content(it.getContent())
                                .build())
                        .toList();
        
        // exerciseList 생성 (items를 줄바꿈으로 연결)
        String exerciseList = itemDTOs.stream()
                .map(RoutineItemDTO::getContent)
                .filter(content -> content != null && !content.trim().isEmpty())
                .reduce((a, b) -> a + "\n" + b)
                .orElse("");
        
        return RoutineDTO.builder()
                .routineNo(r.getRoutineNo())
                .memberNo(r.getMember().getMemberNo())
                .routineKey(r.getRoutineKey())
                .name(r.getName())
                .description(r.getName() + " 루틴입니다.") // 기본 설명
                .exerciseList(exerciseList)
                .color(r.getColor())
                .items(itemDTOs)
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}