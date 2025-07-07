import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentIntro() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow-md text-center">
      <h1 className="text-2xl font-bold mb-4">App Store - 일반결제</h1>
      <p className="mb-2">구독서비스를 결제합니다.</p>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        갱신일 최소 하루 전까지 MYPAGE에서 언제든지 취소할 수 있습니다.<br />
        취소할 때까지 요금제가 30일마다 자동 갱신됩니다.
      </p>
      <button
        onClick={() => navigate('/card-select')}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
        type="button"
      >
        Nova Pay로 결제
      </button>
    </div>
  );
}

export default PaymentIntro;