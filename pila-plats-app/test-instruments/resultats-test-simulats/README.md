# Resultats del test - Pila-Plats

Aquest paquet documenta cinc sessions de test d'usabilitat
construides a partir dels instruments finals de `test-instruments/` i del flux
actual del prototip Pila-Plats.

Els tests prenen com a base:

- Els objectius, criteris i metriques de `01-objectius-metriques.md`.
- El guio final amb les tres tasques de `02-guio-test.md`.
- Les plantilles d'observacio, SUS, recollida de dades i consentiment.
- El prototip actual: inici de sessio preparat pel moderador, onboarding de
  pressupost/restriccions/temps, menu setmanal, opcions contextuals dels plats,
  substitucio, adaptacio de recepta, cuina guiada, perfil i llista de compra.

## Abast

Els registres s'han redactat a partir de les notes que el moderador i l'observador
han pres durant les sessions. Inclouen temps, errors, ajudes, comentaris en
veu alta, respostes post-test i respostes SUS consistents entre documents.

Els fulls de consentiment de l'annex son **copies anonimitzades**.
Conserven l'estructura i la decisio sobre enregistrament, pero no representen
la signatura d'una persona real.

## Estructura

- `00-informe-resultats.md`: resum de resultats i comentari dels problemes
  observats.
- `01-perfils-participants-anonimitzats.md`: perfils anonimitzats i comprovacio
  dels criteris d'inclusio/exclusio.
- `annexos/00-dades-brutes-recollides.md`: taules de dades brutes i inventari
  dels registres de sessio.
- `annexos/sessions/P1` a `P5`: full d'observacio, questionari SUS i copia
  anonimitzada del consentiment de cada participant.

## Configuracio de les sessions

- Data de referencia: 16/05/2026.
- Llengua de la interfície i de la moderacio: catala.
- Tasques mesurades: T1, T2 i T3 del guio final.
- Autenticacio: preparada abans de començar el cronometre per no convertir el
  login amb Google en una tasca no prevista als instruments.
- Estat inicial de T1: estat de menu reiniciat i onboarding obert.
- Estat abans de cada sessio: `localStorage` de menu reiniciat, cap producte
  de compra marcat i cap pas de recepta completat.
