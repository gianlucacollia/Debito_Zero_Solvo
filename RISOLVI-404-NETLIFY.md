# 🔧 Risolvere Errore 404 "Page not found" su Netlify

## ❌ Problema
Netlify mostra "Page not found" dopo il deploy.

## 🔍 Cause Possibili

### 1. **File `index.html` non nella root di GitHub**
Netlify cerca `index.html` nella root del repository. Se è in una sottocartella, non lo trova.

### 2. **Configurazione deploy errata su Netlify**
Il "Publish directory" potrebbe essere configurato male.

### 3. **File non caricati su GitHub**
I file potrebbero non essere stati caricati correttamente su GitHub.

---

## ✅ Soluzione Passo-Passo

### **PASSO 1: Verifica su GitHub**

1. **Vai su GitHub**: https://github.com
2. **Apri il repository** (es. `debito-zero-solvo`)
3. **Verifica che `index.html` sia nella root**:
   - Dovresti vedere `index.html` nella lista dei file
   - NON deve essere in una sottocartella (es. `src/index.html`)
   - Deve essere direttamente nella root del repository

4. **Se `index.html` NON è nella root**:
   - Spostalo nella root del repository
   - Commit e push su GitHub
   - Netlify farà il deploy automatico

---

### **PASSO 2: Verifica Configurazione Netlify**

1. **Vai su Netlify**: https://app.netlify.com
2. **Clicca sul tuo sito**
3. **Vai su "Site settings"** (in alto a destra)
4. **Clicca su "Build & deploy"** (menu laterale)
5. **Sezione "Build settings"**:
   - **Base directory**: (lascia vuoto)
   - **Build command**: (lascia vuoto)
   - **Publish directory**: (lascia vuoto o metti `/`)

6. **Se "Publish directory" è configurato** (es. `/dist` o `/build`):
   - Cambialo in vuoto o `/`
   - Clicca "Save"
   - Vai su "Deploys" → "Trigger deploy" → "Clear cache and deploy site"

---

### **PASSO 3: Verifica File `netlify.toml`**

1. **Assicurati che `netlify.toml` sia nella root**:
   - Deve essere nella stessa cartella di `index.html`
   - NON in una sottocartella

2. **Contenuto minimo di `netlify.toml`**:
   ```toml
   [build]
     publish = "."
     command = "echo 'Site ready'"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Se `netlify.toml` non è presente**:
   - Crealo nella root del progetto
   - Copia il contenuto sopra
   - Commit e push su GitHub

---

### **PASSO 4: Verifica Deploy su Netlify**

1. **Vai su "Deploys"** (in alto)
2. **Clicca sull'ultimo deploy**
3. **Clicca su "View logs"**:
   - Verifica che non ci siano errori
   - Dovresti vedere "Site ready"
   - Dovresti vedere "Published"

4. **Se ci sono errori**:
   - Leggi i log per capire il problema
   - Controlla che tutti i file siano presenti
   - Verifica che i percorsi siano corretti

---

### **PASSO 5: Clear Cache e Redeploy**

1. **Vai su "Deploys"** (in alto)
2. **Clicca "Trigger deploy"** → **"Clear cache and deploy site"**
3. **Attendi il deploy** (1-2 minuti)
4. **Verifica che il sito funzioni**:
   - Clicca sul link del sito
   - Dovresti vedere la homepage, non "Page not found"

---

## 🔧 Soluzione Rapida (Se tutto fallisce)

### **Opzione 1: Rimuovi `netlify.toml` temporaneamente**

1. **Rimuovi `netlify.toml`** dal repository GitHub
2. **Configura manualmente su Netlify**:
   - Site settings → Build & deploy
   - Publish directory: (lascia vuoto)
   - Build command: (lascia vuoto)
3. **Clear cache e redeploy**

### **Opzione 2: Verifica struttura file su GitHub**

1. **Apri il repository su GitHub**
2. **Verifica la struttura**:
   ```
   debito-zero-solvo/
   ├── index.html       ← DEVE essere qui
   ├── app.js
   ├── styles.css
   ├── netlify.toml
   └── ...
   ```
3. **Se `index.html` NON è nella root**:
   - Spostalo nella root
   - Commit e push

---

## ✅ Checklist Finale

- [ ] `index.html` è nella root di GitHub
- [ ] `netlify.toml` è nella root di GitHub
- [ ] Publish directory su Netlify è vuoto o `/`
- [ ] Build command su Netlify è vuoto
- [ ] Deploy completato con successo
- [ ] Nessun errore nei log
- [ ] Cache cleared e redeploy fatto

---

## 🎯 Risultato Atteso

Dopo questi passaggi:
- ✅ Il sito dovrebbe funzionare
- ✅ Dovresti vedere la homepage, non "Page not found"
- ✅ Tutti i file dovrebbero essere caricati correttamente

---

## 📞 Se il Problema Persiste

1. **Controlla i log di deploy su Netlify**
2. **Verifica che tutti i file siano su GitHub**
3. **Assicurati che `index.html` sia nella root**
4. **Prova a rimuovere `netlify.toml` temporaneamente**
5. **Contatta il supporto Netlify**: https://www.netlify.com/support

---

**Buona fortuna! 🚀**

