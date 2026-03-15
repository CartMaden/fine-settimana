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
    <link rel="stylesheet" href="dashboard.css">
</head>

<body style="font-family: Arial; padding: 20px;">
    <div>
        <header>
            <a href="../index.html"><img src="../photo/Logo_Laziodigital.png" alt="logo"></a>
            <nav>
                <a href="../calendario/calendario.html">Calendario</a>
                <a href="../classifica/classifiche.html">Classifica</a>
                <a href="../news/news.html">News</a>
                <a href="../info/info.html">Info</a>
                <a href="../live/live.html">Live</a>
                <a href="../iscrizione/iscrizione.html">Iscriviti</a>
                <button id="darkModeToggle">⏾</button>
            </nav>
        </header>
    </div>


    <button onclick="location.href='matchmaking.php'">Avvia il matchmaking</button>
    <button onclick="location.href='logout.php'" style="color: red;">Esci (Logout)</a>
        <button onclick="location.href='squadre.html'">Visualizza squadre Iscritte</button>

</body>

</html>