import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Circles } from 'react-loader-spinner';

export default function CardInput() {
  const [form, setForm] = useState({
    birth: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setDone(false);
    setError('');

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

      // 1. 지갑 연결 + 주소 가져오기
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // 2. 메시지 서명
      const signature = await signer.signMessage(message);

      // 3. 서버에 전송
      const res = await axios.post('http://localhost:3001/issue-vc', {
        ...payload,
        userAddress,
        signature
      });

      if (res.status === 200) {
        setDone(true);
      } else {
        setError('VC 발급 실패');
      }
    } catch (err) {
      console.error(err);
      setError('VC 발급 실패! 다시 시도해주세요.');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
      <h2>기본정보 입력</h2>
      <form onSubmit={handleSubmit}>
        <label>
          생년월일(YYMMDD):
          <input
            type="text"
            name="birth"
            maxLength={6}
            value={form.birth}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>
        <label>
          카드 번호:
          <input
            type="text"
            name="cardNumber"
            value={formatCardNumber(form.cardNumber)}
            onChange={handleCardNumberChange}
            required
            maxLength={19}
            style={{ width: '100%' }}
            inputMode="numeric"
          />
        </label>
        <label>
          유효기간:
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              maxLength={2}
              value={form.expiryMonth}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              maxLength={2}
              value={form.expiryYear}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </div>
        </label>
        <label>
          CVC 번호:
          <input
            type="text"
            name="cvc"
            maxLength={4}
            value={form.cvc}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
            inputMode="numeric"
          />
        </label>
        <label>
          카드 비밀번호 (앞 2자리):
          <input
            type="password"
            name="cardPassword"
            maxLength={2}
            value={form.cardPassword}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
            inputMode="numeric"
          />
        </label>

        <button type="submit" disabled={loading} style={{ marginTop: 20, width: '100%' }}>
          {loading ? 'VC 발급 중...' : '결제요청'}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Circles height="40" width="40" color="#4fa94d" visible={true} />
        </div>
      )}

      {done && !loading && (
        <p style={{ color: 'green', marginTop: 20 }}>✅ VC 발급 완료!</p>
      )}
      {error && (
        <p style={{ color: 'red', marginTop: 20 }}>❌ {error}</p>
      )}
    </div>
  );
}
