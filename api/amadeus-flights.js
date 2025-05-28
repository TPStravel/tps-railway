// Caminho: api/amadeus-flights.js

export default async function handler(req, res) {
  const { origin, destination, date } = req.body;

  try {
    const tokenRes = await fetch("https://canal-vivo.vercel.app/api/amadeus-token");
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=1&max=5&currencyCode=USD`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar voos reais" });
  }
}
