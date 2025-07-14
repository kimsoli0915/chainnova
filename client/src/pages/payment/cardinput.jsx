import React, { useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'


export default function CardInput() {
  const [form, setForm] = useState({
    birth: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardPassword: ''
  })
  const [result, setResult] = useState(null)
  const [signing, setSigning] = useState(false)

  // 마스킹 토글 상태
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [showCardPassword, setShowCardPassword] = useState(false)

  // 카드번호 숫자만 16자리 제한
  const handleCardNumberChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, '').slice(0, 16)
    setForm(prev => ({ ...prev, cardNumber: onlyNumber }))
  }

  // 카드 비밀번호 숫자만 4자리 제한
  const handleCardPasswordChange = (e) => {
    const onlyNumber = e.target.value.replace(/\D/g, '').slice(0, 4)
    setForm(prev => ({ ...prev, cardPassword: onlyNumber }))
  }

  // 일반 input 변경 처리
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSigning(true)
    try {
      const expiryDate = `${form.expiryMonth}/${form.expiryYear}`
      const payload = {
        birth: form.birth,
        cardNumber: form.cardNumber,
        expiryDate,
        cvc: form.cvc,
        cardPassword: form.cardPassword
      }
      const message = JSON.stringify(payload)

      if (!window.ethereum) {
        alert('MetaMask가 설치되어 있지 않습니다.')
        setSigning(false)
        return
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      const signature = await signer.signMessage(message)

      const response = await axios.post('http://localhost:3001/issue-vc', {
        ...payload,
        signature,
        userAddress
      })
      setResult(response.data)
    } catch (err) {
      setResult('VC 발급 실패')
    }
    setSigning(false)
  }

  // 토글 버튼 스타일 공통 (flex 중앙 정렬)
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

  // 자물쇠 이모지 아이콘
  const LockIcon = () => <span role="img" aria-label="자물쇠" style={{ fontSize: 18 }}>🔒</span>
  const UnlockIcon = () => <span role="img" aria-label="자물쇠 열림" style={{ fontSize: 18 }}>🔓</span>

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f9f9f9', borderRadius: 8, fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 22 }}>기본정보 입력</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: '600', fontSize: 14 }}>생년월일(YYMMDD)</label>
          <input
            type="text"
            name="birth"
            maxLength={6}
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
            value={form.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={16}
            inputMode="numeric"
            autoComplete="cc-number"
            required
            style={{ width: '100%', padding: '8px 40px 8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
          />
          <button
            type="button"
            onClick={() => setShowCardNumber(prev => !prev)}
            style={toggleButtonStyle}
            aria-label={showCardNumber ? '카드번호 숨기기' : '카드번호 보기'}
          >
            {showCardNumber ? <UnlockIcon /> : <LockIcon />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: '600', fontSize: 14 }}>유효기간 (MM)</label>
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              maxLength={2}
              value={form.expiryMonth}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: '600', fontSize: 14 }}>유효기간 (YY)</label>
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              maxLength={2}
              value={form.expiryYear}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: '600', fontSize: 14 }}>CVC 번호</label>
          <input
            type="text"
            name="cvc"
            maxLength={4}
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
            maxLength={4}
            inputMode="numeric"
            autoComplete="cc-password"
            required
            style={{ width: '100%', padding: '8px 40px 8px 10px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }}
          />
          <button
            type="button"
            onClick={() => setShowCardPassword(prev => !prev)}
            style={toggleButtonStyle}
            aria-label={showCardPassword ? '카드 비밀번호 숨기기' : '카드 비밀번호 보기'}
          >
            {showCardPassword ? <UnlockIcon /> : <LockIcon />}
          </button>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 20,
            width: '100%',
            padding: '12px 0',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: '600',
            fontSize: 16,
            cursor: 'pointer'
          }}
          disabled={signing}
        >
          {signing ? 'MetaMask 서명 중...' : '결제요청'}

        </button>
      </form>

      {result && (
        <pre style={{ marginTop: 20, background: '#f4f4f4', padding: 10, fontSize: 14, whiteSpace: 'pre-wrap' }}>
          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
