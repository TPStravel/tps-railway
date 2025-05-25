export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { AMADEUS_API_KEY, AMADEUS_API_SECRET } = process.env;

  try {
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET
      })
    });

    const data = await response.json();
    res.status(response.ok ? 200 : 500).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter token', details: error.message });
  }
}
