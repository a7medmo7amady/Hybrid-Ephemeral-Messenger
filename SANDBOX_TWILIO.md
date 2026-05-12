# 🧪 Twilio Sandbox Mode vs Trial Mode

## What is Sandbox Mode?

Twilio provides a **free sandbox number** for testing in trial accounts:
- **Sandbox Number:** Provided by Twilio (looks like +1 555-0123)
- **Cost:** FREE
- **Purpose:** Testing SMS/calls without buying a number
- **Limitation:** Can only send to verified phone numbers

---

## Sandbox Number vs Real Twilio Number

| Feature | Sandbox | Real Twilio Number | Verified Caller ID |
|---------|---------|-------------------|-------------------|
| Cost | ✅ FREE | ❌ ~$1/month | ✅ FREE |
| Send SMS | ✅ Yes (to verified numbers) | ✅ Yes (anyone) | ❌ No |
| Receive SMS | ❌ No | ✅ Yes | ❌ No |
| Production Ready | ❌ Testing only | ✅ Production | ❌ Calls only |
| For MFA | ⚠️ Works (verified recipients only) | ✅ Yes | ❌ No |

---

## How to Find Your Sandbox Number

1. Go to https://www.twilio.com/console
2. Look at the dashboard
3. Find **"Twilio Phone Number"** or **"Messaging"** section
4. You should see something like: **+1 555-0123** (example)
5. This is your sandbox number

Or look here:
- Twilio Console → Phone Numbers → Sandbox

---

## How to Set It Up for MFA

### Step 1: Find Your Sandbox Number
```
Twilio Console
  → Phone Numbers (or Messaging)
  → Look for "Sandbox" section
  → Copy the phone number (looks like +1 555-0123)
```

### Step 2: Add to .env
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1 555-0123  # Your sandbox number
```

### Step 3: Verify Your Recipient Number
Since sandbox is for testing only, you need verified recipients:
1. Twilio Console → Phone Numbers → Verified Caller IDs
2. Add your phone number: +201149957585
3. Verify via SMS (Twilio sends you a code)
4. Now you can send SMS FROM sandbox TO your verified number

### Step 4: Restart Server and Test
```bash
# Restart server
cd server
bun run dev
```

Then:
1. Login to app
2. Enter your phone number in MFA: +201149957585
3. You should receive the SMS!
4. Enter the code to complete MFA

---

## The Good News

**Sandbox is PERFECT for your assignment because:**
1. ✅ Your number (+201149957585) is already verified
2. ✅ Sandbox can send to verified numbers
3. ✅ It's completely FREE
4. ✅ Demonstrates real SMS capability (not mock)
5. ✅ Shows full MFA flow working
6. ✅ Professor will be impressed!

---

## Sandbox Limitations (But OK for Assignment)

**Sandbox can only send to verified numbers:**
- ✅ You can send to: +201149957585 (verified by you)
- ❌ You can't send to: Random numbers (great for privacy!)
- ⚠️ Perfect for testing but not production

**For production, you'd need a real Twilio number:**
- But for coursework, sandbox is ideal!

---

## Finding Your Sandbox Number - Detailed Steps

### Method 1: Dashboard
1. Go to https://www.twilio.com/console
2. Look at the main dashboard
3. Find "Phone Numbers" section
4. Look for "Sandbox" label
5. Copy the number

### Method 2: Phone Numbers Menu
1. Twilio Console → Phone Numbers (left menu)
2. Click "Sandbox"
3. You'll see your sandbox number

### Method 3: Messaging Settings
1. Twilio Console → Messaging
2. Click "Settings"
3. Look for "Default Sender"
4. This might be your sandbox number

### If You Still Can't Find It
```
Every Twilio account has a default sandbox number:
Format: (some area code) 555-0123

For example:
- +1 555-0100
- +1 555-0123
- +1 555-0199

Check under Phone Numbers → Sandbox
```

---

## Complete Setup Example

Let's say you found: **+1 555-0123** (sandbox)

Your `.env` would be:
```env
# SERVER
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ghost-messenger
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your-firebase-project

# TWILIO SANDBOX
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1 555-0123

# CLIENT
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
...
```

Then:
1. Restart server
2. Login → Enter MFA phone: +201149957585
3. Receive real SMS from sandbox! ✅

---

## Sandbox vs Other Options

| Option | Cost | Real SMS | Setup Time | For Assignment |
|--------|------|----------|-----------|-----------------|
| Sandbox | FREE | ✅ Yes | 2 min | ⭐⭐⭐ BEST |
| Mock Mode | FREE | ❌ No | 0 min | ⭐⭐ Good |
| Real Number | $1/mo | ✅ Yes | 5 min | ⭐⭐⭐ Good |

---

## My Recommendation

**Use Sandbox! Here's why:**

1. **Already verified:** Your +201149957585 is verified ✅
2. **Free:** No cost at all ✅
3. **Easy:** Just copy sandbox number ✅
4. **Real SMS:** Professor will see actual SMS working ✅
5. **Perfect for grading:** Shows full implementation ✅

---

## Next Steps

1. Find your sandbox number in Twilio Console
2. Add to `.env` as `TWILIO_PHONE_NUMBER`
3. Restart server
4. Test MFA flow
5. You should receive real SMS!

**Let me know if you need help finding your sandbox number!** 👻
