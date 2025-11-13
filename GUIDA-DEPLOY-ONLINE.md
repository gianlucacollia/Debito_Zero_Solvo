# 🚀 Guida Completa: Pubblicare Debito Zero - Solvo Online

## 📋 Opzioni Disponibili

### **1. NETLIFY DROP (⭐ Più Semplice - Consigliato)**

#### Passo 1: Prepara i file
- Assicurati che la cartella contenga:
  - `index.html`
  - `app.js`
  - `styles.css`
  - Tutti i file necessari (robots.txt, sitemap.xml, favicon, ecc.)

#### Passo 2: Deploy
1. Vai su: **https://app.netlify.com/drop**
2. Trascina la cartella `Debito Zero` nel browser
3. Attendi il deploy (1-2 minuti)
4. Ottieni il link: `https://random-name-123.netlify.app`

#### Passo 3: Personalizza (opzionale)
1. Clicca su "Site settings" > "Change site name"
2. Scegli un nome: `debito-zero-solvo` (se disponibile)
3. Il link diventa: `https://debito-zero-solvo.netlify.app`

#### Vantaggi:
- ✅ Zero configurazione
- ✅ HTTPS automatico
- ✅ CDN globale (veloce ovunque)
- ✅ Aggiornamenti semplici (trascina di nuovo)
- ✅ Gratuito per progetti personali

---

### **2. VERCEL (⭐ Ottimo per Progetti Statici)**

#### Passo 1: Crea account
1. Vai su: **https://vercel.com**
2. Accedi con GitHub (consigliato) o email

#### Passo 2: Deploy
1. Clicca "Add New Project"
2. Clicca "Import" e trascina la cartella
3. Oppure collega un repository GitHub
4. Clicca "Deploy"

#### Passo 3: Configurazione (opzionale)
- Vercel rileva automaticamente `index.html`
- Il link sarà: `https://debito-zero-solvo.vercel.app`

#### Vantaggi:
- ✅ Deploy automatico da GitHub
- ✅ Preview per ogni commit
- ✅ Velocità ottimale (Edge Network)
- ✅ Gratuito per progetti personali

---

### **3. GITHUB PAGES (⭐ Se hai già GitHub)**

#### Passo 1: Carica su GitHub
1. Crea un repository su GitHub (es. `debito-zero-solvo`)
2. Carica tutti i file nella cartella
3. Oppure usa GitHub Desktop o Git CLI

#### Passo 2: Attiva GitHub Pages
1. Vai su Settings > Pages
2. Scegli branch: `main` (o `master`)
3. Scegli cartella: `/root`
4. Salva

#### Passo 3: Accedi al sito
- Link: `https://tuo-username.github.io/debito-zero-solvo`

#### Vantaggi:
- ✅ Gratuito e illimitato
- ✅ Integrato con GitHub
- ✅ Aggiornamenti automatici (push su GitHub)

---

### **4. SUPABASE HOSTING (⭐ Se usi Supabase)**

#### Passo 1: Configura Supabase
1. Vai su Dashboard Supabase
2. Clicca "Storage" > "New bucket"
3. Crea bucket: `public-assets` (pubblico)

#### Passo 2: Upload files
1. Carica `index.html`, `app.js`, `styles.css` nel bucket
2. Imposta permessi pubblici

#### Passo 3: Accedi
- Link: `https://tuo-progetto.supabase.co/storage/v1/object/public/public-assets/index.html`

#### Vantaggi:
- ✅ Integrato con Supabase
- ✅ Stesso dominio per API e hosting
- ✅ Ottimo per progetti Supabase

---

## 🔧 Configurazioni Consigliate

### **File: `netlify.toml` (per Netlify)**
```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **File: `vercel.json` (per Vercel)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## 🌐 Dominio Personalizzato (Opzionale)

### **Netlify:**
1. Vai su Site settings > Domain management
2. Clicca "Add custom domain"
3. Inserisci il dominio (es. `debitozero-solvo.it`)
4. Segui le istruzioni DNS (aggiungi record CNAME/A)

### **Vercel:**
1. Vai su Project settings > Domains
2. Clicca "Add domain"
3. Inserisci il dominio
4. Segui le istruzioni DNS

---

## ⚠️ Problemi Comuni

### **1. File non trovati (404)**
- Verifica che tutti i file siano nella cartella root
- Controlla i percorsi relativi in `index.html` (es. `./app.js` invece di `/app.js`)

### **2. Errori JavaScript**
- Controlla la console del browser (F12)
- Verifica che EmailJS e Supabase siano configurati correttamente
- Assicurati che le API keys siano valide

### **3. CSS non caricato**
- Verifica il percorso in `index.html`: `<link rel="stylesheet" href="styles.css">`
- Controlla che `styles.css` sia nella stessa cartella di `index.html`

### **4. LocalStorage non funziona**
- LocalStorage funziona solo su HTTPS (Netlify/Vercel forniscono HTTPS automatico)
- Verifica che il sito sia su HTTPS (non HTTP)

---

## 🎯 Raccomandazione Finale

**Per iniziare subito:**
1. **Usa Netlify Drop** (più semplice, zero configurazione)
2. Trascina la cartella e ottieni il link in 2 minuti
3. Condividi il link con clienti/professionisti

**Per produzione:**
1. **Usa Vercel o Netlify** con GitHub
2. Configura dominio personalizzato
3. Abilita deploy automatico (push su GitHub = aggiornamento automatico)

---

## 📞 Supporto

- **Netlify Docs:** https://docs.netlify.com
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Pages Docs:** https://pages.github.com

---

## ✅ Checklist Pre-Deploy

- [ ] Tutti i file sono nella cartella
- [ ] `index.html` è nella root
- [ ] EmailJS configurato (serviceId, templateId, publicKey)
- [ ] Supabase configurato (URL, anon key) - se usato
- [ ] Testato localmente (apri `index.html` nel browser)
- [ ] Nessun errore in console (F12)
- [ ] Meta tags SEO configurati
- [ ] Favicon presente
- [ ] `robots.txt` e `sitemap.xml` presenti (opzionale)

---

**Buon deploy! 🚀**

