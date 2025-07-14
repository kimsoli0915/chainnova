<<<<<<< HEAD
import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Circles } from 'react-loader-spinner';
=======
import React, { useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import { Circles } from 'react-loader-spinner'
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2

export default function CardInput() {
  const [form, setForm] = useState({
    birth: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardPassword: ''
<<<<<<< HEAD
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
=======
  })

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // 마스킹 토글 상태
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [showCardPassword, setShowCardPassword] = useState(false)

  // 카드번호 숫자만 16자리 제한
  const handleCardNumberChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, '').slice(0, 16)
    setForm(prev => ({ ...prev, cardNumber: onlyNumber }))
  }

  // 카드번호 보기용 포맷
  const formatCardNumber = (num) => {
    if (!num) return ''
    return num.replace(/(.{4})/g, '$1 ').trim()
  }

  // 카드 비밀번호 숫자만 2자리 제한
  const handleCardPasswordChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, '').slice(0, 2)
    setForm(prev => ({ ...prev, cardPassword: onlyNumber }))
  }

  // 일반 input 변경 처리
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setDone(false)
    setError('')

    try {
      const expiryDate = `${form.expiryMonth}/${form.expiryYear}`
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
      const payload = {
        birth: form.birth,
        cardNumber: form.cardNumber,
        expiryDate,
        cvc: form.cvc,
        cardPassword: form.cardPassword
<<<<<<< HEAD
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
=======
      }

      const message = JSON.stringify(payload)

      if (!window.ethereum) {
        alert('MetaMask가 설치되어 있지 않습니다.')
        setLoading(false)
        return
      }

      // 1. 지갑 연결 + 주소 가져오기
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      // 2. 메시지 서명
      const signature = await signer.signMessage(message)
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2

      // 3. 서버에 전송
      const res = await axios.post('http://localhost:3001/issue-vc', {
        ...payload,
        userAddress,
        signature
<<<<<<< HEAD
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
=======
      })

      if (res.status === 200) {
        setDone(true)
      } else {
        setError('VC 발급 실패')
      }
    } catch (err) {
      console.error(err)
      setError('VC 발급 실패! 다시 시도해주세요.')
    }

    setLoading(false)
  }

  // 토글 버튼 스타일
  const toggleButtonStyle = {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    padding: 0,
    background: 'none',
    border: 'none'
  }

  const LockIcon = () => <span role="img" aria-label="자물쇠" style={{ fontSize: 18 }}>🔒</span>
  const UnlockIcon = () => <span role="img" aria-label="자물쇠 열림" style={{ fontSize: 18 }}>🔓</span>

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f9f9f9', borderRadius: 8, fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 22 }}>기본정보 입력</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: '600', fontSize: 14 }}>생년월일(YYMMDD)</label>
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
          <input
            type="text"
            name="birth"
            maxLength={6}
<<<<<<< HEAD
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
=======
            placeholder="예: 000101"
            value={form.birth}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
          />
        </div>

        {/* 카드번호 입력 with 마스킹 토글 */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <label style={{ fontWeight: '600', fontSize: 14 }}>카드 번호</label>
          <input
            type={showCardNumber ? 'text' : 'password'}
            name="cardNumber"
            placeholder="카드번호"
            value={showCardNumber ? formatCardNumber(form.cardNumber) : form.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={showCardNumber ? 19 : 16}
            inputMode="numeric"
            autoComplete="cc-number"
            required
            style={{ width: '100%', padding: '8px 40px 8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
          />
          <button type="button" onClick={() => setShowCardNumber(prev => !prev)} style={toggleButtonStyle} aria-label={showCardNumber ? '카드번호 숨기기' : '카드번호 보기'}>
            {showCardNumber ? <UnlockIcon /> : <LockIcon />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: '600', fontSize: 14 }}>유효기간 (MM)</label>
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              maxLength={2}
              value={form.expiryMonth}
              onChange={handleChange}
              required
<<<<<<< HEAD
              style={{ width: '100%' }}
            />
=======
              style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: '600', fontSize: 14 }}>유효기간 (YY)</label>
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              maxLength={2}
              value={form.expiryYear}
              onChange={handleChange}
              required
<<<<<<< HEAD
              style={{ width: '100%' }}
            />
          </div>
        </label>
        <label>
          CVC 번호:
=======
              style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: '600', fontSize: 14 }}>CVC 번호</label>
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
          <input
            type="text"
            name="cvc"
            maxLength={4}
<<<<<<< HEAD
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
=======
            placeholder="CVC"
            value={form.cvc}
            onChange={handleChange}
            required
            inputMode="numeric"
            autoComplete="cc-csc"
            style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
          />
        </div>

        {/* 카드 비밀번호 입력 with 마스킹 토글 */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <label style={{ fontWeight: '600', fontSize: 14 }}>카드 비밀번호 (앞 2자리)</label>
          <input
            type={showCardPassword ? 'text' : 'password'}
            name="cardPassword"
            placeholder="카드 비밀번호(앞 2자리)"
            value={form.cardPassword}
            onChange={handleCardPasswordChange}
            maxLength={2}
            inputMode="numeric"
            autoComplete="cc-password"
            required
            style={{ width: '100%', padding: '8px 40px 8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
          />
          <button type="button" onClick={() => setShowCardPassword(prev => !prev)} style={toggleButtonStyle} aria-label={showCardPassword ? '카드 비밀번호 숨기기' : '카드 비밀번호 보기'}>
            {showCardPassword ? <UnlockIcon /> : <LockIcon />}
          </button>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 20, width: '100%', padding: '12px 0', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, fontWeight: '600', fontSize: 16, cursor: 'pointer' }}>
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
          {loading ? 'VC 발급 중...' : '결제요청'}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
<<<<<<< HEAD
          <Circles height="40" width="40" color="#4fa94d" visible={true} />
=======
          <Circles height="40" width="40" visible={true} />
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
        </div>
      )}

      {done && !loading && (
        <p style={{ color: 'green', marginTop: 20 }}>✅ VC 발급 완료!</p>
      )}
      {error && (
        <p style={{ color: 'red', marginTop: 20 }}>❌ {error}</p>
      )}
    </div>
<<<<<<< HEAD
  );
=======
  )
>>>>>>> c6fd206b3c2283f0b2cded1df6c90385aefb76f2
}
