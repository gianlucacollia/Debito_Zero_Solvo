# Guida Operativa EmailJS – Debito Zero · Solvo

Documento passo passo per configurare, gestire e ottimizzare i flussi email della piattaforma.

---

## 1. Setup Consigliato

1. **Account & Service**
   - Accedi a [EmailJS Dashboard](https://dashboard.emailjs.com/).
   - Sezione **Email Services** → collega il provider (Gmail, Outlook, ecc.).
   - *Service ID attuale*: `service_ok3g5iy`.

2. **Chiavi API**
   - **Account → API Keys** → copia la tua Public Key.
   - Nel codice (`app.js`) è impostata su `wrPtIJWjgaySCJWjZ`. Aggiornala se cambi la chiave.

3. **Domini autorizzati**
   - **Account → Domains** → aggiungi `localhost` (dev) e il dominio pubblico (es. `tuodominio.it`).
   - Senza autorizzazione il browser restituirà errore 403.

4. **Template Management**
   - Crea un template separato per ogni tipologia di email (vedi §3).
   - In ogni template inserisci solo i placeholder realmente inviati dal codice.
   - Usa sintassi `{{field}}` o `{{field || 'Default'}}`.

5. **Testing**
   - Dalla dashboard usa “Test” su ogni template (in alto a destra) oppure prova direttamente dal sito in dev environment.

---

## 2. Promemoria integrazione nel codice

```js
const EMAIL_CONFIG = {
  serviceId: 'service_ok3g5iy',
  templateId: 'template_v4ixmnr',             // Richieste clienti → Admin
  templateIdConfirmation: 'template_v4ixmnr', // Conferma cliente
  templateIdAppointment: 'template_v4ixmnr',  // Prenotazione professionista
  templateIdReview: 'template_v4ixmnr',       // Feedback verifica
  templateIdProAutoReply: 'template_v4ixmnr', // Auto-reply candidature
  templateIdProApplication: 'template_v4ixmnr',// Candidature → Admin
  publicKey: 'wrPtIJWjgaySCJWjZ',
  recipientEmail: 'gianluca.collia@gmail.com'
};
```

- **Consiglio**: duplica il template base per ogni tipologia e aggiorna i rispettivi `templateId*`.
- I campi inviati vengono preparati negli oggetti `emailData` dentro `app.js`.

---

## 3. Schemi Template & Campi

### 3.1 Richiesta cliente → Admin (`template_cliente_admin`)
**Trigger**: invio Step 3 (wizard).  
**Campi disponibili**:
```
to_email
from_name
from_email
phone
client_city
client_province
client_cap
debt_types
debt_details
debt_amount
submission_date
consent_summary
```
**Suggerimento template (testo)**:
```
Oggetto: Nuova richiesta da {{from_name}}

Ciao team,
Hai ricevuto una nuova richiesta da {{from_name}} ({{from_email}}).

Tipologie debito: {{debt_types}}
Dettagli: {{debt_details}}
Importo totale: {{debt_amount}}
Località: {{client_city}} {{client_province}} {{client_cap}}
Contatto: {{phone}}
Consensi privacy: {{consent_summary}}

Data invio: {{submission_date}}
```

---

### 3.2 Conferma al cliente (`template_cliente_conferma`)
**Trigger**: stesso invio Step 3, dopo l’email all’admin.  
**Campi**:
```
to_email
from_name = "Debito Zero - Solvo"
subject
client_name
client_city
client_province
client_cap
debt_types
debt_amount
submission_date
message  (testo completo generato da app.js)
```
**Template esempio**:
```
Oggetto: ✅ Richiesta ricevuta - Debito Zero Solvo
Ciao {{client_name}},
{{message}}
```

---

### 3.3 Prenotazione appuntamento (cliente → professionista) `template_appuntamento_pro`
**Trigger**: scelta data/ora + modalità.  
**Campi**:
```
to_email                (email professionista)
from_name               (cliente)
from_email
phone                   (cliente)
professional_name
appointment_date
appointment_time
meeting_type
client_name
client_email
client_phone
client_city
client_province
client_cap
debt_summary
calendar_link
```
**Suggerimento**: inserisci un pulsante HTML “Aggiungi al calendario” collegato a `{{calendar_link}}`.

---

### 3.4 Candidatura professionista → Admin (`template_candidatura_admin`)
**Trigger**: invio form “Diventa un professionista”.  
**Campi**:
```
to_email
from_name
from_email
phone
candidate_name
candidate_email
candidate_phone
candidate_city
candidate_province
candidate_cap
candidate_specialty
candidate_experience
candidate_notes
attachment_links
submission_date
subject
```

---

### 3.5 Auto-reply candidatura (`template_candidatura_autoreply`)
**Trigger**: subito dopo la candidatura.  
**Campi**:
```
to_email
candidate_name
auto_message
```
**Testo consigliato**:
```
Ciao {{candidate_name}},
{{auto_message}}

Il team Debito Zero - Solvo
```

---

### 3.6 Feedback verifica professionisti (`template_verifica_feedback`)
**Trigger**: Admin invia esito da tab “Verifica”.  
**Campi**:
```
to_email
professional_name
review_result        ("Positivo" oppure "Da integrare")
review_message
subject
```
**Suggerimento**: usa condizioni nel copy (es. blocco “Complimenti!” vs “Servono integrazioni”) a seconda di `{{review_result}}`.

---

### 3.7 Mail future (opzionali)
Per estendere il sistema puoi aggiungere:
- **Reminder appuntamento** (24h prima).
- **Follow-up cliente** (se non prenota entro X giorni).
- **Notifica interna** per casi speciali.

In ognuno crea un template dedicato e aggiungi il relativo `templateId` in `EMAIL_CONFIG`.

---

## 4. Best Practice EmailJS

1. **Valida i template**: errori 400 indicano campi mancanti. Inserisci default `{{campo || 'N/A'}}` per i facoltativi.
2. **Console & Log**: nel browser sono già loggati `status` e `text`. Su EmailJS → Activity trovi lo storico invii/errore.
3. **Ambienti**: se usi template diversi per dev/prod, ricordati di aggiornare `EMAIL_CONFIG` in base all’ambiente.
4. **Destinatari multipli**: se vuoi inviare la stessa mail a più indirizzi, puoi gestire un array e ciclare `emailjs.send` per ognuno.
5. **Duplicazione template**: per velocizzare la creazione, duplica il template principale e modifica solo i campi necessari.

---

## 5. Prossimi Step Consigliati

1. Creare su EmailJS i template nominati (`template_cliente_admin`, `template_cliente_conferma`, ecc.) e incollare i testi sopra.
2. Aggiornare `EMAIL_CONFIG` con gli ID reali di ogni template.
3. Testare ogni flusso (wizard, prenotazione, candidatura, verifica) monitorando la console e EmailJS Activity.
4. Valutare se costruire un pannello admin per aggiornare destinatari/template senza toccare il codice.

Per qualsiasi nuovo flusso basta seguire la stessa struttura: definisci i campi nel codice, crea il template con gli stessi placeholder, aggiorna `EMAIL_CONFIG` e testa. Se desideri, posso preparare versioni HTML dei template con formattazione completa e call-to-action.

