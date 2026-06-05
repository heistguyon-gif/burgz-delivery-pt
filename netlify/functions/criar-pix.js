const CLIENT_KEY    = 'ck_30080f6f2ac715caa1018c9504b75f84';
const CLIENT_SECRET = 'cs_ea07cf1fb4669e0b7fd8e113e38909c7';
const SUNIZE_URL    = 'https://api.sunize.com.br/v1/transactions';

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) }; }

  const { produto, valor, nome, cpf, tel, email } = body;

  if (!produto || !valor || !nome || !cpf || !tel || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Campos obrigatórios faltando.' }) };
  }

  const cpfLimpo = String(cpf).replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'CPF inválido.' }) };
  }

  const telLimpo = String(tel).replace(/\D/g, '');
  const valorNum = parseFloat(valor);

  // IP do cliente (Netlify repassa no header x-forwarded-for)
  const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || '177.0.0.1';

  const payload = {
    external_id:    `ze-${Date.now()}`,
    total_amount:   valorNum,
    payment_method: 'PIX',
    ip:             ip,
    customer: {
      name:          nome,
      email:         email,
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
    try { data = JSON.parse(text); }
    catch { data = { raw: text }; }

    return { statusCode: response.status, headers, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
