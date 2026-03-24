<!-- resources/views/emails/welcome-employee.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .card { background: #fff; border-radius: 8px; padding: 30px; max-width: 500px; margin: auto; }
        .title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 20px; }
        .info { background: #f0f4ff; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .label { font-size: 12px; color: #888; }
        .value { font-size: 15px; font-weight: bold; color: #333; }
        .footer { font-size: 11px; color: #aaa; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="title">👋 Bienvenue, {{ $employeeName }} !</div>
        <p>Votre compte IT Inventory a été créé. Voici vos identifiants :</p>

        <div class="info">
            <div class="label">Email</div>
            <div class="value">{{ $email }}</div>
        </div>
        <div class="info">
            <div class="label">Mot de passe</div>
            <div class="value">{{ $password }}</div>
        </div>

        <p style="color:#e74c3c; font-size:12px;">
            ⚠️ Changez votre mot de passe après la première connexion.
        </p>
        <div class="footer">IT Inventory — Système de Gestion des Équipements</div>
    </div>
</body>
</html>