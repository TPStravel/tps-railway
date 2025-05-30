
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/amadeus-proxy', async (req, res) => {
  const { origin, destination, date } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
  }

  try {
    const tokenResponse = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', null, {
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      }
    });

    const accessToken = tokenResponse.data.access_token;

    const flightResponse = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1,
        nonStop: false,
        max: 5,
        currencyCode: 'USD'
      }
    });

    res.json(flightResponse.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar voos com a API Amadeus.' });
  }
});

module.exports = router;
