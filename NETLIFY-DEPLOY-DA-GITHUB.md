# 🚀 Guida Completa: Deploy Netlify da GitHub

## 📋 Prerequisiti

- ✅ Account GitHub (se non ce l'hai: https://github.com)
- ✅ Account Netlify (se non ce l'hai: https://app.netlify.com)
- ✅ Progetto caricato su GitHub

---

## 🔹 PASSO 1: Caricare il Progetto su GitHub

### Opzione A: GitHub Web (⭐ Più Semplice)

1. **Vai su GitHub**: https://github.com
2. **Accedi** (o registrati se non hai account)
3. **Crea nuovo repository**:
   - Clicca "+" in alto a destra → "New repository"
   - Nome: `debito-zero-solvo` (o quello che preferisci)
   - Descrizione: `Piattaforma gestione debiti`
   - ✅ **Public** (o Private se preferisci)
   - ❌ **NON** selezionare "Add README" (lo abbiamo già)
   - Clicca **"Create repository"**

4. **Carica i file**:
   - Nella pagina del repository, clicca **"Add file"** → **"Upload files"**
   - Apri Explorer: `C:\Users\gianl\OneDrive\Desktop\Debito Zero`
   - Trascina questi file nel browser:
     - ✅ `index.html`
     - ✅ `app.js`
     - ✅ `styles.css`
     - ✅ `README.md`
     - ✅ `favicon.svg`
     - ✅ `robots.txt`
     - ✅ `sitemap.xml`
     - ✅ Tutti gli altri file necessari (es. `netlify.toml`)
   - Scorri in basso, inserisci: **"Initial commit - Debito Zero Solvo"**
   - Clicca **"Commit changes"**

5. **✅ Fatto!** Il progetto è su GitHub.

### Opzione B: GitHub Desktop (Alternativa)

1. **Scarica GitHub Desktop**: https://desktop.github.com
2. **Installa e accedi** con il tuo account GitHub
3. **Crea nuovo repository**:
   - File → New repository
   - Nome: `debito-zero-solvo`
   - Local path: `C:\Users\gianl\OneDrive\Desktop\Debito Zero`
   - ✅ Initialize this repository with a README
   - Clicca **"Create repository"**

4. **Carica i file**:
   - Tutti i file sono già nella cartella
   - Scrivi un messaggio: "Initial commit - Debito Zero Solvo"
   - Clicca **"Commit to main"**
   - Clicca **"Publish repository"**

5. **✅ Fatto!** Il progetto è su GitHub.

---

## 🔹 PASSO 2: Collegare GitHub a Netlify

1. **Vai su Netlify**: https://app.netlify.com
2. **Accedi** (o registrati se non hai account)
3. **Apri il menu "Add new site"**:
   - Clicca **"Add new site"** → **"Import an existing project"**
   - Oppure: Clicca **"Sites"** → **"New site"** → **"Import an existing project"**

4. **Autorizza GitHub**:
   - Clicca **"GitHub"** (o "GitLab" / "Bitbucket" se preferisci)
   - Se è la prima volta, clicca **"Authorize Netlify"**
   - Autorizza Netlify ad accedere ai tuoi repository

5. **Seleziona il repository**:
   - Cerca `debito-zero-solvo` (o il nome che hai scelto)
   - Clicca sul repository

6. **Configura il deploy**:
   - **Branch to deploy**: `main` (o `master` se è quello che usi)
   - **Base directory**: (lascia vuoto se i file sono nella root)
   - **Build command**: (lascia vuoto - è un sito statico)
   - **Publish directory**: (lascia vuoto o metti `/` - Netlify rileva automaticamente `index.html`)

7. **Clicca "Deploy site"**

8. **✅ Fatto!** Netlify inizia il deploy (1-2 minuti)

---

## 🔹 PASSO 3: Personalizzare il Sito

1. **Attendi il deploy** (vedrai "Building" → "Published")
2. **Ottieni il link**:
   - Il link sarà: `https://random-name-123.netlify.app`
   - Clicca sul link per vedere il sito

3. **Cambia il nome del sito**:
   - Vai su **"Site settings"** (in alto a destra)
   - Clicca **"Change site name"**
   - Scegli un nome: `debito-zero-solvo` (se disponibile)
   - Il link diventa: `https://debito-zero-solvo.netlify.app`

4. **✅ Fatto!** Il sito è online!

---

## 🔹 PASSO 4: Deploy Automatico (Opzionale)

### Configurazione Automatica

1. **Ogni volta che fai push su GitHub**, Netlify fa il deploy automatico:
   - Modifichi un file su GitHub
   - Netlify rileva il cambiamento
   - Fa il deploy automatico (1-2 minuti)
   - Il sito si aggiorna automaticamente

2. **Per disattivare il deploy automatico**:
   - Vai su **"Site settings"** → **"Build & deploy"**
   - Sezione **"Continuous Deployment"**
   - Clicca **"Stop auto publishing"**

---

## ⚙️ Configurazione Avanzata: `netlify.toml`

### Creare il file `netlify.toml`

Crea un file `netlify.toml` nella root del progetto con questo contenuto:

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### A cosa serve:

- **`publish = "."`**: Indica a Netlify che i file sono nella root
- **`command = "echo 'No build needed'`**: Non serve compilare nulla (sito statico)
- **`redirects`**: Reindirizza tutte le richieste a `index.html` (utile per routing)

### Come usare:

1. **Crea il file** `netlify.toml` nella cartella del progetto
2. **Copia il contenuto** sopra nel file
3. **Carica su GitHub** (commit e push)
4. **Netlify rileva automaticamente** il file e lo usa

---

## 🔧 Risoluzione Problemi

### Problema 1: "Site not found" o 404

**Soluzione**:
- Verifica che `index.html` sia nella root del repository
- Controlla che i percorsi dei file siano corretti (es. `./app.js` invece di `/app.js`)
- Assicurati che `netlify.toml` sia configurato correttamente

### Problema 2: "Build failed"

**Soluzione**:
- Controlla i log di build su Netlify (Site settings → Deploys → Click su un deploy → Logs)
- Verifica che non ci siano errori nei file (es. JavaScript, CSS)
- Assicurati che tutti i file necessari siano presenti

### Problema 3: "Deploy non parte automatico"

**Soluzione**:
- Verifica che GitHub sia autorizzato su Netlify (Site settings → Build & deploy → Continuous Deployment)
- Controlla che il branch sia corretto (`main` o `master`)
- Assicurati che i file siano stati commitati e pushati su GitHub

### Problema 4: "Sito non si aggiorna"

**Soluzione**:
- Fai un hard refresh del browser (Ctrl+Shift+R o Cmd+Shift+R)
- Verifica che il deploy sia completato su Netlify (Site settings → Deploys)
- Controlla che i file siano stati pushati su GitHub

---

## 📊 Monitoraggio e Statistiche

### Visualizzare i Deploy

1. **Vai su Netlify**: https://app.netlify.com
2. **Clicca sul tuo sito**
3. **Vai su "Deploys"** (in alto)
4. **Vedi tutti i deploy**:
   - Deploy completati (verde)
   - Deploy in corso (giallo)
   - Deploy falliti (rosso)

### Visualizzare i Log

1. **Clicca su un deploy**
2. **Clicca su "View logs"**
3. **Vedi i log** di build e deploy

### Statistiche del Sito

1. **Vai su "Analytics"** (in alto)
2. **Vedi statistiche**:
   - Visitatori
   - Pagine viste
   - Tempo di caricamento
   - E altro

---

## 🌐 Dominio Personalizzato (Opzionale)

### Aggiungere un Dominio

1. **Vai su "Site settings"** → **"Domain management"**
2. **Clicca "Add custom domain"**
3. **Inserisci il dominio** (es. `debitozero-solvo.it`)
4. **Segui le istruzioni DNS**:
   - Aggiungi record CNAME o A
   - Attendi la propagazione DNS (24-48 ore)
5. **✅ Fatto!** Il sito è accessibile con il tuo dominio

---

## ✅ Checklist Finale

- [ ] Progetto caricato su GitHub
- [ ] Repository collegato a Netlify
- [ ] Deploy completato con successo
- [ ] Sito accessibile online
- [ ] Nome del sito personalizzato
- [ ] `netlify.toml` creato (opzionale)
- [ ] Deploy automatico attivo (opzionale)
- [ ] Dominio personalizzato configurato (opzionale)

---

## 🎯 Risultato Finale

Dopo questi passaggi, avrai:

- ✅ Sito online su Netlify (es. `https://debito-zero-solvo.netlify.app`)
- ✅ Deploy automatico da GitHub (ogni push = nuovo deploy)
- ✅ HTTPS automatico
- ✅ CDN globale (veloce ovunque)
- ✅ Statistiche e monitoraggio
- ✅ Dominio personalizzato (opzionale)

---

## 📞 Supporto

- **Netlify Docs**: https://docs.netlify.com
- **GitHub Docs**: https://docs.github.com
- **Netlify Support**: https://www.netlify.com/support

---

**Buon deploy! 🚀**

