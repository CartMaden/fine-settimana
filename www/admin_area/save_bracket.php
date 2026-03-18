<?php
// save_bracket.php — Salva lo stato del bracket su file JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Metodo non consentito"]);
    exit;
}

$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

// array_key_exists invece di isset: isset() restituisce false per null,
// quindi { bracket: null } (reset) veniva rifiutato senza sovrascrivere il file.
if (json_last_error() !== JSON_ERROR_NONE || !array_key_exists("bracket", $data)) {
    echo json_encode(["success" => false, "message" => "Dati non validi"]);
    exit;
}

$file = __DIR__ . "/classifica_pubblica.json";

// bracket === null significa reset: svuota completamente il file
if ($data["bracket"] === null) {
    $ok = file_put_contents($file, json_encode(["saved_at" => date("c"), "bracket" => null, "rounds" => []], JSON_PRETTY_PRINT));
    if ($ok === false) {
        echo json_encode(["success" => false, "message" => "Impossibile scrivere classifica_pubblica.json"]);
    } else {
        echo json_encode(["success" => true, "reset" => true]);
    }
    exit;
}

$payload = [
    "saved_at" => date("c"),
    "bracket"  => $data["bracket"],
    "rounds"   => $data["rounds"] ?? [],
];

$ok = file_put_contents($file, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($ok === false) {
    echo json_encode(["success" => false, "message" => "Impossibile scrivere classifica_pubblica.json"]);
} else {
    echo json_encode(["success" => true, "saved_at" => $payload["saved_at"]]);
}
