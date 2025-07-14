import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Circles } from 'react-loader-spinner'; // ✅ 로딩 스피너 추가

export default function CardInput() {
  const [form, setForm] = useState({
    birth: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardPassword: ''
  });

  const [status, setStatus] = useState(null); // success | fail
  const [loading, setLoading] = useState(false); // 로딩 상태

  const handleCardNumberChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, '').slice(0, 16);
    setForm({ ...form, cardNumber: onlyNumber });
  };

  const formatCardNumber = (num) => {
    if (!num) return '';
    return num.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const expiryDate = `${form.expiryMonth}/${form.expiryYear}`;
      const payload = {
        birth: form.birth,
        cardNumber: form.cardNumber,
        expiryDate,
        cvc: form.cvc,
        cardPassword: form.cardPassword
      };
      const message = JSON.stringify(payload);

      if (!window.ethereum) {
        alert('MetaMask가 설치되어 있지 않습니다.');
        setLoading(false);
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const signature = await signer.signMessage(message);

      const res = await axios.post('http://localhost:3001/issue-vc', {
        ...payload,
        walletAddress: userAddress,
        signature
      });

      if (res.status === 200) {
        setStatus('success');
      } else {
        setStatus('fail');
      }
    } catch (err) {
      console.error(err);
      setStatus('fail');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
      <h2>기본정보 입력</h2>

      <form onSubmit={handleSubmit}>
        <label>생년월일(YYMMDD):<br/>
          <input type="text" name="birth" maxLength={6} value={form.birth} onChange={handleChange} required style={{ width: '100%' }} />
        </label><br/><br/>

        <label>카드 번호:<br/>
          <input type="text" name="cardNumber" maxLength={19} value={formatCardNumber(form.cardNumber)} onChange={handleCardNumberChange} required style={{ width: '100%' }} />
        </label><br/><br/>

        <label>유효기간:<br/>
          <input type="text" name="expiryMonth" placeholder="MM" maxLength={2} value={form.expiryMonth} onChange={handleChange} required style={{ width: 60 }} />
          /
          <input type="text" name="expiryYear" placeholder="YY" maxLength={2} value={form.expiryYear} onChange={handleChange} required style={{ width: 60, marginLeft: 8 }} />
        </label><br/><br/>

        <label>CVC 번호:<br/>
          <input type="text" name="cvc" maxLength={4} value={form.cvc} onChange={handleChange} required style={{ width: '100%' }} />
        </label><br/><br/>

        <label>카드 비밀번호 (앞 2자리):<br/>
          <input type="password" name="cardPassword" maxLength={2} value={form.cardPassword} onChange={handleChange} required style={{ width: '100%' }} />
        </label><br/><br/>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? '서명 요청 중...' : '결제요청'}
        </button>
      </form>

      {/* ✅ 로딩 스피너 */}
      {loading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Circles height="50" width="50" color="#4fa94d" />
          <p>VC 발급 중입니다...</p>
        </div>
      )}

      {/* ✅ 결과 메시지 */}
      {status === 'success' && (
        <p style={{ marginTop: 20, color: 'green' }}>✅ VC 발급 완료!</p>
      )}
      {status === 'fail' && (
        <p style={{ marginTop: 20, color: 'red' }}>❌ VC 발급 실패! 다시 시도해주세요.</p>
      )}
    </div>
  );
}
