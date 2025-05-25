export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { origin, destination, departureDate, returnDate, adults } = req.body;
  const { AMADEUS_API_KEY, AMADEUS_API_SECRET } = process.env;

  try {
    const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET
      })
    });
    const tokenData = await tokenRes.json();

    const searchParams = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: String(adults),
      ...(returnDate ? { returnDate } : {})
    });

    const flightsRes = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const flightsData = await flightsRes.json();
    res.status(200).json(flightsData);
  } catch (error) {
    res.status(500).json({ error: 'Erro na busca de voos', details: error.message });
  }
}
