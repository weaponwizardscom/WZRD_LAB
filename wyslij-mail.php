<?php
// Używamy przestrzeni nazw PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Dołączamy potrzebne pliki z folderu src, który wcześniej stworzyliśmy
require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

// Sprawdzamy, czy dane zostały wysłane metodą POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $mail = new PHPMailer(true);

    try {
        // === KONFIGURACJA SERWERA SMTP (GMAIL) ===
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Port       = 587; // lub 465, jeśli 587 nie działa
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->CharSet    = 'UTF-8'; // Ustawienie kodowania znaków

        // === TWOJE DANE LOGOWANIA (TUTAJ WPISZ SWOJE DANE) ===
        // 1. Uzupełnij swój adres email z Gmaila
        $mail->Username   = 'wzrd_lab@gmail.com'; // <--- UZUPEŁNIJ TUTAJ (jeśli inny)
        
        // 2. Uzupełnij 16-znakowe HASŁO DO APLIKACJI, które wygenerowałeś
        $mail->Password   = 'dkxs aqti meao ebsf'; // <--- UZUPEŁNIJ TUTAJ
        
        // === NADAWCA I ODBIORCA ===
        // Adres "Od kogo" (musi być taki sam jak Username)
        $mail->setFrom('wzrd_lab@gmail.com', 'Konfigurator Weapon Wizards'); 
        
        // 3. Uzupełnij adres, na który chcesz otrzymywać wiadomości
        $mail->addAddress('contact@weapon-wizards.com', 'WZRD LAB'); // <--- UZUPEŁNIJ TUTAJ
        
        // Odpowiedz do (adres wpisany przez klienta w formularzu)
        $mail->addReplyTo($_POST['email'], $_POST['name']);

        // === TREŚĆ WIADOMOŚCI ===
        $mail->isHTML(true);
        $mail->Subject = 'Nowy projekt z konfiguratora od: ' . $_POST['name'];
        
        // Bezpiecznie pobieramy dane z formularza
        $name = htmlspecialchars($_POST['name']);
        $email = htmlspecialchars($_POST['email']);
        $phone = htmlspecialchars($_POST['phone']);
        $summary = nl2br(htmlspecialchars($_POST['summary'])); // nl2br zamienia znaki nowej linii na tagi <br>
        $cost = htmlspecialchars($_POST['cost']);

        // Tworzymy treść maila w HTML dla lepszego formatowania
        $mail->Body    = "
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                <h2 style='color: #333;'>Nowy projekt z konfiguratora!</h2>
                <p><strong>Imię i nazwisko:</strong> {$name}</p>
                <p><strong>E-mail:</strong> {$email}</p>
                <p><strong>Telefon:</strong> {$phone}</p>
                <p><strong>Szacowany koszt:</strong> {$cost}</p>
                <hr>
                <h3 style='color: #333;'>Podsumowanie projektu:</h3>
                <div style='background-color: #f9f9f9; border: 1px solid #ddd; padding: 10px; border-radius: 5px;'>
                    <p style='margin: 0;'>{$summary}</p>
                </div>
                <hr>
                <p>Obraz projektu znajduje się w załączniku.</p>
            </body>
            </html>
        ";
        
        // === ZAŁĄCZNIK (OBRAZEK) ===
        if (isset($_POST['image'])) {
            // Usuwamy nagłówek 'data:image/png;base64,' z danych obrazka
            $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $_POST['image']));
            // Dodajemy obrazek jako załącznik
            $mail->addStringAttachment($imageData, 'projekt-broni.png', 'base64', 'image/png');
        }

        $mail->send();
        // Jeśli wszystko się udało, wysyłamy odpowiedź sukcesu do app.js
        echo json_encode(['status' => 'success', 'message' => 'Wiadomość została wysłana.']);

    } catch (Exception $e) {
        // Jeśli wystąpił błąd, wysyłamy odpowiedź z błędem do app.js
        echo json_encode(['status' => 'error', 'message' => "Błąd wysyłki: {$mail->ErrorInfo}"]);
    }
} else {
    // Jeśli ktoś spróbuje wejść na ten plik bezpośrednio przez przeglądarkę
    echo "Dostęp zabroniony.";
}
?>