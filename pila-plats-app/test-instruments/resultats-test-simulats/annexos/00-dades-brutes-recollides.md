# Annex - Dades brutes recollides del test simulat

## Llegenda

- `SH`: exit sense ajuda.
- `AH`: exit amb ajuda.
- `F`: fracas o tasca aturada sense completar els indicadors finals.
- Els temps son segons cronometrats des de l'inici de cada tasca.
- A T3, P4 s'atura als 300 segons segons el llindar operatiu del test.

## Taula de resultats quantitatius

| Participant | Exit T1 | Temps T1 (s) | Errors T1 | Ajuda T1 | Exit T2 | Temps T2 (s) | Errors T2 | Ajuda T2 | Exit T3 | Temps T3 (s) | Errors T3 | Ajuda T3 | SUS |
|------------|---------|--------------|-----------|----------|---------|--------------|-----------|----------|---------|--------------|-----------|----------|-----|
| P1 | SH | 142 | 0 | Cap | SH | 188 | 1 | Cap | SH | 248 | 1 | Cap | 87,5 |
| P2 | SH | 176 | 1 | Cap | SH | 201 | 0 | Cap | AH | 289 | 2 | Nivell 3 | 77,5 |
| P3 | AH | 236 | 2 | Nivell 2 | SH | 226 | 1 | Cap | SH | 271 | 2 | Cap | 72,5 |
| P4 | SH | 214 | 1 | Cap | AH | 279 | 2 | Nivell 2 | F | 300 | 4 | Nivells 1, 3 i 5 | 62,5 |
| P5 | SH | 151 | 0 | Cap | SH | 194 | 1 | Cap | SH | 233 | 1 | Cap | 92,5 |

## Resultats per passos clau

| Tasca | Pas clau | Sense ajuda | Amb ajuda | No completat | Observacio bruta |
|-------|----------|-------------|-----------|--------------|-------------------|
| T1 | Configura dades inicials | 5 | 0 | 0 | Onboarding completat a totes les sessions. |
| T1 | Accedeix al menu setmanal | 5 | 0 | 0 | P3 fa pausa a Home abans de triar el menu. |
| T1 | Substitueix un plat | 4 | 1 | 0 | P3 necessita indici sobre opcions del plat. |
| T1 | Accedeix a la llista de la compra | 5 | 0 | 0 | Cap bloqueig. |
| T1 | Marca 3 elements com a comprats | 5 | 0 | 0 | Tots usen checkboxes de producte. |
| T2 | Localitza el sopar del dia | 5 | 0 | 0 | P2 arriba des del menu; P1 i P5 parteixen de Home. |
| T2 | Adapta la recepta per ingredient absent | 4 | 1 | 0 | P4 necessita indici per desmarcar ingredient disponible. |
| T2 | Completa almenys 2 passos | 5 | 0 | 0 | Mode de cuina guiat reconegut. |
| T2 | Prem `He acabat!` | 5 | 0 | 0 | Cap bloqueig al pas final. |
| T3 | Troba perfil/preferencies | 4 | 1 | 0 | P4 rep indici verbal de perfil. |
| T3 | Redueix pressupost i activa receptes rapides | 5 | 0 | 0 | P4 ho completa despres de l'indici inicial. |
| T3 | Regenera el menu | 3 | 1 | 1 | P2 rep indici; P4 no tanca el pas dins del temps. |
| T3 | Salta un sopar | 4 | 0 | 1 | P2 s'autocorregeix despres d'obrir la recepta; P4 no completa. |
| T3 | Comprova pressupost i llista actualitzats | 2 | 2 | 1 | La comprovacio de compra es verbalment dubtosa a P1 i P2. |

## Problemes anotats durant la recollida

| ID | Descripcio del problema | Participants afectats | Frequencia | Gravetat (1-4) | Heuristica Nielsen relacionada |
|----|-------------------------|-----------------------|------------|----------------|-------------------------------|
| P01 | Opcions de plat poc visibles abans d'obrir el boto de tres punts. | P2, P3, P4 | 3/5 | 2 | Reconeixement abans que record |
| P02 | Expectativa que desar preferencies ja actualitza el menu. | P2, P4 | 2/5 | 3 | Visibilitat de l'estat del sistema |
| P03 | Verificar la llista recalculada requereix inferir canvis pel total o recompte. | P1, P2, P4 | 3/5 | 2 | Visibilitat de l'estat del sistema |
| P04 | Ingredient absent s'indica desmarcant un element que surt disponible. | P3, P4 | 2/5 | 2 | Correspondencia sistema-mon real |

## Inventari de dades brutes per sessio

| Codi | Full d'observacio | SUS | Consentiment anonimitzat |
|------|-------------------|-----|---------------------------|
| P1 | [`observacio-P1.md`](./sessions/P1/observacio-P1.md) | [`questionari-SUS-P1.md`](./sessions/P1/questionari-SUS-P1.md) | [`consentiment-P1-anonimitzat.md`](./sessions/P1/consentiment-P1-anonimitzat.md) |
| P2 | [`observacio-P2.md`](./sessions/P2/observacio-P2.md) | [`questionari-SUS-P2.md`](./sessions/P2/questionari-SUS-P2.md) | [`consentiment-P2-anonimitzat.md`](./sessions/P2/consentiment-P2-anonimitzat.md) |
| P3 | [`observacio-P3.md`](./sessions/P3/observacio-P3.md) | [`questionari-SUS-P3.md`](./sessions/P3/questionari-SUS-P3.md) | [`consentiment-P3-anonimitzat.md`](./sessions/P3/consentiment-P3-anonimitzat.md) |
| P4 | [`observacio-P4.md`](./sessions/P4/observacio-P4.md) | [`questionari-SUS-P4.md`](./sessions/P4/questionari-SUS-P4.md) | [`consentiment-P4-anonimitzat.md`](./sessions/P4/consentiment-P4-anonimitzat.md) |
| P5 | [`observacio-P5.md`](./sessions/P5/observacio-P5.md) | [`questionari-SUS-P5.md`](./sessions/P5/questionari-SUS-P5.md) | [`consentiment-P5-anonimitzat.md`](./sessions/P5/consentiment-P5-anonimitzat.md) |
