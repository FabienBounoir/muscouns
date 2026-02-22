# Icônes PWA – Muscouns

Placer ici les icônes générées depuis le logo source (`/static/favicon.png`).

## Fichiers requis

| Fichier | Taille | Usage |
|---|---|---|
| `icon-192.png` | 192×192 | Android / manifest standard |
| `icon-512.png` | 512×512 | Android splash / manifest |
| `icon-512-maskable.png` | 512×512 | Android adaptive icon (safe zone centrée) |
| `icon-180.png` | 180×180 | Apple Touch Icon (iOS) |

## Génération rapide

```bash
# Avec sharp-cli (Node)
npx sharp-cli --input ../favicon.png --output icon-192.png resize 192 192
npx sharp-cli --input ../favicon.png --output icon-512.png resize 512 512
npx sharp-cli --input ../favicon.png --output icon-512-maskable.png resize 512 512
npx sharp-cli --input ../favicon.png --output icon-180.png resize 180 180
```

Ou utiliser https://maskable.app pour générer l'icône maskable avec la bonne safe zone.
