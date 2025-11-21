# 📧 Configurazione Template EmailJS - Debito Zero Solvo

## 🎯 Template Configurati

### 1. Template per TEAM SOLVO (Richiesta Cliente)
**Template ID:** `template_1p0r597`  
**Destinazione:** `gianluca.collia@gmail.com` (configurato in `EMAIL_CONFIG.recipientEmail`)

#### Campi da configurare nel template EmailJS:

**To Email:**
```
{{to_email}}
```
*Nota: Questo campo riceverà automaticamente `gianluca.collia@gmail.com` dal codice*

**From Name:**
```
{{from_name}} (via Debito Zero Solvo)
```
*Così vedrai chiaramente chi ha fatto la richiesta nel mittente*

**From Email:**
```
[Lascia "Use Default Email Address" selezionato]
```
*⚠️ IMPORTANTE: Con Gmail tramite EmailJS, l'email parte sempre dal tuo indirizzo del servizio (`gianluca.collia@gmail.com`). Non puoi cambiarlo per motivi di sicurezza.*

**Reply To:**
```
{{email}}
```
*✅ QUESTO È IMPORTANTE: Quando rispondi all'email, rispondi direttamente al cliente usando la sua email (`{{email}}`)*

**Subject (Oggetto):**
```
Nuova richiesta da {{from_name}} - Debito Zero Solvo
```

**Body (Corpo Email):**
```html
<h2>Nuova Richiesta Cliente</h2>

<p><strong>Dati Cliente:</strong></p>
<ul>
  <li><strong>Nome:</strong> {{from_name}}</li>
  <li><strong>Email:</strong> {{from_email}}</li>
  <li><strong>Telefono:</strong> {{phone}}</li>
  <li><strong>Città:</strong> {{client_city}}</li>
  <li><strong>Provincia:</strong> {{client_province}}</li>
  <li><strong>CAP:</strong> {{client_cap}}</li>
</ul>

<p><strong>Tipologie Debiti:</strong><br>
{{debt_types}}</p>

<p><strong>Dettaglio Debiti:</strong><br>
<pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">{{debt_details}}</pre></p>

<p><strong>Importo Totale:</strong> {{debt_amount}}</p>

<p><strong>Consensi Privacy:</strong><br>
{{consent_summary}}</p>

<p><strong>Data Richiesta:</strong> {{submission_date}}</p>

<hr>
<p style="color: #666; font-size: 12px;">Questa email è stata generata automaticamente dalla piattaforma Debito Zero - Solvo</p>
```

---

### 2. Template per CLIENTE (Conferma Richiesta)
**Template ID:** `template_cp9rxvj`  
**Destinazione:** Email del cliente che ha fatto la richiesta

#### Campi da configurare nel template EmailJS:

**To Email:**
```
{{to_email}}
```
*Nota: Questo campo riceverà automaticamente l'email del cliente dal codice*

**Subject (Oggetto):**
```
{{subject}}
```
*Valore predefinito: "✅ Richiesta ricevuta - Debito Zero Solvo"*

**Body (Corpo Email):**
```html
<h2>Ciao {{client_name}},</h2>

<p>La tua richiesta è stata ricevuta con successo!</p>

<p>Un nostro operatore ti contatterà a breve per valutare la tua situazione e metterti in contatto con i professionisti più adatti.</p>

<p>Nel frattempo, puoi esplorare i professionisti disponibili sulla piattaforma.</p>

<h3>Dettagli della tua richiesta:</h3>
<ul>
  <li><strong>Tipologie debiti:</strong> {{debt_types}}</li>
  <li><strong>Importo totale:</strong> {{debt_amount}}</li>
  <li><strong>Località:</strong> {{client_city}} {{client_province}} - CAP {{client_cap}}</li>
  <li><strong>Data richiesta:</strong> {{submission_date}}</li>
</ul>

<p><strong>Messaggio completo:</strong></p>
<pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">{{message}}</pre>

<hr>
<p>Cordiali saluti,<br>
<strong>Il team di Debito Zero - Solvo</strong></p>

<p style="color: #666; font-size: 12px;">Per domande o supporto, rispondi a questa email.</p>
```

---

## ✅ Verifica Configurazione

### Come verificare che i template funzionano:

1. **Accedi a EmailJS Dashboard** → [Email Templates](https://dashboard.emailjs.com/admin/template)

2. **Per Template Team (`template_1p0r597`)**:
   - Apri il template `template_1p0r597`
   - Verifica che il campo "To Email" sia impostato su: `{{to_email}}`
   - Controlla che tutti i campi nel body corrispondano alla lista sopra
   - Salva il template

3. **Per Template Cliente (`template_cp9rxvj`)**:
   - Apri il template `template_cp9rxvj`
   - Verifica che il campo "To Email" sia impostato su: `{{to_email}}`
   - Controlla che tutti i campi nel body corrispondano alla lista sopra
   - Salva il template

4. **Test Rapido**:
   - Nella dashboard EmailJS, usa la funzione "Test" per ciascun template
   - Inserisci valori di test nei campi e verifica che l'email arrivi correttamente

---

## 🔧 Configurazione nel Codice

Il codice in `app.js` è già configurato così:

```javascript
const EMAIL_CONFIG = {
  serviceId: 'service_ok3g5iy',
  templateId: 'template_1p0r597',              // ← Template TEAM
  templateIdConfirmation: 'template_cp9rxvj',  // ← Template CLIENTE
  publicKey: 'wrPtIJWjgaySCJWjZ',
  recipientEmail: 'gianluca.collia@gmail.com'  // ← Email dove ricevere le richieste
};
```

**Non serve modificare altro nel codice** - funziona automaticamente!

---

## 📋 Checklist Finale

- [ ] Template `template_1p0r597` configurato con tutti i campi richiesti
- [ ] Template `template_cp9rxvj` configurato con tutti i campi richiesti
- [ ] Entrambi i template hanno `{{to_email}}` nel campo "To Email"
- [ ] Template salvati correttamente
- [ ] Test inviati e ricevuti correttamente
- [ ] Email di test arrivano alle destinazioni corrette

---

## 🐛 Risoluzione Problemi

**Se l'email non arriva:**
1. Controlla la console del browser (F12) per errori
2. Vai su EmailJS Dashboard → Activity per vedere lo stato degli invii
3. Verifica che i campi nel template corrispondano esattamente a quelli elencati sopra
4. Assicurati che `{{to_email}}` sia impostato correttamente

**Se l'email arriva ma i campi sono vuoti:**
- Verifica che i nomi dei campi nel template corrispondano esattamente (case-sensitive)
- Controlla che non ci siano spazi extra nei nomi dei campi

**Se l'email va sempre a `gianluca.collia@gmail.com`:**
- Verifica che il campo "To Email" nel template sia impostato su `{{to_email}}` e non su un indirizzo fisso

