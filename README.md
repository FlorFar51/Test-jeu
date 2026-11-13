# Noyau Zéro — Version 18

Jeu de survie et d'action développé en JavaScript avec Canvas, jouable sur ordinateur et mobile.

## Fonctionnalités
- Grande carte explorable composée de plusieurs biomes.
- Vagues d'ennemis, ennemis élites, boss et ruines spécifiques.
- Progression par expérience et améliorations à chaque niveau.
- Épée automatique : dégâts, portée, recharge et vampirisme améliorables.
- Marchand pendant la partie :
  - Pistolet : 80 pièces d'or.
  - Transformation en mitraillette : 300 pièces.
  - Améliorations supplémentaires de mitraillette : 450, 650 et 900 pièces.
  - Soin complet : 45 pièces, achetable sans limite.
  - Trois améliorations payantes de l'épée : 100, 180 et 280 pièces.
- Coffres apparaissant régulièrement sur la carte :
  - Or : 60 à 120 pièces.
  - Expérience : 25 à 40 XP.
  - Diamant très rare : 3 % de chance, utilisable pour débloquer des atouts légendaires.
- Noyaux de boss, atouts légendaires, records et statistiques.
- Commandes adaptées au clavier/souris et aux écrans tactiles.
- Paramètres visuels et mode économie d'énergie.

## Jouer
Ouvrir GitHub Pages dans un navigateur moderne. Sur mobile, le mode paysage est recommandé.

## Fichiers
- `index.html` : structure et interface.
- `style.css` : apparence et adaptation mobile.
- `app.js` : logique du jeu.
- `service-worker.js` : cache hors ligne et mises à jour.

Les pièces et diamants sont conservés localement dans le navigateur via `localStorage`.
