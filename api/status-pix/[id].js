const CLIENT_KEY    = process.env.SUNIZE_CLIENT_KEY    || 'ck_30080f6f2ac715caa1018c9504b75f84';
const CLIENT_SECRET = process.env.SUNIZE_CLIENT_SECRET || 'cs_ea07cf1fb4669e0b7fd8e113e38909c7';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID não fornecido' });

  try {
    const response = await fetch(`https://api.sunize.com.br/v1/transactions/${id}`, {
      method:  'GET',
      headers: { 'x-api-key': CLIENT_KEY, 'x-api-secret': CLIENT_SECRET }
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
