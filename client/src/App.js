import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PaymentIntro from './pages/payment/paymentintro';
import CardSelect from './pages/payment/cardselect';
import CardInput from './pages/payment/cardinput';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentIntro />} />        {/* 1페이지: 결제 안내 */}
        <Route path="/card-select" element={<CardSelect />} /> {/* 2페이지: 카드 선택 */}
        <Route path="/card-input" element={<CardInput />} />   {/* 3페이지: 카드 정보 입력 */}
      </Routes>
    </Router>
  );
}

export default App;
