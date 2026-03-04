<?php
session_start();

// IL BUTTAFUORI: Se non hai il pass (la sessione), torni al login
if (!isset($_SESSION['admin_loggato']) || $_SESSION['admin_loggato'] !== true) {
    header("Location: login.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Pannello di Controllo</title>
</head>
<body style="font-family: Arial; padding: 20px;">
    
    <h1>Benvenuto nell'Area Admin! 🛡️</h1>
    <p>Ciao <strong><?php echo $_SESSION['admin_username']; ?></strong>, ce l'hai fatta.</p>
    <p>Questa pagina è protetta. Se provi ad aprirla su un altro browser o in navigazione in incognito senza fare il login, verrai bloccato.</p>
    
    <a href="logout.php" style="color: red;">Esci (Logout)</a>

</body>
</html>