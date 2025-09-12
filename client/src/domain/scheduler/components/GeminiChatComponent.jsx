import { useState } from "react";
import jwtAxios from "../../member/util/JWTUtil";

const GeminiChatComponent = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const askGemini = async () => {
    if (!prompt.trim()) return; // 빈 내용이면 전송하지 않음

    setIsLoading(true);
    setResult(""); // 이전 결과 지우기

    try {
      const res = await jwtAxios.post("http://localhost:8080/api/gemini", {
        prompt,
      });
      // 응답이 객체라면 JSON 문자열로 변환해서 출력
      if (typeof res.data === "object") {
        setResult(JSON.stringify(res.data, null, 2)); // 보기 좋게 변환
      } else {
        setResult(res.data); // 문자열이면 그대로 출력
      }
    } catch (error) {
      setResult("❌ 서버 오류 발생");
      console.error("Gemini API 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 기본 Enter 동작(새 줄) 방지
      askGemini();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="운동 관련 질문을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors min-h-[100px] resize-none"
          disabled={isLoading}
        />
        <button
          onClick={askGemini}
          disabled={isLoading || !prompt.trim()}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isLoading || !prompt.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-sm"
          }`}
        >
          {isLoading ? "AI가 답변 중..." : "💬 AI에게 질문하기"}
        </button>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-gray-600 text-sm">
                AI가 답변을 생성하고 있습니다...
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {result || (
              <div className="text-center text-gray-500 py-6">
                <span className="text-2xl block mb-2">🤖</span>
                여기에 AI 코치의 답변이 표시됩니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiChatComponent;
