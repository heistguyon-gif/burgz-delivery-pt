<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID não fornecido']);
    exit;
}

$CLIENT_KEY    = 'ck_d19809f0ab0b2b64b8e9ed6de245b328';
$CLIENT_SECRET = 'cs_f01a81cb3f1747a7fd9f2eb415a2fe9f';

$ch = curl_init('https://api.sunize.com.br/v1/transactions/' . urlencode($id));
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'x-api-key: '    . $CLIENT_KEY,
        'x-api-secret: ' . $CLIENT_SECRET
    ],
    CURLOPT_TIMEOUT        => 15,
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
