# 🎯 Debito Zero - Solvo

Piattaforma web interattiva per assistenza nella gestione dei debiti. Wizard intuitivo che guida gli utenti attraverso un percorso personalizzato e li mette in contatto con professionisti qualificati.

## 🆕 Ultime Funzionalità (v2.0)

### ✅ Dashboard e Gestione
- **Dashboard Professionisti**: Area riservata per gestire dati anagrafici e professionali
- **Dashboard Admin**: Pannello amministrativo con statistiche, export CSV e gestione richieste
- **Sistema di Login**: Accesso protetto per professionisti e amministratori
- **Upload Documenti**: Carica CV, certificazioni e documenti per attestare professionalità
- **Sincronizzazione Dati**: Modifiche nella dashboard professionale si riflettono automaticamente nella lista professionisti

### ✅ SEO e Privacy
- **SEO Completo**: Meta tags, Open Graph, Twitter Cards, Structured Data (JSON-LD)
- **Privacy Policy**: Pagina completa conforme GDPR con tutti i diritti utente
- **Sitemap.xml e robots.txt**: Ottimizzazione per motori di ricerca
- **Favicon**: Icona personalizzata per il sito

### ✅ Export e Statistiche
- **Export CSV**: Esporta richieste clienti e dati professionisti in formato Excel
- **Statistiche Admin**: Dashboard con grafici, trend mensili e distribuzione debiti
- **Analisi Dati**: Visualizzazione completa delle metriche del sito

### ✅ Email e Notifiche
- **Email Automatiche**: Integrazione EmailJS per invio richieste
- **Email Conferma Cliente**: Conferma automatica dopo invio richiesta
- **Email Prenotazioni**: Notifica professionisti quando un cliente prenota

### ✅ UX e Design
- **Salvataggio Automatico**: LocalStorage per salvare progresso wizard (24h)
- **Validazione Real-time**: Feedback immediato durante la compilazione
- **Animazioni Smooth**: Transizioni fluide tra le pagine
- **Font Rilassante**: Inter font per un'esperienza più confortevole
- **Sfondi Dinamici**: Pattern diversi per ogni pagina per trasmettere serenità
- **Design Responsive**: Ottimizzato per tutti i dispositivi

## 🌟 Caratteristiche Principali

- **Wizard Interattivo a 3 Step**: processo guidato semplice e intuitivo
- **Calcolo Automatico Debiti**: inserisci importi per tipologia e visualizza il totale
- **Database 50+ Professionisti**: avvocati, commercialisti, OCC certificati
- **Ricerca e Filtri Avanzati**: trova il professionista giusto per le tue esigenze
- **Invio Email Automatico**: integrazione con EmailJS (200 email/mese gratis)
- **Design Rilassante**: palette colori calmi, UI pulita e professionale
- **Responsive**: ottimizzato per desktop, tablet e smartphone
- **Accessibile**: conforme agli standard WCAG 2.1

## 💻 Tecnologie Utilizzate

- **HTML5**: struttura semantica e accessibile
- **CSS3**: variabili CSS, Flexbox, Grid Layout, animazioni
- **JavaScript ES6+**: modulare e ben organizzato
- **EmailJS**: servizio email senza backend (200 email/mese gratis)
- **Supabase**: storage cloud per documenti (500MB gratis)
- **LocalStorage**: salvataggio dati lato client

## 🚀 Demo Online

Apri `index.html` nel browser per testare localmente.

Per pubblicarlo online:
1. Carica su GitHub Pages (gratis)
2. Carica su Netlify Drop (gratis, 2 minuti)
3. Carica su Vercel (gratis, professionale)

## ⚙️ Configurazione

### Email (EmailJS)
1. Crea account gratuito su [EmailJS](https://www.emailjs.com)
2. Configura un servizio email (Gmail consigliato)
3. Crea un template email
4. Inserisci le credenziali in `app.js` (riga 3-9)

Vedi `SETUP-RAPIDO.txt` o `CONFIGURAZIONE-COMPLETA.txt` per istruzioni dettagliate.

### Storage Documenti (Supabase - Opzionale)
1. Crea account gratuito su [Supabase](https://supabase.com)
2. Crea un nuovo progetto
3. Crea bucket storage "professional-documents"
4. Inserisci le credenziali in `index.html` (riga 92-95)

**Nota**: Se Supabase non è configurato, i documenti vengono salvati in localStorage (funziona ma limitato).

### Accesso Dashboard
- **Professionista**: Username `gianluca90` / Password `gianluca90`
- **Admin**: Username `admin` / Password `admin`

Vedi `ACCESSO-DASHBOARD.txt` per dettagli.

## 📂 File del Progetto

### File Principali
- `index.html` - Pagina principale con tutte le funzionalità
- `styles.css` - Stili CSS completi
- `app.js` - Logica JavaScript (2500+ righe)
- `sitemap.xml` - Sitemap per SEO
- `robots.txt` - File robots per motori di ricerca
- `favicon.svg` - Icona del sito

### File di Configurazione
- `CONFIGURAZIONE-COMPLETA.txt` - Guida completa EmailJS + Supabase
- `SETUP-RAPIDO.txt` - Guida rapida 10 minuti
- `CONFIG-EMAIL.txt` - Guida EmailJS (legacy)
- `ACCESSO-DASHBOARD.txt` - Credenziali accesso

### File Informativi
- `README.md` - Questo file
- `BACKEND-OPZIONI.txt` - Opzioni backend per documenti
- `COSA-E-SEO.txt` - Spiegazione SEO
- `DEPLOY-ONLINE.txt` - Come pubblicare online
- `AGGIORNA-GITHUB-ESISTENTE.txt` - Come aggiornare repository GitHub

## 📄 Licenza

MIT License - Sentiti libero di usare questo progetto per i tuoi scopi!

## 👤 Creato con ❤️

Piattaforma creata per aiutare le persone a gestire i propri debiti in modo consapevole e professionale.

