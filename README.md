# Noyau Zéro — Version 21

Jeu de survie et d'action en JavaScript Canvas, jouable sur ordinateur et mobile.

## Progression
- La progression XP et les niveaux sont désormais sans plafond.
- Les améliorations classiques restent limitées à 3/3.
- Quand toutes les améliorations classiques sont au maximum, les niveaux suivants affichent les atouts légendaires encore disponibles, achetables avec des diamants.
- Si tous les atouts légendaires sont déjà acquis, un bouton permet de continuer sans rester bloqué.
- Un petit bouton développeur « +1 XP » se trouve dans le menu pause.

## Fonctionnalités
- Carte explorable, plusieurs biomes, ruines et boss.
- Ennemis évolutifs : chasers rouges, tireurs, lanciers, tanks, brutes et bombes.
- Après 7 minutes : 55 % chasers, 8 % tireurs, 15 % lanciers, 10 % tanks, 10 % brutes et 2 % bombes (maximum deux bombes simultanées).
- Élites jaunes rares.
- Épée automatique et améliorations.
- Marchand : pistolet 60 pièces, mitraillette 300 puis niveaux 450/650/900, soins illimités à 45 pièces, améliorations d'épée à 100/180/280.
- Coffres : or, XP ou diamant rare.
- Atouts légendaires achetables avec des diamants, avec effets visuels renforcés.
- Coups critiques avec flash, particules, texte doré et onde d'impact.

## Jouer
Ouvrir GitHub Pages dans un navigateur moderne. Sur mobile, le mode paysage est recommandé.

## Fichiers
- `index.html` : interface.
- `style.css` : styles et adaptation mobile.
- `app.js` : logique du jeu.
- `service-worker.js` : cache hors ligne.

Les données locales sont stockées dans `localStorage`.
