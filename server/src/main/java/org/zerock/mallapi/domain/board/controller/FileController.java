package org.zerock.mallapi.domain.board.controller;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@RestController
@RequestMapping("/api/files")
@Log4j2
public class FileController {

    @Value("${org.zerock.upload.path}") // 프로퍼티지 확인
    private String uploadDir;    // [업로드] 이미지 MIME만 허용, 저장된 파일명 리스트 반환    @PreAuthorize("hasAnyRole('USER','MANAGER','ADMIN')")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<String> upload(@RequestPart("files") List<MultipartFile> files) throws Exception {
        Files.createDirectories(Path.of(uploadDir));

        List<String> saved = new ArrayList<>();
        for (MultipartFile f : files) {
                  if (f.isEmpty()) {
                continue;
            }

            String ct = Optional.ofNullable(f.getContentType()).orElse("").toLowerCase();
            if (!ct.startsWith("image/")) {
                continue; // 이미지가 아니면 건너뜀
            }

            String ext = Optional.ofNullable(f.getOriginalFilename())
                    .filter(n -> n.contains("."))
                    .map(n -> n.substring(n.lastIndexOf('.')))
                    .orElse("");

            String newName = UUID.randomUUID() + ext;
            f.transferTo(Path.of(uploadDir, newName)); // 제일 쉬운 저장 방식
            saved.add(newName);
        }
        
        return saved;
    }

    // [보기] 이미지 내려주기
    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<Resource> view(@PathVariable String filename) throws Exception {
        FileSystemResource res = new FileSystemResource(Path.of(uploadDir, filename));
        if (!res.exists())
            return ResponseEntity.notFound().build();

        String contentType = Files.probeContentType(res.getFile().toPath());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE,
                        contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .body(res);
    }
}
