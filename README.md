# Pila-Plats App

Prototip funcional d'alta fidelitat de **Pila-Plats**, construït amb React 18, TypeScript, Vite, Tailwind CSS v4 i React Router.

Repositori: https://github.com/martifg04/PilaPlatsApp

## Funcionalitat

L'app resol dues tasques principals:

1. **Planificació automàtica del menú setmanal** amb pressupost visible, substitució de plats i llista de la compra generada.
2. **Adaptació d'un àpat imprevist** amb detecció d'ingredients que falten, alternatives compatibles i cuina guiada pas a pas.

També incorpora inici de sessió amb Google o accés com a convidat, configuració inicial de preferències, seguiment de receptes, temporitzador de cuina i persistència local per usuari.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- motion
- lucide-react
- canvas-confetti

## Execució local

Requisits: Node.js i npm.

Des d'aquest directori:

```bash
npm install
npm run dev
```

URL local habitual en desenvolupament:

```text
http://localhost:5173/
```

Per generar la build de producció:

```bash
npm run build
```

Per previsualitzar-la localment:

```bash
npm run preview
```

## Autenticació

- L'accés com a convidat funciona sense configuració externa.
- L'inici de sessió amb Google necessita definir `VITE_GOOGLE_CLIENT_ID` en un fitxer `.env` local:

```bash
VITE_GOOGLE_CLIENT_ID=el_teu_client_id
```

- La sessió i les preferències es conserven en aquest dispositiu mitjançant `localStorage`; l'app no envia aquestes dades a un backend propi.

## Estructura principal

- `src/App.tsx`: router principal i shell de navegació.
- `src/lib/auth.ts`: autenticació local, Google OAuth i accés com a convidat.
- `src/data/mockData.ts`: dades locals del prototip per a plats, menú, ingredients i compra.
- `src/hooks/useMenu.ts`: estat global de menú, preferències, compra, pressupost i toasts.
- `src/components/`: components reutilitzables de layout, UI i elements compartits.
- `src/pages/`: pantalles principals del prototip.
- `public/`: recursos estàtics servits per Vite.
- `test-instruments/`: documents per a prova pilot i test final d'usabilitat.

## Pantalles

- `Login.tsx`: accés amb Google o com a convidat.
- `Onboarding.tsx`: configuració inicial del prototip.
- `Home.tsx`: resum del dia, pressupost, progrés setmanal i entrada a les dues tasques.
- `Menu.tsx`: menú setmanal, selector de dies, substitució i estats de cards.
- `ShoppingList.tsx`: llista de la compra agrupada per categories.
- `Recipes.tsx`: catàleg de plats amb cerca i filtres.
- `RecipeDetail.tsx`: detall estàtic de recepta, ingredients i preparació.
- `AdaptRecipe.tsx`: adaptació d'una recepta quan falta un ingredient.
- `RecipeStepByStep.tsx`: cuina guiada amb progrés, pas actual i confirmació final.
- `SubstitutePlate.tsx`: substitució contextual d'un plat del menú.
- `Profile.tsx`: preferències, restriccions i temps màxim de cuina.

## Test d'usabilitat

Els instruments del test són a `test-instruments/`:

- `01-objectius-metriques.md`
- `02-guio-test.md`
- `03-plantilla-observacio.md`
- `04-questionnaire-sus.md`
- `05-consentiment-informat.md`
- `06-recollida-dades-brutes.md`
- `07-checklist-prova-pilot.md`

Infraestructura recomanada: Chrome o Edge actualitzat, viewport mòbil o ordinador segons participant, gravació de pantalla si hi ha consentiment i full d'observació obert per l'equip.

## Notes tècniques

- L'app no necessita backend.
- L'estat es desa a `localStorage` per usuari per mantenir el menú i les preferències en aquest dispositiu.
- Per reiniciar el prototip abans d'un test, es pot esborrar el `localStorage` del navegador o obrir una sessió nova.
- `vite.config.ts` usa `base: "/pila-plats-app/"` només en producció per facilitar el desplegament a GitHub Pages.
