import React, { useEffect, useState } from 'react';

const PaymentResultPage = () => {
  const [status, setStatus] = useState('결제 승인 중...');
  const [currentTime, setCurrentTime] = useState('');
  const [vcExpirationDate, setVcExpirationDate] = useState('');
  const [vcInfo, setVcInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = params.get('amount');
    const vc = JSON.parse(localStorage.getItem('vc'));

    if (!vc || !paymentKey || !orderId || !amount) {
      setStatus('결제 정보가 부족하거나 VC가 없습니다.');
      return;
    }

    fetch('http://localhost:3002/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount, vc })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message?.includes('VC')) {
          setStatus('VC expired');
        } else {
          setStatus('결제가 성공적으로 승인되었습니다!');

          // 현재 시간 기록
          const now = new Date();
          setCurrentTime(now.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
          }));

          // VC 만료 시간 포맷
          const exp = localStorage.getItem('vc_exp');
          if (exp) {
            const expFormatted = new Date(exp).toLocaleString('ko-KR', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            });
            setVcExpirationDate(expFormatted);
          }

          // VC 정보 표시
          setVcInfo(vc);
        }
      })
      .catch(err => {
        console.error(err);
        setStatus('결제 승인 요청 중 오류가 발생했습니다.');
      });

    // URL 정리
    window.history.replaceState({}, document.title, "/paymentresult");
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
      <h2 className="text-2xl font-bold mb-6">
        {status}
      </h2>

      {status === '결제가 성공적으로 승인되었습니다!' && (
        <div className="text-left text-gray-700 space-y-2">
          <p><strong>결제 금액:</strong> 10,000원</p>
          <p><strong>결제 일시:</strong> {currentTime}</p>
          <p><strong>VC 만료시간:</strong> {vcExpirationDate || '불러오는 중...'}</p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {vcInfo && (
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-lg"
            onClick={handleShowVC}
          >
            내 VC 확인하기
          </button>
        )}

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

export default PaymentResultPage;