// client/src/pages/payment/paymentIntro.jsx

import React from 'react';

function PaymentIntro() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">App Store - 일반결제</h1>
      <p>구독서비스를 결제합니다.</p>
      <p className="mt-2 text-sm text-gray-500">
        갱신일 최소 하루 전까지 MYPAGE에서 언제든지 취소할 수 있습니다.<br />
        취소할 때까지 요금제가 30일마다 자동 갱신됩니다.
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Nova Pay로 결제
      </button>
    </div>
  );
}

export default PaymentIntro;
