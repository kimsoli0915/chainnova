// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentIntro from './pages/payment/paymentinfo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentIntro />} />
      </Routes>
    </Router>
  );
}

export default App;
