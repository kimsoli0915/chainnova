import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── Inline SVG 아이콘 (외부 패키지 無) ────────────────────────── */
function IconPlay(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}
function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="9" cy="8" r="3" fill="currentColor" />
      <circle cx="17" cy="10" r="2.5" fill="currentColor" />
      <path d="M3 19c0-3.3 3.2-5 6-5s6 1.7 6 5v1H3v-1z" fill="currentColor" />
      <path d="M14.5 19v1H21v-1c0-2.5-2.2-3.8-4.5-3.8-.9 0-1.8.2-2.5.7.3.8.5 1.8.5 3.1z" fill="currentColor" />
    </svg>
  );
}
function IconCheckCircle(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPenTool(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l7 7-6 6-7-7 6-6z" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M6 18l4-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconNetwork(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="5" cy="12" r="2.5" fill="currentColor" />
      <circle cx="12" cy="5" r="2.5" fill="currentColor" />
      <circle cx="19" cy="12" r="2.5" fill="currentColor" />
      <path d="M7.2 10.9l3.7-3.2M16.8 10.9l-3.7-3.2M7.5 13.1l3.5 3.1M16.5 13.1l-3.5 3.1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function IconGithub(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 .5C5.7.5.9 5.3.9 11.6c0 4.9 3.2 9 7.7 10.5.6.1.8-.3.8-.6v-2.1c-3.1.7-3.8-1.3-3.8-1.3-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.9 1.3 3.6 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.1-1.3-5.1-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.9 1.2 2 1.2 3.2 0 4.5-2.6 5.5-5.1 5.8.4.3.8 1 .8 2.1v3.1c0 .3.2.8.8.6 4.5-1.5 7.7-5.6 7.7-10.5C23.1 5.3 18.3.5 12 .5z"
      />
    </svg>
  );
}

/* ── 툴팁 (CSS :hover) ─────────────────────────────────────── */
function Tooltip({ label, children }) {
  return (
    <span className="tip-wrap">
      {children}
      <span className="tip-bubble">{label}</span>
    </span>
  );
}

/* ── 모달 (상태 기반, 바깥 클릭/ESC 닫기) ───────────────────── */
function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const onBackdrop = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={onBackdrop}>
      <div className="modal-panel" ref={panelRef}>
        <h2 id="modal-title" className="modal-title">{title}</h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose} autoFocus>닫기</button>
        </div>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ──────────────────────────────────────────── */
export default function PaymentIntro() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ◀︎◀︎ 파일 하나에 CSS 포함: <style> 태그로 주입
  const styles = `
  :root{
    --pink1:#ec4899;--pink2:#db2777;--pink3:#f472b6;
    --silver1:#e5e7eb;--silver2:#f9fafb;--silver3:#d1d5db;
    --bg:#000;--fg:#fff;--border:rgba(255,255,255,.1);
    --card:rgba(255,255,255,.06);--cardHover:rgba(255,255,255,.08);
    --tooltipBg:rgba(0,0,0,.9);
  }
  .nv-page{position:relative;min-height:100vh;overflow:hidden;background:#000;color:#fff;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;}
  .nv-bg{position:absolute;inset:0;background:linear-gradient(135deg,#000 0%,#111 50%,#000 100%)}
  .nv-bg-glow{position:absolute;inset:0;background:linear-gradient(90deg,rgba(236,72,153,.08),transparent 50%,rgba(168,85,247,.08));animation:nv-pulse 3s ease-in-out infinite}
  @keyframes nv-pulse{0%,100%{opacity:.6}50%{opacity:1}}
  .nv-header{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:24px}
  .brand{font-size:22px;font-weight:800;background:linear-gradient(90deg,var(--pink1),#fb7185);-webkit-background-clip:text;background-clip:text;color:transparent;letter-spacing:1px}
  .gh-link{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;transition:all .2s;border:1px solid var(--border);background:rgba(255,255,255,.05)}
  .gh-link:hover{background:rgba(255,255,255,.12)}
  .gh-icon{width:26px;height:26px;color:#fff}
  .nv-main{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;padding:48px 24px 72px}
  .hero{text-align:center;margin-bottom:48px}
  .hero-sub{margin:0 0 32px;color:#d1d5db;font-weight:300;letter-spacing:.2em;font-size:18px}
  .logo-wrap{position:relative;margin-bottom:44px}
  .logo-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;user-select:none}
  .logo-bg img{width:320px;height:320px;object-fit:contain;opacity:.3;filter:blur(1px)}
  .novapay-text{position:relative;z-index:1;font-weight:900;letter-spacing:.08em;font-size:clamp(55px, 10vw, 130px)}
  .text-nova{background:linear-gradient(90deg,var(--pink1),var(--pink3),var(--pink1));-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 20px rgba(236,72,153,.25)}
  .text-pay{
  background: linear-gradient(
    135deg,
    #e5e7eb 0%,   /* 밝은 은색 */
    #c0c0c0 20%,  /* 기본 실버 */
    #f9fafb 40%,  /* 거의 흰색 하이라이트 */
    #a3a3a3 60%,  /* 진한 그레이 실버 */
    #d4d4d4 80%,  /* 중간톤 */
    #f5f5f5 100%  /* 맨 끝 하이라이트 */
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  /* 금속광택 같은 입체 효과 */
  text-shadow: 
    0 1px 1px rgba(255,255,255,0.6),
    0 -1px 1px rgba(0,0,0,0.4),
    2px 2px 4px rgba(0,0,0,0.5);
}
  .nv-footer {
  position: absolute;
  left: 24px;
  bottom: 16px;
  text-align: left;
  color: #fff;
  max-width: 400px; /* 너무 퍼지지 않도록 */
}

  .footer-about {font-size: 17px;font-weight: 900;display: block;margin-bottom: 6px;}
  .footer-names {font-size: 14px;margin-bottom: 6px;}
  .footer-desc {font-size: 13px;color: #9ca3af; /* 회색톤 */line-height: 1.4;white-space: nowrap;}

  .actions{display:flex;gap:16px;justify-content:center;margin-top:28px;margin-bottom:48px;flex-wrap:wrap}
  .btn-primary{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:9999px;font-weight:700;font-size:16px;color:#fff;border:2px solid rgba(236,72,153,.45);background:linear-gradient(90deg,var(--pink1),var(--pink2));box-shadow:0 0 25px rgba(236,72,153,.35);transition:transform .15s,filter .2s,background .2s}
  .btn-primary:hover{transform:scale(1.04);filter:brightness(1.05);background:linear-gradient(90deg,var(--pink2),#be185d)}
  .btn-primary .ico{width:18px;height:18px}
  .btn-ghost{padding:12px 22px;border-radius:9999px;color:#fff;font-size:16px;font-weight:600;border:2px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);backdrop-filter:blur(6px);transition:transform .15s,background .2s,border-color .2s}
  .btn-ghost:hover{transform:scale(1.03);background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.55)}
  .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;width:100%;max-width:1100px}
  @media (min-width:768px){.grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}}
  .card{cursor:pointer;text-align:center;padding:28px;border:1px solid rgba(255,255,255,.15);border-radius:20px;background:var(--card);backdrop-filter:blur(4px);transition:transform .2s,background .2s,border-color .2s}
  .card:hover{transform:scale(1.05);background:var(--cardHover);border-color:rgba(236,72,153,.35)}
  .card-ico{width:44px;height:44px;color:#d1d5db;transition:color .2s}
  .card:hover .card-ico{color:var(--pink3)}
  .card-title{margin-top:10px;font-size:18px;font-weight:700}
  .tip-wrap{position:relative;display:inline-block}
  .tip-bubble{position:absolute;left:50%;top:100%;transform:translateX(-50%);background:var(--tooltipBg);color:#e5e7eb;border:1px solid rgba(236,72,153,.3);padding:10px 12px;border-radius:10px;width:260px;font-size:14px;text-align:center;line-height:1.5;opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s;margin-top:12px;box-shadow:0 10px 30px rgba(0,0,0,.5);backdrop-filter:blur(10px);z-index:20}
  .tip-wrap:hover .tip-bubble,.tip-wrap:focus-within .tip-bubble{opacity:1;visibility:visible}
  .bottom-glow{position:absolute;left:0;right:0;bottom:0;height:140px;background:linear-gradient(to top,rgba(236,72,153,.12),transparent);pointer-events:none}
  .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:24px;z-index:50}
  .modal-panel{width:100%;max-width:600px;background:rgba(0,0,0,.9);border:1px solid rgba(236,72,153,.3);border-radius:18px;box-shadow:0 25px 60px rgba(0,0,0,.5);backdrop-filter:blur(12px);padding:24px}
  .modal-title{font-size:22px;font-weight:800;background:linear-gradient(90deg,var(--pink1),var(--pink3));-webkit-background-clip:text;background-clip:text;color:transparent}
  .modal-body{color:#e5e7eb;font-size:15px;line-height:1.7;text-align:center;}
  .modal-body .mt{margin-top:10px}
  .modal-actions{margin-top:16px;text-align:right}
  .btn-outline{padding:8px 14px;border-radius:12px;font-weight:600;color:#fff;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08)}
  .btn-outline:hover{background:rgba(255,255,255,.16)}
  `;

  return (
    <div className="nv-page">
      {/* 단일 파일 CSS 주입 */}
      <style>{styles}</style>

      {/* 배경 */}
      <div className="nv-bg">
        <div className="nv-bg-glow" />
      </div>

      {/* 헤더 */}
      <header className="nv-header">
        <div className="brand">CHAINNOVA</div>
        <a
          className="gh-link"
          href="https://github.com/kimsoli0915/chainnova"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub Repository"
          title="GitHub"
        >
          <IconGithub className="gh-icon" />
        </a>
      </header>

      {/* 본문 */}
      <main className="nv-main">
        <div className="hero">
          <h1 className="hero-sub">Secure, Decentralized Payments</h1>

          {/* 로고 배경 + 텍스트 */}
          <div className="logo-wrap">
            <div className="logo-bg">
              <img src="/images/novapay-logo.png" alt="NovaPay Logo" />
            </div>
            <div className="novapay-text">
              <span className="text-nova">NOVA</span>
              <span className="text-pay">PAY</span>
            </div>
          </div>

          {/* 액션 */}
          <div className="actions">
            <button type="button" className="btn-primary" onClick={() => navigate("/card-input")}>
              <IconPlay className="ico" />
              테스트해보기
            </button>

            <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
              설명보기
            </button>
          </div>
        </div>

        {/* 기능 카드 + 툴팁 */}
        <div className="grid">
          <Tooltip label="블록체인 기반의 분산 신원 식별자이며 사용자가 결제를 시도하면 발급되는 VC 안에 DID가 포함되어 “이 증명서가 누구에게 속한 것인지”를 명확히 표시합니다.">
            <div className="card">
              <IconUsers className="card-ico" />
              <h3 className="card-title">DID</h3>
            </div>
          </Tooltip>

          <Tooltip label="사용자가 직접 서명한 위변조가 불가능한 디지털 증명서로 카드사 서버가 발급한 VC는 해시값 형태로 블록체인에 등록되어 재사용을 방지합니다.">
            <div className="card">
              <IconCheckCircle className="card-ico" />
              <h3 className="card-title">VC</h3>
            </div>
          </Tooltip>

          <Tooltip label="사용자는 Metamask에서 서명 요청을 확인하고 승인함으로써 자신이 이 VC의 실제 소유자임을 증명합니다.">
            <div className="card">
              <IconPenTool className="card-ico" />
              <h3 className="card-title">사용자 서명</h3>
            </div>
          </Tooltip>

          <Tooltip label="온체인에 VC 해시를 기록하고 사용 여부를 표시하여 double-spend 가능성을 차단합니다. 블록체인의 변경 불가능성과 공개 검증 가능성을 활용해 신뢰성을 강화한 구조입니다.">
            <div className="card">
              <IconNetwork className="card-ico" />
              <h3 className="card-title">BlockChain</h3>
            </div>
          </Tooltip>
        </div>
      </main>

      {/* 하단 글로우 */}
      <div className="bottom-glow" />

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


      {/* 모달 */}
      <Modal open={open} onClose={() => setOpen(false)} title="Welcome to NOVAPAY">
        <p>사용자의 전자서명을 기반으로 카드사가 발급한 VC를 활용하는 보안 결제 시스템입니다.</p>
        <p className="mt">사용자가 MetaMask 서명으로 결제에 동의하면 카드사가 VC를 발급하고, 그 해시값과 사용여부를 블록체인에 기록하여 재사용을 차단합니다.</p>
        <p className="mt">서비스 제공자는 결제 시점에 VC의 유효성을 확인한 뒤 Toss Payments와 결합하여 안전하고 투명한 단일 결제를 보장합니다.</p>
      </Modal>
    </div>
  );
}
