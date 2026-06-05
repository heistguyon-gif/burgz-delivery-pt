const CLIENT_KEY    = 'ck_30080f6f2ac715caa1018c9504b75f84';
const CLIENT_SECRET = 'cs_ea07cf1fb4669e0b7fd8e113e38909c7';

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  const id = (event.queryStringParameters && event.queryStringParameters.id)
    || event.path.split('/').filter(Boolean).pop();

  if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID não fornecido' }) };

  try {
    const response = await fetch(`https://api.sunize.com.br/v1/transactions/${id}`, {
      method:  'GET',
      headers: { 'x-api-key': CLIENT_KEY, 'x-api-secret': CLIENT_SECRET }
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
