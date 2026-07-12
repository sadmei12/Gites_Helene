<?php
/**
 * Formulaire de contact — Gîtes Hélène (o2switch).
 * Envoie les messages vers la boîte Hélène.
 *
 * Sur o2switch, créez l’adresse CONTACT_FROM dans cPanel → Comptes email,
 * ou modifiez les constantes ci-dessous.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Méthode non autorisée.']);
    exit;
}

$contactConfig = [
    'to' => 'helenemarseille@orange.fr',
    'from' => 'contact@gite-embrun.fr',
    'from_name' => 'Gîtes Hélène — site web',
];

$configFile = __DIR__ . '/contact.config.php';
if (is_readable($configFile)) {
    $override = require $configFile;
    if (is_array($override)) {
        $contactConfig = array_merge($contactConfig, $override);
    }
}

function respond(bool $ok, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'error' => $ok ? null : $message]);
    exit;
}

function clean_line(string $value): string
{
    return str_replace(["\r", "\n", "\0"], '', trim($value));
}

$honeypot = clean_line((string) ($_POST['website'] ?? ''));
if ($honeypot !== '') {
    respond(true, '');
}

$name = clean_line((string) ($_POST['name'] ?? ''));
$email = clean_line((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    respond(false, 'Indiquez votre nom (2 à 100 caractères).', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Adresse email invalide.', 400);
}

if ($message === '' || mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    respond(false, 'Votre message doit contenir entre 10 et 5 000 caractères.', 400);
}

$subject = 'Contact site — ' . $name;
$body = "Nouveau message depuis le formulaire de contact gite-embrun.fr\n\n";
$body .= "Nom : {$name}\n";
$body .= "Email : {$email}\n";
$body .= 'Date : ' . date('d/m/Y H:i') . " (heure serveur)\n\n";
$body .= "Message :\n{$message}\n";

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . $contactConfig['from_name'] . ' <' . $contactConfig['from'] . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
];

$sent = @mail(
    $contactConfig['to'],
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $body,
    implode("\r\n", $headers)
);

if (!$sent) {
    respond(false, 'L’envoi a échoué. Réessayez ou contactez-nous par email.', 500);
}

respond(true, '');
