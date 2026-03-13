<?php
// Single session_start at the top
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database connection (only once)
try {
    $pdo = new PDO("mysql:host=localhost;dbname=area_privata", "root", "");
} catch (PDOException $e) {
    header("Location: setup.php");
    exit;
}

// Se l'admin è già loggato, mandalo direttamente alla dashboard
if (isset($_SESSION['admin_loggato']) && $_SESSION['admin_loggato'] === true) {
    header("Location: dashboard.php");
    exit;
}

// Dark mode toggle
if (isset($_POST['toggle_dark_mode'])) {
    $_SESSION['darkMode'] = (isset($_SESSION['darkMode']) && $_SESSION['darkMode'] === 'enabled') ? 'disabled' : 'enabled';
}

$errore = '';

// Login logic
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['username'], $_POST['password'])) {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['admin_loggato'] = true;
        $_SESSION['admin_username'] = $user['username'];
        header("Location: dashboard.php");
        exit;
    } else {
        $errore = "Username o password errati.";
    }
}

// Dark mode vars
$darkMode  = isset($_SESSION['darkMode']) && $_SESSION['darkMode'] === 'enabled';
$bodyClass = $darkMode ? 'dark-mode' : '';
$buttonIcon = $darkMode ? '☀' : '⏾';

?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Login Admin</title>
    <link rel="stylesheet" href="login.css">
</head>
<body class="<?= $bodyClass ?>">
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
                <form method="POST" style="display:inline;">
                    <input type="hidden" name="toggle_dark_mode" value="1">
                    <button type="submit" id="darkModeToggle"><?= $buttonIcon ?></button>
                </form>
            </nav>
        </header>
    </div>

    <div class="login-box">
        <?php if ($errore): ?>
            <div class="errore"><?php echo htmlspecialchars($errore); ?></div>
        <?php endif; ?>
        <form method="POST" action="">
            <h2>Accesso Riservato</h2>
            <label>Username</label>
            <input type="text" name="username" required>
            <label>Password</label>
            <input type="password" name="password" required>
            <button type="submit">Entra</button>
        </form>
    </div>
</body>
</html>