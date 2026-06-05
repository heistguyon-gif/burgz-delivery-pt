<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Método não permitido']); exit; }

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { http_response_code(400); echo json_encode(['error' => 'Body inválido']); exit; }

$produto = isset($body['produto']) ? $body['produto'] : '';
$valor   = isset($body['valor'])   ? $body['valor']   : '';
$nome    = isset($body['nome'])    ? $body['nome']    : '';
$cpf     = isset($body['cpf'])     ? $body['cpf']     : '';
$tel     = isset($body['tel'])     ? $body['tel']     : '';
$email   = isset($body['email'])   ? $body['email']   : '';

if (!$produto || !$valor || !$nome || !$cpf || !$tel || !$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos obrigatórios faltando.']);
    exit;
}

$cpfLimpo = preg_replace('/\D/', '', $cpf);
if (strlen($cpfLimpo) !== 11) {
    http_response_code(400);
    echo json_encode(['error' => 'CPF inválido.']);
    exit;
}

$telLimpo = preg_replace('/\D/', '', $tel);
$valorNum = floatval($valor);
$ip       = isset($_SERVER['HTTP_X_FORWARDED_FOR'])
              ? explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]
              : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '177.0.0.1');

$CLIENT_KEY    = 'ck_d19809f0ab0b2b64b8e9ed6de245b328';
$CLIENT_SECRET = 'cs_f01a81cb3f1747a7fd9f2eb415a2fe9f';

$payload = [
    'external_id'    => 'ze-' . round(microtime(true) * 1000),
    'total_amount'   => $valorNum,
    'payment_method' => 'PIX',
    'ip'             => trim($ip),
    'customer'       => [
        'name'          => $nome,
        'email'         => $email,
        'phone'         => '+55' . $telLimpo,
        'document_type' => 'CPF',
        'document'      => $cpfLimpo
    ],
    'items' => [[
        'id'          => 'prod-01',
        'title'       => $produto,
        'description' => $produto,
        'price'       => $valorNum,
        'quantity'    => 1,
        'is_physical' => true
    ]]
];

$ch = curl_init('https://api.sunize.com.br/v1/transactions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: '    . $CLIENT_KEY,
        'x-api-secret: ' . $CLIENT_SECRET
    ],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão: ' . $curlErr]);
    exit;
}

http_response_code($httpCode);
echo $response;
