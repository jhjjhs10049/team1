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
    <div className="p-4 border rounded-lg">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="프롬프트 입력 (Enter: 전송, Shift+Enter: 줄바꿈)"
        className="w-full border p-2 min-h-[100px] resize-none"
        disabled={isLoading}
      />
      <button
        onClick={askGemini}
        disabled={isLoading || !prompt.trim()}
        className={`mt-2 px-4 py-2 rounded text-white ${
          isLoading || !prompt.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {isLoading ? "생성중..." : "전송"}
      </button>
      <div className="mt-4 p-2 border rounded bg-gray-50 min-h-[100px] whitespace-pre-wrap">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="ml-3 text-gray-600">
              AI가 답변을 생성하고 있습니다...
            </span>
          </div>
        ) : (
          result || "여기에 AI 응답이 표시됩니다."
        )}
      </div>
    </div>
  );
};

export default GeminiChatComponent;
