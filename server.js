const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Sunize credentials ───────────────────────────────────────────────────────
const CLIENT_KEY    = 'ck_30080f6f2ac715caa1018c9504b75f84';
const CLIENT_SECRET = 'cs_ea07cf1fb4669e0b7fd8e113e38909c7';
const SUNIZE_URL    = 'https://api.sunize.com.br/v1/transactions';

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── POST /api/criar-pix ──────────────────────────────────────────────────────
app.post('/api/criar-pix', async (req, res) => {
  const { produto, valor, nome, cpf, tel, email } = req.body;

  if (!produto || !valor || !nome || !cpf || !tel || !email) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
  }

  const cpfLimpo = String(cpf).replace(/\D/g, '');
  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ error: 'CPF inválido.' });
  }

  const telLimpo = String(tel).replace(/\D/g, '');
  const valorNum = parseFloat(valor);
  const ip       = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '177.0.0.1';

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

    const data = await response.json();

    if (!response.ok) {
      console.error('[Sunize] Erro:', JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    console.log(`[Sunize] PIX criado: ${data.id || ''} | ${produto} | R$ ${valorNum}`);
    return res.json(data);

  } catch (err) {
    console.error('[Sunize] Exceção:', err.message);
    return res.status(500).json({ error: 'Erro interno ao processar pagamento.' });
  }
});

// ── GET /api/status-pix/:id ──────────────────────────────────────────────────
app.get('/api/status-pix/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`${SUNIZE_URL}/${id}`, {
      method:  'GET',
      headers: { 'x-api-key': CLIENT_KEY, 'x-api-secret': CLIENT_SECRET }
    });

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Erro ao consultar transação.' });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor Zé Delivery rodando em http://localhost:${PORT}`);
});
