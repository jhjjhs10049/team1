import { useState } from "react";
import axios from "axios";
import jwtAxios from "../../member/util/JWTUtil";

const GeminiChatComponent = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");

  const askGemini = async () => {
    try {
      const res = await jwtAxios.post("http://localhost:8080/api/gemini", { prompt });
      // 응답이 객체라면 JSON 문자열로 변환해서 출력
      if (typeof res.data === "object") {
        setResult(JSON.stringify(res.data, null, 2)); // 보기 좋게 변환
      } else {
        setResult(res.data); // 문자열이면 그대로 출력
      }
    } catch (err) {
      setResult("❌ 서버 오류 발생");
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="프롬프트 입력"
        className="w-full border p-2"
      />
      <button onClick={askGemini} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        전송
      </button>
      <div className="mt-4 p-2 border rounded bg-gray-50 min-h-[100px]">
        {result}
      </div>
    </div>
  );
};

export default GeminiChatComponent;
