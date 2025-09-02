import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3002';
const SUCCESS_TEXT = '결제가 성공적으로 승인되었습니다!';

export default function PaymentResultPage() {
  const [status, setStatus] = useState('결제 승인 중...');
  const [detail, setDetail] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [vcExpirationDate, setVcExpirationDate] = useState('');
  const [vcInfo, setVcInfo] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [usedAt, setUsedAt] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get('paymentKey');
        const orderId = params.get('orderId');
        const amount = params.get('amount');
        const vc = JSON.parse(localStorage.getItem('vc') || 'null');

        if (!vc || !paymentKey || !orderId || !amount) {
          setStatus('결제 실패');
          setDetail('결제 정보가 부족하거나 VC가 없습니다.');
          return;
        }

        const res = await fetch(`${API_BASE}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount, vc }),
        });

        let data = null;
        try { data = await res.json(); } catch (_) { /* 빈 본문 대비 */ }

        // HTTP 레벨
        if (!res.ok) {
          const msg = data?.error || data?.message || `HTTP ${res.status}`;
          throw new Error(msg);
        }

        // 비즈니스 레벨(ok 플래그)
        if (!data?.ok) {
          const reason = data?.error || data?.message || '알 수 없는 오류';
          throw new Error(reason);
        }

        // ===== 성공 처리 =====
        setStatus(SUCCESS_TEXT);
        setDetail(data?.message || '승인 완료');

        // 현재 시각(표시용)
        const now = new Date();
        setCurrentTime(now.toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }));

        // VC 만료 표시용 (서버가 내려준 expirationDate만 신뢰)
        const exp = localStorage.getItem('vc_exp');
        if (exp) {
          const expFormatted = new Date(exp).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
          });
          setVcExpirationDate(expFormatted);
        } else {
          setVcExpirationDate('');
        }

        setVcInfo(vc);
        if (data?.txHash) setTxHash(data.txHash);
        if (data?.usedAt) {
          try {
            setUsedAt(new Date(data.usedAt).toLocaleString('ko-KR', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit',
            }));
          } catch { /* noop */ }
        }
      } catch (e) {
        setStatus('결제 실패');
        setDetail(e?.message || '알 수 없는 오류');
      } finally {
        // URL 정리 (새로고침 시 중복 승인 방지)
        window.history.replaceState({}, document.title, '/paymentresult');
      }
    })();
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
      <h2 className="text-2xl font-bold mb-2">{status}</h2>
      {detail && <p className="text-gray-600 mb-6">{detail}</p>}

      {status === SUCCESS_TEXT && (
        <div className="text-left text-gray-700 space-y-2">
          <p><strong>결제 금액:</strong> 10,000원</p>
          <p><strong>결제 일시:</strong> {currentTime}</p>
          {usedAt && <p><strong>VC 사용 시각:</strong> {usedAt}</p>}
          <p><strong>VC 만료시간:</strong> {vcExpirationDate || '정보 없음'}</p>
          {txHash && (
            <p className="break-all">
              <strong>Tx Hash:</strong> {txHash}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 space-y-3">
        {vcInfo && status === SUCCESS_TEXT && (
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl text-lg"
            onClick={handleShowVC}
          >
            내 VC 확인하기
          </button>
        )}

        <button
          className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 py-2 px-4 rounded-xl text-lg"
          onClick={() => (window.location.href = '/')}
        >
          메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}
