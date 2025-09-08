package org.zerock.mallapi.domain.schedule.service;

import org.zerock.mallapi.domain.schedule.dto.RoutineDTO;

import java.util.List;

public interface RoutineService {
    List<RoutineDTO> getRoutines(Long memberNo);
    RoutineDTO getRoutine(Long memberNo, Long routineNo);
    RoutineDTO createRoutine(Long memberNo, RoutineDTO dto);
    RoutineDTO updateRoutine(Long memberNo, RoutineDTO dto);
    void deleteRoutine(Long memberNo, Long routineNo);
}