# 🔧 RISOLUZIONE: Email non ricevute da Stripe (Test Mode)

## ❗ IL PROBLEMA
In **Test Mode**, Stripe invia email SOLO agli indirizzi email nella **whitelist**.

## ✅ SOLUZIONE: Aggiungi email alla whitelist

### Passo 1: Vai alle impostazioni email Stripe
1. Apri: https://dashboard.stripe.com/settings/emails
2. Scorri fino alla sezione **"Test mode recipients"** o **"Test mode email addresses"**

### Passo 2: Aggiungi la tua email
1. Clicca su **"Add test mode recipient"** o **"Manage test recipients"**
2. Inserisci la tua email (quella che userai nei test)
3. Clicca **"Add"** o **"Save"**
4. Stripe ti invierà un'email di verifica

### Passo 3: Verifica l'email
1. Controlla la tua inbox (e spam)
2. Cerca email da Stripe con oggetto tipo: "Verify your email for Stripe test mode"
3. Clicca sul link di verifica

### Passo 4: Conferma che sia attiva
1. Torna su https://dashboard.stripe.com/settings/emails
2. Verifica che la tua email appaia nella lista con status **"Verified"**

---

## 🧪 TESTA IL PAGAMENTO

Dopo aver aggiunto l'email alla whitelist:

1. **Vai sul sito**: https://store-41d09.web.app
2. **Aggiungi prodotti** al carrello
3. **Vai al checkout** (puoi pagare come guest)
4. **Usa la TUA email verificata** nel form
5. **Completa il pagamento** con carta test:
   ```
   Numero: 4242 4242 4242 4242
   Data: 12/30
   CVC: 123
   ```
6. **Controlla la tua inbox** (può richiedere 1-2 minuti)

---

## 🔍 VERIFICA SE LE EMAIL SONO STATE INVIATE

Anche se non le ricevi, puoi verificare che Stripe le abbia inviate:

1. Vai su: https://dashboard.stripe.com/test/emails
2. Qui vedrai **tutte** le email che Stripe ha tentato di inviare
3. Se vedi la tua email lì, significa che funziona (controlla spam)
4. Se NON vedi email lì, allora c'è un problema di configurazione

---

## ⚙️ CONFIGURAZIONE ALTERNATIVA (Se non funziona)

Se non trovi l'opzione whitelist o non funziona, prova questo:

### Opzione A: Usa Stripe Checkout con receipt_email
Il nostro codice già lo fa, ma verifica che sia così:

```javascript
customer_email: "tua-email@example.com"
```

### Opzione B: Controlla i Webhook
L'estensione Firebase Stripe usa webhook. Verifica che siano configurati:

1. Vai su: https://console.firebase.google.com/project/store-41d09/extensions
2. Clicca su **"Run Stripe Payments"**
3. Nella sezione **"How this extension works"**, verifica che i webhook siano attivi

---

## 🚨 NOTA IMPORTANTE

**In Test Mode:**
- ✅ Email vanno SOLO a indirizzi verificati
- ✅ Le email possono finire in SPAM
- ✅ Possono richiedere 1-2 minuti per arrivare

**In Production Mode:**
- ✅ Email vanno a QUALSIASI indirizzo
- ✅ Nessuna whitelist richiesta
- ✅ Deliverability migliore

---

## 📋 CHECKLIST RAPIDA

- [ ] Ho aggiunto la mia email su Stripe Test Mode Recipients
- [ ] Ho verificato l'email cliccando sul link
- [ ] L'email appare come "Verified" nella dashboard
- [ ] Ho fatto un pagamento di test usando quella email
- [ ] Ho controllato https://dashboard.stripe.com/test/emails
- [ ] Ho controllato la cartella SPAM
- [ ] Ho aspettato almeno 2-3 minuti

---

## 🎯 PROSSIMI PASSI

Una volta che ricevi le email di test:
1. ✅ Conferma che il checkout funziona
2. ✅ Verifica che il contenuto dell'email sia corretto
3. ✅ Testa sia con utenti loggati che come guest
4. 🚀 Prepara per il passaggio in produzione
