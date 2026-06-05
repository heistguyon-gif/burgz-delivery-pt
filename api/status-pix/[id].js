const CLIENT_KEY    = process.env.SUNIZE_CLIENT_KEY    || 'ck_d19809f0ab0b2b64b8e9ed6de245b328';
const CLIENT_SECRET = process.env.SUNIZE_CLIENT_SECRET || 'cs_f01a81cb3f1747a7fd9f2eb415a2fe9f';

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
