const express = require('express')
const axios = require('axios')
const router = express.Router()

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY

router.post('/create-payment', async (req, res) => {
  try {
    const { orderId, amount, userName } = req.body

    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments',
      {
        amount,
        orderId,
        orderName: 'ChainNova 구독 결제',
        successUrl: 'http://localhost:3000/payment-success',
        failUrl: 'http://localhost:3000/payment-fail'
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    res.json(response.data) // checkout.url 포함됨
  } catch (err) {
    console.error('❌ Toss 결제 생성 실패:', err.response?.data || err.message)
    res.status(500).json({ error: '결제 생성 실패' })
  }
})

module.exports = router

