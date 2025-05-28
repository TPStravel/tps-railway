export default async function handler(req, res) {
  const AMADEUS_CLIENT_ID = "7CLs8A6ufqruMSG1SOMY22D2CS4yliGD";
  const AMADEUS_CLIENT_SECRET = "ItQtjcYk29a0ef7a";

  try {
    // Passo 1: Obter token OAuth
    const tokenResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET
      })
    });
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // Parâmetros da requisição
    const { origin, destination, departureDate } = req.body;

    // Passo 2: Buscar voos
    const flightResponse = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=1&currencyCode=BRL&max=5`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
    const flightData = await flightResponse.json();

    res.status(200).json({ flights: flightData.data });
  } catch (err) {
    console.error("Erro Amadeus:", err);
    res.status(500).json({ error: "Erro ao buscar voos com Amadeus" });
  }
}
