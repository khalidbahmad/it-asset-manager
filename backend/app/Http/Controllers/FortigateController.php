<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Agence;
use App\Models\AgenceInfo;

class FortigateController extends Controller
{
    public function generate(int $id)
    {
        // ── 1. Récupérer agence + IP ──────────────────────────────
        $agence     = Agence::findOrFail($id);
        $agenceInfo = AgenceInfo::where('IDAgence', $id)->first();

        $nomAgence = trim($agence->Agence ?? '');
        $ip        = trim($agenceInfo?->ip_agence ?? '');

        if (!$nomAgence) {
            return response()->json(['error' => "Nom d'agence vide."], 400);
        }
        if (!$ip) {
            return response()->json(['error' => "Cette agence n'a pas d'IP configurée."], 400);
        }

        // ── 2. Extraire l'octet cible depuis l'IP ─────────────────
        $octet = $this->deriveOctet($ip);
        if (!$octet) {
            return response()->json([
                'error' => "IP invalide : {$ip}. Attendu: 172.25.A.B ou 192.168.C.D"
            ], 400);
        }

        // ── 3. Lire le modèle ─────────────────────────────────────
        $templatePath = storage_path('app/fortigate/FORTIGATE40F_CONFIGUE_DE_BASE.CONF');
        if (!file_exists($templatePath)) {
            return response()->json(['error' => 'Fichier modèle introuvable.'], 500);
        }
        $data = file_get_contents($templatePath);

        // ── 4. Réécritures ────────────────────────────────────────
        // Remplacer 172.25.150.X → 172.25.<octet>.X
        $data = preg_replace('~(?<!\d)172\.25\.150\.~', "172.25.{$octet}.", $data);

        // Remplacer 192.168.(31|131|30|130).150 → 192.168.\1.<octet>
        $data = preg_replace(
            '~(?<!\d)192\.168\.(31|131|30|130)\.150(?!\d)~',
            "192.168.$1.{$octet}",
            $data
        );

        // Remplacer hostname et alias (1ère occurrence)
        $tag    = $this->sanitizeForFilename($nomAgence);
        $label  = str_starts_with($tag, 'SUPRATOURS_') ? $tag : "SUPRATOURS_{$tag}";
        $quoted = '"' . str_replace(['\\',' "'], ['\\\\', '\\"'], $label) . '"';

        $data = preg_replace('~^(\s*set\s+hostname\s+)(\".*?\"|\S+)~m', "$1{$quoted}", $data, 1);
        $data = preg_replace('~^(\s*set\s+alias\s+)(\".*?\"|\S+)~m',    "$1{$quoted}", $data, 1);

        // ── 5. Nom du fichier de sortie ───────────────────────────
        $filename = "SUPRATOURS_{$tag}_mod.conf";

        // ── 6. Log audit ──────────────────────────────────────────
        \App\Services\AuditService::log(
            'generate_config', 'agences', $id, null,
            ['filename' => $filename, 'ip' => $ip, 'octet' => $octet]
        );

        // ── 7. Retourner le fichier en téléchargement ─────────────
        return response($data, 200, [
            'Content-Type'        => 'text/plain; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-store',
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private function deriveOctet(string $ip): ?int
    {
        // 172.25.A.B → A
        if (preg_match('~^172\.25\.(\d{1,3})\.\d{1,3}$~', $ip, $m)) {
            $n = (int)$m[1];
            return ($n >= 1 && $n <= 254) ? $n : null;
        }
        // 192.168.C.D → D
        if (preg_match('~^192\.168\.\d{1,3}\.(\d{1,3})$~', $ip, $m)) {
            $n = (int)$m[1];
            return ($n >= 1 && $n <= 254) ? $n : null;
        }
        return null;
    }

    private function sanitizeForFilename(string $agence): string
    {
        $s = trim($agence);
        if ($s === '') return 'AGENCE';
        $trans = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s) ?: $s;
        $trans = strtoupper($trans);
        $trans = preg_replace('/[^A-Z0-9]+/', '_', $trans);
        $trans = trim(preg_replace('/_+/', '_', $trans), '_');
        return $trans ?: 'AGENCE';
    }
}
