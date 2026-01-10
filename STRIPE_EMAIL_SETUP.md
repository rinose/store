# 📧 Configurazione Email Stripe - Checklist

## ✅ Passaggi da verificare nella Dashboard Stripe

### 1. **Attivare le Email di Ricevuta**
Vai su: https://dashboard.stripe.com/settings/emails

Assicurati che siano attivati:
- ✅ **Successful payments** - Email quando il pagamento ha successo
- ✅ **Receipt emails** - Ricevute per i pagamenti

### 2. **Configurare le Email in Test Mode**
📍 **IMPORTANTE**: Sei in **Test Mode**
- Le email vengono inviate SOLO a email verificate nel tuo account Stripe
- Per ricevere email di test, devi aggiungere l'email alla whitelist

#### Come aggiungere email alla whitelist (Test Mode):
1. Vai su: https://dashboard.stripe.com/settings/emails
2. Scorri fino a **"Test mode email recipients"**
3. Aggiungi la tua email
4. Verifica l'email cliccando sul link che ricevi

### 3. **Configurazione Firebase Stripe Extension**
Verifica nella Firebase Console:
1. Vai su: https://console.firebase.google.com/project/store-41d09/extensions
2. Clicca su **"Run Stripe Payments"**
3. Verifica che sia configurato con:
   - Stripe API Key (Test mode)
   - Products and prices collection path: `products`
   - Customer details collection: `customers`

### 4. **Testare con Carta di Test**
Usa questa carta per testare:
```
Numero: 4242 4242 4242 4242
Scadenza: 12/30
CVC: 123
Nome: Test User
Email: tua-email@example.com (quella in whitelist)
```

### 5. **Verificare i Log Stripe**
Dopo un pagamento di test:
1. Vai su: https://dashboard.stripe.com/test/payments
2. Trova il pagamento appena effettuato
3. Clicca per vedere i dettagli
4. Nella sezione **"Events & logs"** verifica:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `charge.succeeded`

### 6. **Controllare Email Inviate**
Nella dashboard Stripe:
1. Vai su: https://dashboard.stripe.com/test/emails
2. Qui vedrai tutte le email inviate in test mode
3. Se non vedi email, controlla che l'email del cliente sia nella whitelist

---

## 🔧 Soluzioni Comuni

### Problema: "Non ricevo email"
**Soluzione 1**: Aggiungi la tua email alla whitelist (Test Mode)
**Soluzione 2**: Controlla la cartella SPAM
**Soluzione 3**: Usa un'email Gmail/Outlook per il test

### Problema: "Email va in spam"
**Soluzione**: Normale in test mode. In produzione, Stripe invia da domini verificati.

### Problema: "Voglio email personalizzate"
**Soluzione**: Devi usare webhook + Firebase Functions per inviare email custom

---

## 🚀 Per passare a Produzione

Quando sei pronto per il live:
1. Attiva il tuo account Stripe
2. Ottieni le API Keys di produzione
3. Aggiorna le configurazioni dell'Extension Firebase
4. Le email in produzione vengono inviate automaticamente a TUTTI i clienti (no whitelist)

---

## 📋 Quick Test Checklist

- [ ] Email aggiunta a whitelist Stripe (test mode)
- [ ] Email verificata (controlla inbox)
- [ ] Receipt emails abilitati in Stripe Settings
- [ ] Pagamento di test completato con successo
- [ ] Controllato https://dashboard.stripe.com/test/emails
- [ ] Controllato cartella SPAM
