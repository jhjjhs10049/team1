package org.zerock.mallapi.global.security.filter;

import com.google.gson.Gson;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.zerock.mallapi.domain.member.dto.MemberDTO;
import org.zerock.mallapi.global.util.JWTUtil;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

//OncePerRequestFilter : Spring Security 에서 HTTP 요청당 한 번만 실행되는 필터를 만들고 싶을 때 사용
// 주로 모든 요청에 대해서 체크 할때 사용
//사용 목적 : 인증, 로깅, JWT 검증등의 공통 처리
@Log4j2
public class JWTCheckFilter extends OncePerRequestFilter {

    //필터 제외 조건을 정의하는 메서드 (함수 이름을 직역 하면 필터링을 하면 안되는..)
    //여기서 제외된 것들은 doFilterInternal 에서 필터링을 거치게 된다.
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        //Preflight 요청 ? CORS 에서 브라우저가 실제 요청전에 보내는 사전 점검용 HTTP OPTIONS 요청
        //브라우저가 다른 출처(도메인, 포트, 프로토콜이 다른)에 AJAX 요청을 보내기 전에
        //서버가 해당 요청을 허용하는지 확인하기 위해 보내는 OPTIONS 메서드 요청
        //아래 조건 중 하나라도 해당하면 브라우저는 Preflight 요청을 보냅니다.
        //1. 요청 메서드가 GET, POST, HEAD 가 아닌 경우 (예: PUT, DELETE, PATCH)
        //2.Content-Type 이 application/x-www-form-urlencoded, multipart/form-data, text/plain 이외인 경우 (예: application/json)
        //3.커스텀 헤더가 포함된 경우 (예: Authorization, X-Custom-Header)
        //4.요청에 credentials 포함 시 (쿠키, 인증 헤더)        
        
        //Preflight 요청은 체크하지 않음
        if(request.getMethod().equals("OPTIONS")){
            return true;
        }        String path = request.getRequestURI();
        String method = request.getMethod();        // 인증이 필요 없는 member API들만 명시적으로 허용
        if(path.equals("/api/member/login") ||
           path.equals("/api/member/join") ||
           path.equals("/api/member/kakao") ||
           path.equals("/api/member/refresh") ||
           path.startsWith("/api/member/check-") ||
           // 이메일 인증 API 제외
           path.startsWith("/api/auth/") ||
           // 비밀번호 재설정 API 제외
           path.startsWith("/api/password-reset/") ||
           path.equals("/login") ||
           // 웹소켓 연결 경로 제외
           path.startsWith("/ws")) {
            log.debug("JWT filter excluded: {}", path);
            return true;
        }
        
        // Gyms API - 조회는 공개, 리뷰/즐겨찾기는 인증 필요
        if(path.startsWith("/api/gyms")) {
            if("GET".equals(method)) {
                // 즐겨찾기 관련 API는 인증 필요
                if(path.contains("/favorites")) {
                    log.debug("JWT filter applied (gyms favorites): {}", path);
                    return false;
                }
                // 나머지 GET 요청은 공개 (목록, 상세, 리뷰 조회)
                log.debug("JWT filter excluded (gyms GET): {}", path);
                return true;
            }
            // POST, DELETE 등은 인증 필요 (리뷰 작성/삭제, 즐겨찾기)
            log.debug("JWT filter applied (gyms non-GET): {}", path);
            return false;
        }

        // Trainers API - 조회는 공개, 리뷰는 인증 필요  
        if(path.startsWith("/api/trainers")) {
            if("GET".equals(method)) {
                // GET 요청은 모두 공개 (목록, 상세, 리뷰 조회)
                log.debug("JWT filter excluded (trainers GET): {}", path);
                return true;
            }
            // POST, DELETE 등은 인증 필요 (리뷰 작성/삭제)
            log.debug("JWT filter applied (trainers non-GET): {}", path);
            return false;
        }

        // Fitness Tips API - 조회는 공개, 관리는 관리자만
        if(path.startsWith("/api/fitness-tips")) {
            if("GET".equals(method)) {
                // 랜덤 팁, 활성화된 팁 목록은 공개
                if(path.equals("/api/fitness-tips/random") || 
                   path.equals("/api/fitness-tips/active") ||
                   path.matches("/api/fitness-tips/\\d+/?$")) { // 특정 팁 조회
                    log.debug("JWT filter excluded (fitness-tips GET): {}", path);
                    return true;
                }
                // 관리자 API는 인증 필요
                if(path.startsWith("/api/fitness-tips/admin")) {
                    log.debug("JWT filter applied (fitness-tips admin): {}", path);
                    return false;
                }
            }
            // POST, PUT, DELETE 등은 인증 필요 (관리자 기능)
            log.debug("JWT filter applied (fitness-tips non-GET): {}", path);
            return false;
        }

        // /api/files의 GET 요청만 체크하지 않음 (파일 조회)
        if(path.startsWith("/api/files") && "GET".equals(method)) {
            log.debug("JWT filter excluded (file access): {}", path);
            return true;
        }        
        
        // /api/support의 GET 요청 중 공개 API만 체크하지 않음 (FAQ 조회)
        if(path.startsWith("/api/support") && "GET".equals(method)) {
            // 개인 정보 관련 요청은 인증 필요
            if(path.contains("/my") || 
               path.contains("/chat-question/my") || 
               path.contains("/chat-room") || 
               path.contains("/chat-message")) {
                log.debug("JWT filter applied (private data access): {}", path);
                return false; // 개인 정보 관련은 JWT 체크 필요
            }
            log.debug("JWT filter excluded (FAQ access): {}", path);
            return true;
        }

        // /api/multchat의 GET 요청 중 일부만 공개
        if(path.startsWith("/api/multchat") && "GET".equals(method)) {
            // 개인 정보 관련 요청은 인증 필요
            if(path.contains("/my") || 
               path.contains("/messages") ||
               path.matches("/api/multchat/rooms/\\d+/?$")) { // 특정 채팅방 상세 조회는 인증 필요
                log.debug("JWT filter applied (private multchat access): {}", path);
                return false; // 개인 정보 관련은 JWT 체크 필요
            }
            // 채팅방 목록 API들은 이제 인증 필요 (참가 상태 확인을 위해)
            if(path.equals("/api/multchat/rooms") || 
               path.equals("/api/multchat/rooms/popular") || 
               path.equals("/api/multchat/rooms/recent")) {
                log.debug("JWT filter applied (multchat list with user info): {}", path);
                return false; // 인증 필요
            }
            // 나머지 GET 요청도 인증 필요
            log.debug("JWT filter applied (other multchat GET): {}", path);
            return false;
        }
        
        // /api/board의 GET 요청만 체크하지 않음 (목록 조회, 상세 조회, 댓글 조회)
        if(path.startsWith("/api/board") && "GET".equals(method)) {
            log.debug("JWT filter excluded (board access): {}", path);
            return true;
        }
        
        // 조회수 증가 API는 POST지만 인증 불필요
        if(path.matches("/api/board/\\d+/view") && "POST".equals(method)) {
            log.debug("JWT filter excluded (view count): {}", path);
            return true;
        }

        // 나머지 요청들은 모두 JWT 체크 필요
        log.debug("JWT filter applied: {}", path);
        return false;
    }    
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        String authHeaderStr = request.getHeader("Authorization");
        String path = request.getRequestURI();
        String method = request.getMethod();
          log.debug("JWT Filter 실행: {} {} - Authorization Header: {}", method, path, authHeaderStr);

        try{
            // Authorization 헤더가 없거나 Bearer로 시작하지 않으면 에러 처리
            if (authHeaderStr == null || !authHeaderStr.startsWith("Bearer ")) {
                log.warn("Authorization 헤더가 없거나 형식이 잘못됨 - Path: {}, Header: {}", path, authHeaderStr);
                throw new RuntimeException("Authorization header is missing or invalid");
            }//Bearer accesstoken..
            // (Bearer 토큰) 형식인데 여기서 토큰만 필요 하다.
            // Bearer + 공백문자1칸 을 빼고 가져 와야 하므로
            // 공백문자1칸의 인덱스 값이 6 이므로 (인덱스는 0부터 시작)
            // substring() 의 매개 변수값을 7로 하였다.            //Bearer accesstoken..
            // (Bearer 토큰) 형식인데 여기서 토큰만 필요 하다.
            // Bearer + 공백문자1칸 을 빼고 가져 와야 하므로
            // 공백문자1칸의 인덱스 값이 6 이므로 (인덱스는 0부터 시작)
            // substring() 의 매개 변수값을 7로 하였다.            String accesstoken = authHeaderStr.substring(7);
                        //Bearer accesstoken..
            // (Bearer 토큰) 형식인데 여기서 토큰만 필요 하다.
            // Bearer + 공백문자1칸 을 빼고 가져 와야 하므로
            // 공백문자1칸의 인덱스 값이 6 이므로 (인덱스는 0부터 시작)
            // substring() 의 매개 변수값을 7로 하였다.            //Bearer accesstoken..
            // (Bearer 토큰) 형식인데 여기서 토큰만 필요 하다.
            // Bearer + 공백문자1칸 을 빼고 가져 와야 하므로
            // 공백문자1칸의 인덱스 값이 6 이므로 (인덱스는 0부터 시작)
            // substring() 의 매개 변수값을 7로 하였다.
            String accesstoken = authHeaderStr.substring(7);
            log.debug("JWT 토큰 추출 성공");

            //토큰의 유효성 검사
            Map<String, Object> claims = JWTUtil.validateToken(accesstoken);
            log.debug("토큰 검증 성공 - memberNo: {}", claims.get("memberNo"));//JWT 토큰 내에는 인증에 필요한 모든 정보를 가지고 있다.
            //이를 활용해서 시큐리티에 필요한 객체(MemberDTO)를 구성하자.
            Long memberNo = Long.valueOf(claims.get("memberNo").toString());
            String email = (String) claims.get("email");
            String pw = (String) claims.get("pw");
            String nickname = (String) claims.get("nickname");
            Boolean social = (Boolean) claims.get("social");
            String roleCode = (String) claims.get("roleCode"); // roleCode 추가
            
            List<?> rawRoleNames = (List<?>) claims.get("roleNames");
            
            List<String> roleNames = rawRoleNames.stream()
                    .map(Object::toString)
                    .toList();

            MemberDTO memberDTO = new MemberDTO(memberNo, email, pw, nickname,
                    social.booleanValue(), roleNames);
            
            // roleCode 설정
            memberDTO.setRoleCode(roleCode);

            //UsernamePasswordAuthenticationToken : Spring Security 에서 사용자 인증 정보를 담기위한 객체
            //인증 성공 후 사용자 정보와 권한을 포함해서 생성하고 있다.
            // memberDTO를 principal로 설정하여 전체 정보에 접근 가능하도록 함
            UsernamePasswordAuthenticationToken authenticationToken
                    = new UsernamePasswordAuthenticationToken(memberDTO, pw, memberDTO.getAuthorities());

            //인증 정보(authenticationToken)를 등록한다.
            //인증등록에 성공하면
            //@AuthenticationPrincipal, SecurityContextHolder.getContext().getAuthentication() 등으로 인증 정보에 접근할 수 있다.
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            filterChain.doFilter(request, response); // 통과
        } catch (Exception e) {
            log.debug("JWT 검증 실패: {}", e.getMessage());

            // 응답이 이미 커밋되었는지 확인
            if (!response.isCommitted()) {
                try {
                    //Gson : java 객체를 JSON 으로 바꾸거나, JSON을 자바 객체로 바꿔주는 도구
                    Gson gson = new Gson();
                    //자바 객체를 JSON 문자열로 변환(Map -> JSON)
                    String msg = gson.toJson(Map.of("error", "ERROR_ACCESS_TOKEN"));

                    response.setContentType("application/json; charset=UTF-8");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    
                    // getWriter() 사용 전에 OutputStream이 사용되었는지 확인
                    try {
                        PrintWriter printWriter = response.getWriter();
                        printWriter.println(msg);
                        printWriter.flush();
                    } catch (IllegalStateException ise) {
                        // OutputStream이 이미 사용된 경우 OutputStream 사용
                        response.getOutputStream().write(msg.getBytes("UTF-8"));
                        response.getOutputStream().flush();
                    }
                } catch (Exception ex) {
                    log.error("JWT 오류 응답 전송 실패: {}", ex.getMessage());
                }
            } else {
                log.warn("응답이 이미 커밋되어 오류 응답을 보낼 수 없음");
            }
        }
    }
}
