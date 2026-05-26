# TurnoClick — Prototipo Frontend

Prototipo navigabile **solo frontend** di TurnoClick, piattaforma SaaS italiana per la gestione dell'attesa e degli appuntamenti in studi medici, fisioterapici e professionali.

> **Nota:** Questo è un prototipo dimostrativo. Non esiste backend, nessuna chiamata HTTP, nessun database. Tutti i dati sono simulati in memoria e si aggiornano automaticamente tramite timer JavaScript per dare l'effetto del tempo reale.

---

## Avvio rapido

```bash
npm install
npm start
```

L'app sarà disponibile su `http://localhost:4200`.

---

## Route principali

### Area Paziente (`/p/...`)
| URL | Descrizione |
|-----|-------------|
| `/p/studio-demo` | Landing page QR — 2 bottoni enormi |
| `/p/studio-demo/coda` | Inserimento in coda — telefono + tipo visita |
| `/p/studio-demo/stato` | Stato coda in tempo reale — codice, persone davanti, timer |
| `/p/studio-demo/prenota` | Prenotazione programmata — stepper 6 passi |

### Area Segreteria (`/dashboard/...`)
| URL | Descrizione |
|-----|-------------|
| `/dashboard` | Panoramica giornaliera con contatori live |
| `/dashboard/coda` | Coda live con drag-and-drop, stato visite, ritardo globale |
| `/dashboard/inserimento` | Inserimento manuale paziente |
| `/dashboard/statistiche` | Statistiche e grafico fasce orarie |
| `/dashboard/archivio` | Storico prenotazioni filtrabile |
| `/dashboard/configurazione` | Configurazione studio (7 sezioni) |

### Area Admin (`/admin/...`)
| URL | Descrizione |
|-----|-------------|
| `/admin` | Panoramica globale piattaforma |
| `/admin/clienti` | Gestione studi clienti |
| `/admin/piani` | Piani di abbonamento |

---

## Demo switcher

La barra nera in cima alla pagina consente di navigare rapidamente tra le tre aree senza autenticazione. **Non esiste in produzione.**

---

## Stack tecnico

- **Angular 19** — standalone components, routing lazy-loaded
- **TypeScript strict**
- **Angular Signals** — stato reattivo
- **RxJS** — timer simulazione real-time (interval 5s)
- **Tailwind CSS** — design system custom con token `tc-*`
- **@angular/cdk** — drag & drop nella coda live
- **Font:** Plus Jakarta Sans (Google Fonts)

## Design

- Mobile-first assoluto (375px+)
- Brand color: verde smeraldo `#10b981`
- Area paziente: accessibile per anziani (bottoni 80px+, testo 22px+)
- Area dashboard/admin: sidebar verde scuro / slate, tabelle compatte

## test
