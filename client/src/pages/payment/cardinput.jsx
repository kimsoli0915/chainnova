import React, { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";


export default function CardInput() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [nextStepReady, setNextStepReady] = useState(false);
  const [currentStep, setCurrentStep] = useState("idle"); // "idle" | "metamask" | "vc-issuing" | "blockchain" | "completed"

  const handleSignAndIssue = async () => {
    setLoading(true);
    setError("");
    setDone(false);
    setNextStepReady(false);
    setCurrentStep("metamask");

    try {
      if (!window.ethereum) {
        alert("MetaMask가 설치되어 있지 않습니다.");
        setLoading(false);
        setCurrentStep("idle");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const message = JSON.stringify({ userAddress });
      const signature = await signer.signMessage(message);

      setCurrentStep("vc-issuing");

      const res = await axios.post("http://localhost:3001/issue-vc", {
        userAddress,
        signature,
      });

      if (res.status === 200) {
        const vcData = res.data.vc;

        localStorage.setItem("vc", JSON.stringify(vcData));
        if (vcData && vcData.expirationDate) {
          localStorage.setItem("vc_exp", vcData.expirationDate);
        } else {
          localStorage.removeItem("vc_exp");
        }

        setCurrentStep("blockchain");

        setTimeout(() => {
          setCurrentStep("completed");
        }, 1500);

        setDone(true);
        setNextStepReady(true);
      } else {
        setError("VC 발급 실패");
        setCurrentStep("idle");
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "VC 발급 실패! 다시 시도해주세요.";
      setError(msg);
      setCurrentStep("idle");
    }

    setLoading(false);
  };

  const handleTossPayment = () => {
    if (!window.TossPayments) {
      alert("TossPayments 스크립트가 로드되지 않았습니다.");
      return;
    }

    const tossPayments = window.TossPayments("test_ck_mBZ1gQ4YVXQpB5wPnyA1rl2KPoqN");
    const orderId = "order-" + Date.now();
    const amount = 10000;

    tossPayments
      .requestPayment("카드", {
        amount,
        orderId,
        orderName: "ChainNova VC 결제",
        successUrl: `http://localhost:3000/paymentresult?orderId=${orderId}&amount=${amount}`,
        failUrl: "http://localhost:3000/fail",
      })
      .catch((error) => {
        if (error.code === "USER_CANCEL") {
          alert("❌ 사용자가 결제를 취소했습니다.");
        } else {
          alert("❌ 결제 오류: " + error.message);
        }
      });
  };

  const styles = `
    :root {
      --bg: #0a0a0a; --bg-2: #0f0f0f; --line: #1f1f1f; --text: #ffffff; --muted: #9ca3af;
      --pink: #ec4899; --pink-700: #be185d; --purple: #7c3aed; --success: #22c55e; --error: #f87171;
    }
    * { box-sizing: border-box; }
    .cnv-container { display: flex; min-height: 100vh; background: var(--bg); color: var(--text); }
    .cnv-sidebar { width: 280px; background: var(--bg-2); border-right: 1px solid var(--line); display: flex; flex-direction: column; }
    .cnv-sidebar-header { padding: 40px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
    .cnv-avatar { width: 40px; height: 40px; border-radius: 9999px; background: linear-gradient(135deg, var(--pink), var(--purple)); display: grid; place-items: center; }
    .cnv-avatar-icon { width: 24px; height: 24px; color: #fff; }
    .cnv-brand { font-size: 26px; font-weight: 400; }
    .cnv-nav { flex: 1; padding: 30px; display: grid; gap: 38px; align-content: start; justify-content: start; grid-auto-rows: min-content; }
    .cnv-nav-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 6px 6px; border-radius: 10px; background: transparent; color: #9ca3af; border: none; text-align: left; cursor: default; }
    .cnv-nav-item:hover { background: #1a1a1a; color: #fff; }
    .cnv-nav-item.active { background: rgba(236, 72, 153, 0.1); color: var(--pink); }
    .cnv-nav-icon svg { display: block; }
    .cnv-nav-label { font-size: 18px; font-weight: 550; }
    .cnv-sidebar-footer { padding: 24px; border-top: 1px solid var(--line); }
    .cnv-mark {  font-size: 18px; font-weight: 700; color: var(--pink); letter-spacing: .04em; background: linear-gradient(90deg, #ec4899, #fb7185); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .cnv-main { flex: 1; padding: 48px; }
    .cnv-main-inner { max-width: 960px; margin: 0 auto; }
    .cnv-hero { margin-bottom: 48px; }
    .cnv-title { font-size: 78px; font-weight:00; letter-spacing: .08em; margin: 0 0 8px 0; }
    .cnv-title-nova { background: linear-gradient(90deg,#ec4899,#f472b6,#ec4899); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: 0 0 20px rgba(236,72,153,.25);} 
    .cnv-title-pay {  background: linear-gradient(
    135deg,
    #e5e7eb 0%,
    #c0c0c0 20%,
    #f9fafb 40%,
    #a3a3a3 60%,
    #d4d4d4 80%,
    #f5f5f5 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow:
    0 1px 1px rgba(255,255,255,0.6),
    0 -1px 1px rgba(0,0,0,0.4),
    2px 2px 4px rgba(0,0,0,0.5); }

    .cnv-sub { color: #9ca3af; font-size: 20px; margin: 10; }
    .cnv-vcinfo { margin-bottom: 24px; }
    .cnv-vcinfo p { margin: 6px 0; font-size: 18px; }
    .muted { color: #9ca3af; }
    .bold { font-weight: 700; }
    .cnv-checklist { display: grid; gap: 1px; margin-bottom: 40px; }
    .cnv-checkitem { display: flex; align-items: center; gap: 6px; }
    .cnv-checkitem-icon { width: 28px; height: 24px; color: var(--pink); margin-top: 2px; }
    .cnv-checkitem-text { color: #d1d5db; font-size: 18px; line-height: 1.6; }
   
    .btn-solid { margin-top: 12px; padding: 14px 32px; border: none; color: #fff; background: linear-gradient(90deg, var(--pink), #db2777); border-radius: 9999px; font-weight: 700; font-size: 18px; cursor: pointer; transition: filter .2s ease; }
    .btn-solid:hover { filter: brightness(1.05); }
    .cnv-spinner { width: 40px; height: 40px; border: 4px solid rgba(236,72,153,.2); border-top-color: var(--pink); border-radius: 50%; margin-top: 16px; animation: cnv-spin 1s linear infinite; }
    @keyframes cnv-spin { to { transform: rotate(360deg); } }
    .cnv-success { margin-top: 16px; }
    .cnv-success-text { color: var(--pink); font-size: 20px; display: flex; align-items: center; gap: 8px; margin: 0 0 8px 0; }
    .cnv-error { color: var(--error); margin-top: 16px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
  `;

  return (
    <div className="cnv-container">
      <style>{styles}</style>
      <aside className="cnv-sidebar">
        <div className="cnv-sidebar-header">
          <div className="cnv-avatar">
            <svg viewBox="0 0 24 24" className="cnv-avatar-icon" aria-hidden="true">
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="cnv-brand">NOVA</span>
        </div>
        <nav className="cnv-nav">
          <NavItem label="사용자" icon={UsersIcon()} />
          <NavItem label="MetaMask 서명" active={currentStep === "metamask"} icon={WalletIcon()} />
          <NavItem label="카드식 VC 발급" active={currentStep === "vc-issuing"} icon={FileCheckIcon()} />
          <NavItem label="블록체인 기록" active={currentStep === "blockchain"} icon={BlockchainIcon()} />
          <NavItem label="서비스 제공자 검증" icon={ShieldIcon()} />
          <NavItem label="Toss 결제 승인" icon={CreditCardIcon()} />
        </nav>
        <div className="cnv-sidebar-footer">
          <span className="cnv-mark">CHAINNOVA</span>
        </div>
      </aside>
      <main className="cnv-main">
        <div className="cnv-main-inner">
          <header className="cnv-hero">
            <div className="cnv-logo">
              <div className="cnv-logo-outer" />
              <div className="cnv-logo-inner" />
            </div>
            <h1 className="cnv-title">
              <span className="cnv-title-nova">NOVA</span>
              <span className="cnv-title-pay">PAY</span>
            </h1>
            <p className="cnv-sub"><strong>NovaPay</strong>는 사용자의 전자서명을 기반으로 카드사가 발급한 VC를 활용하는 보안 결제 시스템입니다.</p>
          </header>
          <section className="cnv-vcinfo">
            <p><span className="muted">VC 유효기간:</span> <span className="bold">5분</span></p>
            <p><span className="muted">VC 사용조건:</span> <span className="bold">1회</span></p>
          </section>
          <section className="cnv-checklist">
            <CheckItem text="위 결제조건을 확인하였으며, 본인의 DID서명을 통해 결제 요청 VC를 생성합니다." />
            <CheckItem text="VC는 TOSS의 결제 요청의 보안 조건 검증에 사용됩니다." />
            <CheckItem text="VC 발급 후 자동으로 유효성 검증을 수행합니다." />
          </section>
          {!done && (
            <div className="loading-wrap">
              {loading && <div className="cnv-spinner" aria-label="loading" />}
              <button className="btn-solid" onClick={handleSignAndIssue} disabled={loading}>
                {loading ? "서명 요청 중..." : "VC 발급하기"}
              </button>
            </div>
          )}
          {done && !loading && (
           <div className="cnv-success">
              <p className="cnv-success-text">
              <svg className="cnv-checkitem-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              VC 발급을 완료 후 검증 되었습니다.
                </p>
            {nextStepReady && (
                 <button className="btn-solid" onClick={handleTossPayment}>
              결제 요청
               </button>
                 )}
            </div>
          )}
          {error && (<p className="cnv-error">✗ {error}</p>)}
        </div>
      </main>
    </div>
  );
}

function NavItem({ label, active, icon }) {
  return (
    <button className={"cnv-nav-item" + (active ? " active" : "")}> 
      <span className="cnv-nav-icon">{icon}</span>
      <span className="cnv-nav-label">{label}</span>
    </button>
  );
}

function CheckItem({ text }) {
  return (
    <div className="cnv-checkitem">
      <svg className="cnv-checkitem-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="cnv-checkitem-text">{text}</p>
    </div>
  );
}

// Inline SVG Icon helpers (no external libs)
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M16 21c0-2.761-2.686-5-6-5s-6 2.239-6 5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M22 21c0-2.21-1.79-4-4-4" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M18 11a3 3 0 10-3-3" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" ry="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 12h4v4h-4z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function FileCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BlockchainIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="3"  y="3"  width="7" height="7" rx="1.5" ry="1.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="14" y="3"  width="7" height="7" rx="1.5" ry="1.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="3"  y="14" width="7" height="7" rx="1.5" ry="1.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" ry="1.5" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
