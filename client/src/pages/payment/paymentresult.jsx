import React, { useState } from 'react'
import axios from 'axios'


export default function CardInput() {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvc, setCvc] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setDone(false)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:3001/issue-vc', {
        cardNumber,
        expiryDate,
        cvc
      })
      setResult(response.data)
      setDone(true)
    } catch (error) {
      setResult('VC 발급 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="카드 번호"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="유효기간 (MM/YY)"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <input
          type="text"
          placeholder="CVC"
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          결제 요청
        </button>
      </form>

      {loading && <p className="mt-4 text-yellow-500">결제 진행 중입니다...</p>}
      {done && (
        <div className="mt-4">
          <p className="text-green-600">✅ 결제가 완료되었습니다!</p>
          <button
            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            onClick={() => alert('결제 완료 처리')}
          >
            결제 완료
          </button>
        </div>
      )}
      {result && !done && <p className="mt-4 text-red-500">{result}</p>}
    </div>
  )
}