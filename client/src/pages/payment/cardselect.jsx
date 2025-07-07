// src/pages/payment/CardSelect.jsx
import React, { useState } from "react";

const cardList = [
  "KB카드",
  "하나카드",
  "삼성카드",
  "신한카드",
  "롯데카드",
  "BC카드",
  "현대카드",
  "NH카드",
  "chain카드",
];

function CardSelect() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");

  // 페이지 이동 없음(라우터 없이 단독 컴포넌트로 실행)
  const handleSelect = (card) => {
    setSelectedCard(card);
    setShowDropdown(false);

    if (card === "chain카드") {
      alert("chain카드를 선택했습니다! (여기서 페이지 이동이 가능합니다)");
    }
  };

  return (
    <div>
      <h2>카드를 선택해주세요.</h2>
      <div>
        <button onClick={() => setShowDropdown(!showDropdown)}>
          {selectedCard || "카드를 선택해주세요."}
        </button>
        {showDropdown && (
          <ul style={{ border: "1px solid #eee", listStyle: "none", padding: 0, margin: 0 }}>
            {cardList.map((card) => (
              <li
                key={card}
                style={{ padding: "10px", cursor: "pointer" }}
                onClick={() => handleSelect(card)}
              >
                {card}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CardSelect;
