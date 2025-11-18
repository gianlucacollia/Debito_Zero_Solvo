# 🔍 Diagnostica Problemi Email

## Come diagnosticare perché le email non arrivano

### 1. Apri la Console del Browser
- Premi **F12** (o tasto destro → "Ispeziona")
- Vai alla scheda **"Console"**
- Ricarica la pagina (F5)

### 2. Controlla l'Inizializzazione EmailJS
All'avvio della pagina, dovresti vedere:
```
🔧 Inizializzazione EmailJS...
EmailJS disponibile: true
Public Key configurata: true
Public Key: wrPtIJWjgaySCJWjZ
Service ID: service_ok3g5iy
Template ID: template_v4ixmnr
✅ EmailJS initialized con successo
```

**Se vedi errori qui:**
- ❌ `EmailJS disponibile: false` → Lo script EmailJS non è caricato
- ❌ `Public Key non configurata` → Controlla `EMAIL_CONFIG` in `app.js`

### 3. Prova a Inviare un'Email
Compila il form "Diventa un professionista" e invia.

### 4. Controlla i Log nella Console
Dovresti vedere:
```
📧 Invio email candidatura professionista...
Service ID: service_ok3g5iy
Template ID: template_v4ixmnr
Email data: { to_email: "...", candidate_name: "...", ... }
```

Poi:
- ✅ `Email candidatura inviata: { status: 200, text: "OK" }` → **Email inviata con successo!**
- ❌ `Errore invio candidatura: { status: 400, text: "Bad Request" }` → **Problema con il template**

### 5. Errori Comuni e Soluzioni

#### Errore 400 - Bad Request
**Causa:** Il template EmailJS non ha tutti i campi necessari

**Soluzione:**
1. Vai su https://dashboard.emailjs.com/admin/template
2. Apri il template `template_v4ixmnr`
3. Verifica che contenga TUTTI questi campi:
   - `{{to_email}}`
   - `{{candidate_name}}` (per auto-reply)
   - `{{auto_message}}` (per auto-reply)
   - `{{from_name}}` (per richieste)
   - `{{from_email}}` (per richieste)
   - E tutti gli altri campi elencati in `CAMPI-EMAILJS-TEMPLATE.txt`

#### Errore 401 - Unauthorized
**Causa:** Public Key errata o non autorizzata

**Soluzione:**
1. Vai su https://dashboard.emailjs.com/admin/integration
2. Verifica che la Public Key sia: `wrPtIJWjgaySCJWjZ`
3. Se diversa, aggiorna `EMAIL_CONFIG.publicKey` in `app.js`

#### Errore 403 - Forbidden
**Causa:** Dominio non autorizzato in EmailJS

**Soluzione:**
1. Vai su https://dashboard.emailjs.com/admin/integration
2. Aggiungi il tuo dominio (es. `localhost`, `127.0.0.1`, o il dominio del sito)
3. Salva le modifiche

#### Errore 404 - Not Found
**Causa:** Service ID o Template ID errato

**Soluzione:**
1. Verifica che il Service ID sia: `service_ok3g5iy`
2. Verifica che il Template ID sia: `template_v4ixmnr`
3. Controlla in EmailJS Dashboard che questi ID esistano

### 6. Verifica in EmailJS Dashboard
1. Vai su https://dashboard.emailjs.com/admin/activity
2. Controlla se le email sono state inviate
3. Se vedi "Failed", clicca per vedere il motivo

### 7. Test Rapido
Apri la console e esegui:
```javascript
// Verifica che EmailJS sia caricato
console.log('EmailJS:', typeof emailjs !== 'undefined');

// Verifica la configurazione
console.log('Public Key:', 'wrPtIJWjgaySCJWjZ');
console.log('Service ID:', 'service_ok3g5iy');
console.log('Template ID:', 'template_v4ixmnr');

// Inizializza EmailJS
emailjs.init('wrPtIJWjgaySCJWjZ');
```

### 8. Checklist Finale
- [ ] EmailJS SDK caricato in `index.html`
- [ ] Public Key corretta: `wrPtIJWjgaySCJWjZ`
- [ ] Service ID corretto: `service_ok3g5iy`
- [ ] Template ID corretto: `template_v4ixmnr`
- [ ] Template contiene tutti i campi necessari
- [ ] Dominio autorizzato in EmailJS
- [ ] Nessun errore nella console del browser
- [ ] Email visibili in EmailJS Dashboard → Activity

---

## Se il Problema Persiste

1. **Copia TUTTI i messaggi dalla console** (anche quelli in verde)
2. **Fai uno screenshot** della sezione Activity in EmailJS
3. **Verifica il template** e assicurati che abbia almeno:
   ```
   To: {{to_email}}
   Subject: {{subject}}
   
   Ciao {{candidate_name}},
   
   {{auto_message}}
   ```

---

## Template Minimo per Auto-Reply Candidatura

```
Oggetto: Grazie per la tua candidatura - Debito Zero Solvo

Ciao {{candidate_name}},

{{auto_message}}

Cordiali saluti,
Il team di Debito Zero - Solvo
```

**Campi richiesti:**
- `{{to_email}}`
- `{{candidate_name}}`
- `{{auto_message}}`

