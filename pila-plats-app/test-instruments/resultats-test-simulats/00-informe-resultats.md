# Resultats del test d'usabilitat simulat - Pila-Plats

## Nota d'abast

Aquest informe resumeix cinc sessions elaborades per realitzar el
lliurable de resultats del test. Les dades brutes que sustenten el resum
apareixen a l'annex i als expedients P1-P5.

## Mostra i context

Es documenten cinc participants anonimitzats que compleixen els criteris
definits: 18-30 anys, perfil universitari o recent graduat, us habitual de
smartphone, comprensio del catala i cap exposicio previa al prototip. La mostra
inclou tres sessions en telefon i dues en ordinador per observar el flux
mobile-first i la navegacio d'escriptori.

El moderador va preparar l'autenticacio abans de mesurar les tasques. La Tasca
1 comenca amb l'onboarding del prototip per configurar un pressupost de 35
euros, cap restriccio alimentaria i temps moderat, tal com demana el guio.

## Resum quantitatiu

| Mesura | T1 Planificacio | T2 Adaptar apat | T3 Preferencies, regenerar i saltar |
|--------|-----------------|-----------------|-------------------------------------|
| Participants amb exit sense ajuda | 4/5 (80%) | 4/5 (80%) | 3/5 (60%) |
| Participants que completen la tasca amb o sense ajuda | 5/5 (100%) | 5/5 (100%) | 4/5 (80%) |
| Temps mitja | 184 s | 218 s | 268 s |
| Errors mitjans per participant | 0,8 | 1,0 | 2,0 |
| Llindar definit als instruments | >= 80%, <= 300 s, <= 2 errors | >= 70%, <= 300 s, <= 2 errors | >= 60%, <= 300 s, <= 3 errors |

La puntuacio SUS mitjana de la mostra simulada es **78,5/100**. Queda per sobre
del llindar acceptable de 70, amb un rang de 62,5 a 92,5. P4 concentra la
valoracio mes baixa i tambe el bloqueig mes clar a la Tasca 3.

## Lectura per tasques

### Tasca 1 - Planificacio setmanal

La majoria de participants entenen l'onboarding i arriben al menu sense ajuda.
La substitucio de plat es el pas amb mes exploracio: un participant obre primer
`Veure recepta` i necessita un indici per localitzar les opcions contextuals del
plat. La llista de la compra i el marcat de tres elements es reconeixen amb
facilitat quan ja s'ha entrat a la vista `Compra`.

### Tasca 2 - Adaptar un apat imprevist

El cami des de l'apat del dia fins a `Adaptar recepta` funciona be quan el
participant parteix de Home o de la recepta contextual del menu. El dubte
principal apareix a la llista d'ingredients disponibles: com tots els
checkboxes comencen marcats, alguns participants triguen uns segons a inferir
que han de desmarcar l'ingredient que falta. Un cop triada l'alternativa,
l'etiqueta de plat canviat i el retorn al menu ajuden a continuar fins a la
cuina guiada i `He acabat!`.

### Tasca 3 - Preferencies, regenerar menu i saltar plat

Es la tasca mes llarga i amb mes canvi de context. Tres participants completen
el flux sense ajuda. P2 necessita que el moderador li recordi que el menu s'ha
de regenerar despres de desar preferencies. P4 modifica les preferencies, torna
al menu i explora plats, pero arriba al temps maxim sense completar la
regeneracio i la comprovacio final de la llista. La verificacio de si la compra
s'ha recalculat despres de `Saltar plat` es menys evident que la baixada de
pressupost, perque no hi ha comparacio abans/despres visible.

## Problemes observats

| ID | Problema observat | Participants | Gravetat | Comentari |
|----|-------------------|--------------|----------|-----------|
| R01 | `Substituir plat` i `Saltar plat` depenen de les opcions contextuals del plat. | P2, P3, P4 | 2 | El patro de tres punts s'entén, pero alguns participants proven abans la recepta o el menu global. |
| R02 | Desar preferencies no fa evident que cal regenerar el menu despres. | P2, P4 | 3 | El retorn a Home dona sensacio de canvi completat abans d'executar `Regenerar menu`. |
| R03 | La llista recalculada despres de saltar un apat no mostra cap diff explicit. | P1, P2, P4 | 2 | Els participants miren el total o el recompte, pero no sempre poden justificar quin producte ha desaparegut. |
| R04 | A l'adaptacio, indicar que falta un ingredient implica desmarcar un checkbox inicialment marcat. | P3, P4 | 2 | El text de la tasca ajuda, pero la semantica `ingredient disponible` requereix una pausa. |

## Evidencies a l'annex

Les dades sense elaborar es llisten a
[`annexos/00-dades-brutes-recollides.md`](./annexos/00-dades-brutes-recollides.md).
Cada expedient de sessio conserva:

- Full d'observacio amb temps, errors, passos i comentaris en veu alta.
- Qüestionari SUS marcat amb la puntuacio calculada.
- Copia anonimitzada del consentiment informat.

