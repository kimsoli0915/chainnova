import React, { useEffect, useState } from 'react';

const PaymentCompletePage = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [vcExpirationDate, setVcExpirationDate] = useState('');
  const [vcInfo, setVcInfo] = useState(null);

  useEffect(() => {
    // ✅ 현재 시간 (결제 일시)
    const now = new Date();
    const formatted = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    setCurrentTime(formatted);

    // ✅ VC 만료시간 로딩
    const exp = localStorage.getItem('vc_exp');
    if (exp) {
      const expFormatted = new Date(exp).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      setVcExpirationDate(expFormatted);
    }

    // ✅ VC 정보 로딩
    const vcRaw = localStorage.getItem('vc');
    if (vcRaw) {
      setVcInfo(JSON.parse(vcRaw));
    }
  }, []);

  const handleShowVC = () => {
    if (vcInfo?.credentialSubject) {
      const cs = vcInfo.credentialSubject;
      alert(
        `내 VC 정보\n\n` +
        `DID: ${cs.id}\n` +
        `용도: ${cs.paymentPurpose}\n` +
        `사용 조건: ${cs.allowedUse}`
      );
    } else {
      alert('VC 정보를 불러올 수 없습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg text-center font-sans">
      <h2 className="text-2xl font-bold text-green-600 mb-6">결제가 완료되었습니다!</h2>

      <div className="text-left text-gray-700 space-y-2">
        <p><strong>결제 금액:</strong> 10,000원</p>
        <p><strong>결제 일시:</strong> {currentTime}</p>
        <p><strong>VC 만료시간:</strong> {vcExpirationDate || '불러오는 중...'}</p>
      </div>

      <div className="mt-8 space-y-3">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-lg"
          onClick={handleShowVC}
        >
          내 VC 확인하기
        </button>

        <button
          className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 py-2 px-4 rounded-xl text-lg"
          onClick={() => window.location.href = '/'}
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default PaymentCompletePage;
