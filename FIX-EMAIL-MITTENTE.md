# 🔧 Fix: Email ricevute da te stesso invece che dal cliente

## ⚠️ Problema

Quando ricevi le email tramite EmailJS, arrivano da `gianluca.collia@gmail.com` (il tuo indirizzo del servizio) invece che dall'email del cliente (es. `gianluca.collia@outlook.it`).

## 🔍 Perché succede

Quando usi EmailJS con un servizio email collegato (Gmail, Outlook, ecc.), **l'email parte sempre dall'indirizzo del servizio configurato**. Questo è un comportamento di sicurezza di Gmail/EmailJS per prevenire spam e phishing.

**Non puoi cambiare il mittente ("From Email")** quando usi un servizio collegato.

## ✅ Soluzione: Usa "Reply To"

La soluzione migliore è configurare il campo **"Reply To"** nel template EmailJS, così quando rispondi all'email, rispondi direttamente al cliente.

### Passo 1: Configura il Template EmailJS

1. Vai su **EmailJS Dashboard** → **Email Templates**
2. Apri il template `template_1p0r597` (per il team)
3. Nella sezione **"Reply To"**, inserisci:
   ```
   {{email}}
   ```
   *Questo farà sì che quando rispondi, l'email vada direttamente al cliente*

4. **Opzionale**: Nel campo **"From Name"**, usa:
   ```
   {{from_name}} (via Debito Zero Solvo)
   ```
   *Così vedrai chiaramente chi ha fatto la richiesta*

5. **Lascia "Use Default Email Address" selezionato** per "From Email"
   *Non puoi cambiarlo quando usi Gmail tramite EmailJS*

### Passo 2: Verifica i Campi nel Codice

Il codice è già stato aggiornato per includere il campo `email` nei parametri. Assicurati che il template abbia accesso a:

- `{{email}}` - Email del cliente (per Reply To)
- `{{from_name}}` - Nome completo del cliente
- `{{nome}}` - Solo nome del cliente (se necessario)

## 📋 Configurazione Template Corretta

Nel template `template_1p0r597`, configura così:

### To Email:
```
{{to_email}}
```
*Riceverà: gianluca.collia@gmail.com*

### From Name:
```
{{from_name}} (via Debito Zero Solvo)
```
*Così vedrai: "Gianluca Collia (via Debito Zero Solvo)" come mittente*

### From Email:
```
[Lascia "Use Default Email Address" selezionato]
```
*Sarà sempre: gianluca.collia@gmail.com*

### Reply To:
```
{{email}}
```
*Quando rispondi, andrà a: gianluca.collia@outlook.it (email del cliente)*

## 🎯 Risultato Finale

Dopo questa configurazione:

1. **Riceverai l'email** da `gianluca.collia@gmail.com` (normale, non puoi cambiarlo)
2. **Il mittente visualizzato** sarà "Gianluca Collia (via Debito Zero Solvo)"
3. **Quando rispondi**, l'email andrà automaticamente a `gianluca.collia@outlook.it` (email del cliente)

## 🔄 Alternative (se vuoi davvero cambiare il mittente)

Se **devi assolutamente** che l'email sembri provenire dall'email del cliente:

1. **Usa un servizio SMTP personalizzato** invece di Gmail tramite EmailJS
   - Configura SMTP sul tuo server
   - Aggiorna EmailJS per usare SMTP
   - Potrai usare qualsiasi indirizzo come mittente

2. **Usa un servizio email dedicato** (SendGrid, Mailgun, Amazon SES)
   - Più flessibilità
   - Più complesso da configurare
   - Potrebbe richiedere verifica del dominio

**Nota:** La soluzione con "Reply To" è la più semplice e funziona perfettamente per la maggior parte dei casi d'uso.

## ✅ Checklist

- [ ] Template `template_1p0r597` configurato con `{{email}}` in "Reply To"
- [ ] "From Name" aggiornato per mostrare nome cliente
- [ ] "Use Default Email Address" selezionato per "From Email"
- [ ] Codice aggiornato (già fatto automaticamente)
- [ ] Test inviato e verificato che "Reply To" funzioni

## 🧪 Test

1. Fai una richiesta di test dalla piattaforma
2. Ricevi l'email su `gianluca.collia@gmail.com`
3. Clicca "Rispondi" nell'email
4. Verifica che il destinatario sia l'email del cliente (non la tua)

---

**Nota importante:** Questo comportamento è **normale e previsto** quando si usa Gmail tramite EmailJS. La soluzione con "Reply To" è la migliore pratica per questo tipo di configurazione.

