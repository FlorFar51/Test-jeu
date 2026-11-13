# Noyau Zéro — Version 20

Jeu de survie et d'action en JavaScript Canvas, jouable sur ordinateur et mobile.

## Fonctionnalités
- Carte explorable, plusieurs biomes, ruines et boss.
- Ennemis évolutifs : chasers rouges, tireurs, lanciers, tanks, brutes et bombes.
- Après 7 minutes, une fois tous les types débloqués : 55 % chasers, 8 % tireurs, 15 % lanciers, 10 % tanks, 10 % brutes et 2 % bombes (maximum deux bombes simultanées).
- Élites jaunes rares.
- Progression XP et améliorations de niveau.
- Épée automatique et améliorations.
- Marchand : pistolet 60 pièces, mitraillette 300 puis niveaux 450/650/900, soins illimités à 45 pièces, améliorations d'épée à 100/180/280.
- Coffres : or, XP ou diamant rare.
- Atouts légendaires achetables avec des diamants, avec effets visuels renforcés.
- Coups critiques avec flash, particules, texte doré et onde d'impact.
- Bouton développeur en jeu : ajoute exactement un niveau et ouvre immédiatement le choix d'amélioration suivant.
- Commandes tactiles et clavier/souris, paramètres visuels et mode économie d'énergie.

## Jouer
Ouvrir GitHub Pages dans un navigateur moderne. Sur mobile, le mode paysage est recommandé.

## Fichiers
- `index.html` : interface.
- `style.css` : styles et adaptation mobile.
- `app.js` : logique du jeu.
- `service-worker.js` : cache hors ligne.

Les données locales sont stockées dans `localStorage`.
