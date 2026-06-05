const CLIENT_KEY    = process.env.SUNIZE_CLIENT_KEY    || 'ck_30080f6f2ac715caa1018c9504b75f84';
const CLIENT_SECRET = process.env.SUNIZE_CLIENT_SECRET || 'cs_ea07cf1fb4669e0b7fd8e113e38909c7';
const SUNIZE_URL    = 'https://api.sunize.com.br/v1/transactions';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Método não permitido' });

  const { produto, valor, nome, cpf, tel, email } = req.body || {};

  if (!produto || !valor || !nome || !cpf || !tel || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  const cpfLimpo = String(cpf).replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ error: 'CPF inválido.' });
  }

  const telLimpo = String(tel).replace(/\D/g, '');
  const valorNum = parseFloat(valor);
  const ip       = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || '177.0.0.1';

  const payload = {
    external_id:    `ze-${Date.now()}`,
    total_amount:   valorNum,
    payment_method: 'PIX',
    ip,
    customer: {
      name:          nome,
      email,
      phone:         `+55${telLimpo}`,
      document_type: 'CPF',
      document:      cpfLimpo
    },
    items: [{
      id:          'prod-01',
      title:       produto,
      description: produto,
      price:       valorNum,
      quantity:    1,
      is_physical: true
    }]
  };

  try {
    const response = await fetch(SUNIZE_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    CLIENT_KEY,
        'x-api-secret': CLIENT_SECRET
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
