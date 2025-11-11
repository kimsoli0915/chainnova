import React, { useEffect, useState, useRef } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3002';
const SUCCESS_TEXT = 'PAYMENT SUCCESSFUL';

export default function PaymentResultPage() {
  // 처음엔 '결제 승인 중...' 성공하면 'PAYMENT SUCCESSFUL' 실패하면 '결제 실패'
  const [status, setStatus] = useState('결제 승인 중...');
  // detail: 실패했을 때 이유/에러 메시지 저장
  const [detail, setDetail] = useState('');
  // currentTime: 결제가 성공한 순간의 시각 (브라우저가 계산)
  const [currentTime, setCurrentTime] = useState('');
  // vcExpirationDate: localStorage에 저장된 VC 만료시간
  const [vcExpirationDate, setVcExpirationDate] = useState('');
  // vcInfo: localStorage에 있던 VC 전체 데이터
  const [vcInfo, setVcInfo] = useState(null);
  // txHash: 블록체인 거래 해시
  const [txHash, setTxHash] = useState('');
  // usedAt: VC가 실제로 사용된 시각: VC를 한 번 쓰고 나서 markVCUsed 처리된 시각
  const [usedAt, setUsedAt] = useState('');

  // showVCPopup: VC 팝업(모달)이 열렸는지/닫혔는지
  const [showVCPopup, setShowVCPopup] = useState(false);
  // didRun: 같은 코드가 두 번 실행되는 걸 막기 위해 쓰는 플래그
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get('paymentKey');
        const orderId = params.get('orderId');
        const amount = params.get('amount');
        // localStorage에서 미리 저장해둔 vc를 가져옴
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

        let data = {};
        try {
          data = await res.json();
        } catch (_) {}

        if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
        if (!data?.ok) throw new Error(data?.error || data?.message || '알 수 없는 오류');

        setStatus(SUCCESS_TEXT);
        setDetail("");

        const now = new Date();
        setCurrentTime(
          now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        );

        const exp = localStorage.getItem('vc_exp');
        if (exp) {
          setVcExpirationDate(
            new Date(exp).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }

        setVcInfo(vc);
        if (data?.txHash) setTxHash(data.txHash);
        if (data?.usedAt) {
          setUsedAt(
            new Date(data.usedAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }
      } catch (e) {
        setStatus('결제 실패');
         if (e?.message?.includes('expired')) {
        setDetail('VC expired'); // 간단히 표시
        } else {
        setDetail(e?.message || '알 수 없는 오류');
      } 
        window.history.replaceState({}, document.title, '/paymentresult'); //replaceState로 쿼리 제거(새로고침 시 재요청 방지)
      }
    })();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <div className="brand">CHAINNOVA</div>
      </header>

      <main className="container">
        {/* 체크 애니메이션 (성공시에만 노출) */}
        {status === SUCCESS_TEXT && (
          <div className="check-hero" aria-hidden>
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14 27l7 7 16-16" />
            </svg>
          </div>
        )}

        <h2 className="status">{status}</h2>
        {detail && <p className="detail">{detail}</p>}

        {status === SUCCESS_TEXT && (
          <div className="info">
            <p><strong>결제 금액:</strong> 10,000원</p>
            <p><strong>결제 일시:</strong> {currentTime}</p>
            {usedAt && <p><strong>VC 사용 시각:</strong> {usedAt}</p>}
            <p><strong>VC 만료시간:</strong> {vcExpirationDate || '정보 없음'}</p>
            {txHash && <p><strong>Tx Hash:</strong> {txHash}</p>}
          </div>
        )}

        <div className="btn-group">
          {vcInfo && status === SUCCESS_TEXT && (
            <button className="pink-btn" onClick={() => setShowVCPopup(true)}>내 VC 보기</button>
          )}
          <button className="outline-btn" onClick={() => (window.location.href = '/')}>메인으로 돌아가기</button>
        </div>
      </main>

      {showVCPopup && (
        <div className="modal-backdrop" onClick={() => setShowVCPopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>결제하기 &gt; 내 VC 보기</h3>
            </div>
            {vcInfo?.credentialSubject ? (
              <div className="modal-body">
                <p><strong>DID:</strong> {vcInfo.credentialSubject.id}</p>
                {vcInfo.credentialSubject.paymentPurpose && (
                  <p><strong>용도:</strong> {vcInfo.credentialSubject.paymentPurpose}</p>
                )}
                {vcInfo.credentialSubject.allowedUse && (
                  <p><strong>사용 조건:</strong> {vcInfo.credentialSubject.allowedUse}</p>
                )}
              </div>
            ) : (
              <p className="modal-body">VC 정보를 불러올 수 없습니다.</p>
            )}
            <div className="modal-footer">
              <button className="pink-btn" onClick={() => setShowVCPopup(false)}>확인</button>
            </div>
          </div>
        </div>
      )}

            {/* 푸터 */}
<footer className="nv-footer">
  <strong className="footer-about">About</strong>
  <div className="footer-names">
    김솔리 · 박선영 · 김예원 · 김채현
  </div>
  <div className="footer-desc">
    Designed &amp; Developed by students of the Department of Information Security, Seoul Women's University
  </div>
</footer>

      {/* CSS */}
      <style>{`
        :root {
          --pink: #ff2d86; /* 브랜드 핑크 */
          --bg: #0b0b0e;
          --panel: #1a1a1d;
          --text: #ffffff;
          --muted: #aaaaaa;
          --border: rgba(255,255,255,0.18);
        }

        .page{min-height:100vh;background: var(--bg);color: var(--text);font-family: ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans KR','Apple SD Gothic Neo',sans-serif;display:flex;flex-direction:column;}
        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px; }
        .brand { font-size: 20px; font-weight: 700; letter-spacing: .04em; background: linear-gradient(90deg, #ec4899, #fb7185); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .main-btn { background:transparent; color:var(--text); border:1px solid var(--text); border-radius:8px; padding:6px 12px; cursor:pointer; }

        .container{
          max-width:760px;
          margin: auto;        
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 40px 28px 30px;
          box-shadow: 0 10px 40px rgba(0,0,0,.45);
          text-align:center;
        }

        /* 체크 애니메이션: 위쪽 중앙 */
        .check-hero {
          display:flex; align-items:center; justify-content:center;
          margin: 8px auto 18px;
        }
        .checkmark { width: 90px; height: 90px; }
        .checkmark-circle {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          stroke-width: 3;
          stroke: var(--pink);
          fill: none;
          animation: stroke 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-check {
          stroke-dasharray: 70;
          stroke-dashoffset: 70;
          stroke: var(--pink);
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: stroke 0.35s cubic-bezier(0.65, 0, 0.45, 1) 0.75s forwards;
        }
        @keyframes stroke { to { stroke-dashoffset: 0; } }

        .status { font-size: clamp(25px, 4.6vw, 48px); font-weight: 800; margin: 6px 0 6px; letter-spacing: .02em; }
        .detail { color: var(--muted); margin-bottom: 16px; }

        .info { text-align:left; margin: 22px auto 4px; line-height:1.75; max-width: 520px; }
        .info strong { color: #e7e7e7; font-weight: 700; }

        .btn-group { display:flex; gap:12px; justify-content:center; margin-top: 30px; flex-wrap: wrap; }
        .pink-btn { background: var(--pink); border:none; padding:10px 20px; border-radius:999px; color:white; font-weight:800; cursor:pointer; letter-spacing:.02em; }
        .pink-btn:hover { opacity:0.92; }
        .outline-btn { background:transparent; border:1px solid white; padding:10px 20px; border-radius:999px; color:white; cursor:pointer; font-weight:700; }
        .outline-btn:hover { background:white; color: var(--bg); }

        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; }
        .modal { background: var(--panel); padding:20px; border-radius:12px; max-width:600px; width:90%; border:1px solid var(--border); }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-top: 0; margin-bottom:12px; }
        .close-btn { background:transparent; border:none; color:white; cursor:pointer; font-size:16px; }
        .modal-body { margin-bottom:16px; line-height:1.6; word-break: break-all; }
        .modal-footer { text-align:right; }
        .modal-header h3 {font-weight: 1000; margin-top: -4px;}

        .footer-about {font-size: 17px;font-weight: 900;display: block;margin-bottom: 6px;}
        .footer-names {font-size: 14px;margin-bottom: 6px;}
        .footer-desc {font-size: 13px;color: #9ca3af;line-height: 1.4;white-space: nowrap;}
        .nv-footer {position: fixed; left: 30px; bottom: 24px; text-align: left;max-width: 520px;z-index: 1;}
      `}</style>
    </div>
  );
}
