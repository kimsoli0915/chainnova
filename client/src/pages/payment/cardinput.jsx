import React, { useState } from 'react'
import axios from 'axios'
import { ethers } from 'ethers'
import { Circles } from 'react-loader-spinner'

export default function CardInput() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [nextStepReady, setNextStepReady] = useState(false)

  // ✅ 1. VC 발급 함수
  const handleSignAndIssue = async () => {
    setLoading(true)
    setError('')
    setDone(false)
    setNextStepReady(false)

    try {
      if (!window.ethereum) {
        alert('MetaMask가 설치되어 있지 않습니다.')
        setLoading(false)
        return
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()

      const message = JSON.stringify({ userAddress })
      const signature = await signer.signMessage(message)

      const res = await axios.post('http://localhost:3001/issue-vc', {
        userAddress,
        signature
      })

      if (res.status === 200) {
        const vcData = res.data.vc
        const issuedAt = new Date()
        const expirationDate = new Date(issuedAt.getTime() + 5 * 60 * 1000) // 5분 후

        // ✅ VC와 만료시간을 localStorage에 저장
        localStorage.setItem('vc', JSON.stringify(vcData))
        localStorage.setItem('vc_exp', expirationDate.toISOString())

        setDone(true)
        setNextStepReady(true)
      } else {
        setError('VC 발급 실패')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'VC 발급 실패! 다시 시도해주세요.')
    }

    setLoading(false)
  }

  // ✅ 2. Toss 결제 요청 함수
  const handleTossPayment = () => {
    const tossPayments = window.TossPayments('test_ck_mBZ1gQ4YVXQpB5wPnyA1rl2KPoqN')

    tossPayments.requestPayment('카드', {
      amount: 10000,
      orderId: 'order-' + Date.now(),
      orderName: 'ChainNova VC 결제',
      customerName: '홍길동',
      successUrl: 'http://localhost:3000/paymentresult', // ✅ 성공 시 이동
      failUrl: 'http://localhost:3000/fail',
    }).catch((error) => {
      if (error.code === 'USER_CANCEL') {
        alert('❌ 사용자가 결제를 취소했습니다.')
      } else {
        alert('❌ 결제 오류: ' + error.message)
      }
    })
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '40px auto',
        padding: 24,
        background: '#f9f9f9',
        borderRadius: 8,
        fontFamily: 'sans-serif'
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        ChainNova 결제 시스템
      </h1>

      <ul style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
        <li>• VC 유효시간: 서명 시점으로부터 5분</li>
        <li>• VC 사용조건: 1회 사용 후 자동 폐기</li>
      </ul>

      <p style={{ marginBottom: 8, fontSize: 15 }}>
        ✔ 위 결제 조건에 동의하며, 본인의 DID 서명을 통해 결제 요청 VC를 생성합니다.
        <br />
        (VC는 Toss 결제 요청의 보안 조건 검증에 사용됩니다)
      </p>
      <p style={{ fontSize: 15 }}>
        ✔ VC 발급 후 자동으로 유효성 검증을 수행합니다.
      </p>

      {!done && (
        <button
          onClick={handleSignAndIssue}
          disabled={loading}
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
        >
          {loading ? '서명 요청 중...' : '다음'}
        </button>
      )}

      {loading && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Circles height="40" width="40" visible={true} />
        </div>
      )}

      {done && !loading && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: 'green' }}>
            ✅ VC 발급을 완료 후 검증 되었습니다.
          </p>
          {nextStepReady && (
            <button
              onClick={handleTossPayment}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '12px 0',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontWeight: '600',
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              결제 요청
            </button>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: 20 }}>❌ {error}</p>
      )}
    </div>
  )
}
