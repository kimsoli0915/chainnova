import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function CardSelect() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const navigate = useNavigate();

  const handleSelect = (card) => {
    setSelectedCard(card);
    setShowDropdown(false);

    if (card === 'chain카드') {
      navigate('/card-input'); // chain카드 선택 시 세 번째 페이지로 이동
    }
  };

  return (
    <div>
      <h2>카드를 선택해주세요.</h2>
      <button onClick={() => setShowDropdown(!showDropdown)}>
        {selectedCard || '카드를 선택해주세요.'}
      </button>
      {showDropdown && (
        <ul style={{ border: '1px solid #eee', listStyle: 'none', padding: 0 }}>
          {cardList.map((card) => (
            <li
              key={card}
              style={{ padding: '10px', cursor: 'pointer' }}
              onClick={() => handleSelect(card)}
            >
              {card}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

