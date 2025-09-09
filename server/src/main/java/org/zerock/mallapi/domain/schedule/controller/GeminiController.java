package org.zerock.mallapi.domain.schedule.controller;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";


    @PostMapping
    public ResponseEntity<String> generate(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        RestTemplate restTemplate = new RestTemplate();

        // 요청 바디 구성
        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // Gemini API 호출
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) restTemplate.postForObject(
                    GEMINI_URL + apiKey,
                    entity,
                    Map.class
            );

            // 응답 파싱
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return ResponseEntity.ok("⚠️ 결과 없음");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String output = (String) parts.get(0).get("text");

            return ResponseEntity.ok(output);

        } catch (Exception e) {
            e.printStackTrace(); // <- 이 줄을 추가하면 구체적인 Gemini API 오류 메시지가 콘솔에 표시됩니다.
            return ResponseEntity.status(500).body("❌ Gemini API 호출 오류: " + e.getMessage());
        }
    }
}
