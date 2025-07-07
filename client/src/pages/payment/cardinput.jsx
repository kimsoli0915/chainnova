import React, { useState } from 'react'
import axios from 'axios'

export default function CardInput() {
  const [form, setForm] = useState({
    birth: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardPassword: ''
  });
  const [result, setResult] = useState(null);

  // 카드번호 입력: 숫자만, 16자리 제한
  const handleCardNumberChange = (e) => {
    // 입력된 값에서 숫자만 추출하고 16자리 제한
    const onlyNumber = e.target.value.replace(/\D/g, '').slice(0, 16);
    setForm({
      ...form,
      cardNumber: onlyNumber
    });
  };

  // 화면에 표시할 때 4자리마다 띄어쓰기
  const formatCardNumber = (num) => {
    if (!num) return '';
    return num.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expiryDate = `${form.expiryMonth}/${form.expiryYear}`;
      const response = await axios.post('http://localhost:3001/issue-vc', {
        birth: form.birth,
        cardNumber: form.cardNumber, // 서버로 보낼 때는 숫자만!
        expiryDate: expiryDate,
        cvc: form.cvc,
        cardPassword: form.cardPassword
      });
      setResult(response.data);
    } catch (err) {
      setResult('VC 발급 실패');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, background: '#f9f9f9', borderRadius: 8 }}>
      <h2>기본정보 입력</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            생년월일(YYMMDD):<br/>
            <input
              type="text"
              name="birth"
              maxLength={6}
              placeholder="예: 000101"
              value={form.birth}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </label>
        </div>
        <div>
          <label>
            카드 번호:<br/>
            <input
              type="text"
              name="cardNumber"
              placeholder="카드번호"
              value={formatCardNumber(form.cardNumber)}
              onChange={handleCardNumberChange}
              required
              maxLength={19} // 공백 포함 최대길이
              style={{ width: '100%' }}
              inputMode="numeric"
              autoComplete="cc-number"
            />
          </label>
        </div>
        <div>
          <label>
            유효기간:<br/>
            <input
              type="text"
              name="expiryMonth"
              placeholder="MM"
              maxLength={2}
              value={form.expiryMonth}
              onChange={handleChange}
              required
              style={{ width: 60, marginRight: 8 }}
            />
            /
            <input
              type="text"
              name="expiryYear"
              placeholder="YY"
              maxLength={2}
              value={form.expiryYear}
              onChange={handleChange}
              required
              style={{ width: 60, marginLeft: 8 }}
            />
          </label>
        </div>
        <div>
          <label>
            CVC 번호:<br/>
            <input
              type="text"
              name="cvc"
              maxLength={4}
              placeholder="CVC"
              value={form.cvc}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
              inputMode="numeric"
              autoComplete="cc-csc"
            />
          </label>
        </div>
        <div>
          <label>
            카드 비밀번호:<br/>
            <input
              type="password"
              name="cardPassword"
              maxLength={4}
              placeholder="카드 비밀번호(앞 2자리)"
              value={form.cardPassword}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
              inputMode="numeric"
              autoComplete="cc-password"
            />
          </label>
        </div>
        <button type="submit" style={{ marginTop: 20, width: '100%' }}>
          결제요청
        </button>
      </form>
      {result && (
        <pre style={{marginTop: 20, background: "#f4f4f4", padding: 10}}>
          {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
