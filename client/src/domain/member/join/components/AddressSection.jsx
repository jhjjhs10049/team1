import { useState } from "react";
import { searchAddress, formatMoisAddress } from "../../api/addressApi";

const AddressSection = ({
  postalCode,
  roadAddress,
  detailAddress,
  setJoinParam,
  joinParam,
  onChange,
  onKeyPress,
}) => {
  const [addressSearchResults, setAddressSearchResults] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressKeyword, setAddressKeyword] = useState("");

  // 행정안전부 API 주소 검색 함수
  const handleMoisAddressSearch = async () => {
    if (!addressKeyword.trim()) {
      alert("검색할 주소를 입력해주세요.");
      return;
    }

    try {
      const response = await searchAddress(addressKeyword);

      if (response.results && response.results.common.errorCode === "0") {
        const addresses = response.results.juso || [];
        setAddressSearchResults(addresses);
        setShowAddressModal(true);
      } else {
        alert("주소 검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("주소 검색 오류:", error);
      alert("주소 검색 중 오류가 발생했습니다.");
    }
  }; // 검색된 주소 선택 함수
  const handleSelectAddress = (selectedAddress) => {
    const formattedAddress = formatMoisAddress(selectedAddress);
    setJoinParam({
      ...joinParam,
      postalCode: formattedAddress.zipcode,
      roadAddress: formattedAddress.roadAddress,
    });
    setShowAddressModal(false);
    setAddressSearchResults([]);
    setAddressKeyword("");
  };

  return (
    <>
      {/* 행정안전부 주소 검색 결과 팝업 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-2 border-blue-200 shadow-2xl rounded-2xl max-w-3xl w-full mx-6 max-h-[500px] overflow-hidden">
            {/* 팝업 헤더 */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-4 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-teal-800">
                    주소 검색 결과
                  </h3>
                  <p className="text-sm text-teal-600 mt-1">
                    원하는 주소를 선택해주세요
                  </p>
                </div>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="w-8 h-8 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center text-gray-500 hover:text-red-500 border border-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 검색 결과 리스트 */}
            <div className="p-4 overflow-y-auto max-h-[380px] bg-gray-50">
              <div className="space-y-3">
                {addressSearchResults.map((address, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 mb-1">
                          {address.roadAddr}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {address.jibunAddr}
                        </div>
                        <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full font-medium">
                          우편번호: {address.zipNo}
                        </div>
                      </div>
                      <div className="ml-4 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 검색 결과가 없을 때 */}
              {addressSearchResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">🏠</div>
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* 주소 섹션 */}
      <div className="space-y-4">
        {/* 우편번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            우편번호 (선택)
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            name="postalCode"
            type="text"
            placeholder="주소 검색 후 자동으로 입력됩니다"
            value={postalCode}
            readOnly
          />
        </div>
        {/* 도로명주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            도로명주소 (선택)
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            name="roadAddress"
            type="text"
            placeholder="주소 검색 후 자동으로 입력됩니다"
            value={roadAddress}
            readOnly
          />
        </div>
        {/* 주소검색 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주소검색
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              type="text"
              placeholder="주소를 입력하세요"
              value={addressKeyword}
              onChange={(e) => setAddressKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleMoisAddressSearch()}
            />
            <button
              type="button"
              className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors whitespace-nowrap disabled:bg-gray-400"
              onClick={handleMoisAddressSearch}
              disabled={!addressKeyword.trim()}
            >
              주소검색
            </button>
          </div>
        </div>
        {/* 상세주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세주소 (선택)
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            name="detailAddress"
            type="text"
            placeholder="상세주소를 입력하세요"
            value={detailAddress}
            onChange={onChange}
            onKeyPress={onKeyPress}
          />
        </div>
      </div>
    </>
  );
};

export default AddressSection;
