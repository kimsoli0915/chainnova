// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 4개 페이지 임포트 (대소문자 주의!)
import PaymentInfo from './pages/payment/paymentinfo';
import CardSelect from './pages/payment/cardselect';
import CardInput from './pages/payment/cardinput';
import PaymentResult from './pages/payment/paymentresult';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentInfo />} />
        <Route path="/card-select" element={<CardSelect />} />
        <Route path="/card-input" element={<CardInput />} />
        <Route path="/result" element={<PaymentResult />} />
      </Routes>
    </Router>
  );
}

export default App;
