# 🔐 Twilio MFA Setup for Trial Mode

## Understanding Twilio Trial Limitations

In Twilio trial mode, you have constraints:
- ❌ Can't send SMS to arbitrary numbers
- ✅ Can only send SMS to **verified phone numbers**
- ✅ Verified Caller IDs are mainly for **outbound calls**, not SMS

## How to Set Up Twilio MFA (Trial Mode)

### Step 1: Get Your Twilio Credentials

1. Go to https://www.twilio.com/console
2. Copy your **Account SID** and **Auth Token**
3. Go to Phone Numbers → Manage Numbers
4. Look for any **Active Numbers** (phone numbers you have in your account)
   - If you don't have one, you need to buy one or use a sandbox number

### Step 2: Understand the Two Types

**Verified Caller ID** (what you have):
- ✅ Use for: Making calls appear to come from your number
- ❌ Use for: Sending SMS in trial mode
- Purpose: Caller ID spoofing for outbound calls

**Twilio Phone Number** (what you need for SMS):
- ✅ Use for: Sending SMS and MMS
- ✅ Use for: Receiving calls and SMS
- Purpose: Your "from" number for messaging

### Step 3: Configure for Trial Mode

**Option A: Buy a Twilio Phone Number** (Recommended)
1. Go to: Twilio Console → Phone Numbers → Buy a Number
2. Select a number (~$1/month)
3. Add to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890  # Your purchased Twilio number
   ```

**Option B: Use Sandbox Mode** (Free, for testing)
1. Twilio provides a sandbox SMS number for testing
2. You can only send to verified numbers
3. Request a sandbox number in console

### Step 4: Verify Recipient Phone Number

For trial accounts, anyone receiving an SMS must be verified:

1. Go to Twilio Console → Phone Numbers → Verified Caller IDs
2. Click "Add a Verified Caller ID"
3. Enter the phone number you want to test with
4. Confirm the number via text message
5. Once verified, you can send SMS to this number

Example:
- You buy Twilio number: `+1234567890`
- You verify recipient: `+201149957585` (your personal number)
- You can send SMS from `+1234567890` TO `+201149957585`

### Step 5: Update Environment Variables

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio purchased number
```

### Step 6: Test MFA Flow

1. Login to the app
2. Enter your verified phone number (e.g., `+201149957585`)
3. Server sends SMS via Twilio
4. You receive the code
5. Enter code to complete MFA

---

## Troubleshooting

### Error: "'From' +201149957585 is not a Twilio phone number"

**Cause:** You're using a verified caller ID as the sender, but Twilio needs a real phone number you own.

**Fix:** 
- Buy a Twilio phone number
- Use that as `TWILIO_PHONE_NUMBER`
- Keep your personal number as a verified caller ID (for receiving SMS)

### Error: "Phone number is not verified"

**Cause:** The recipient number isn't verified in Twilio console.

**Fix:**
1. Go to Twilio Console → Verified Caller IDs
2. Add your phone number
3. Verify it via SMS
4. Try again

### Error: Still getting errors after setup?

**Workaround:** Use **Mock Mode**
- Leave Twilio env vars empty
- App will show OTP codes in System Pulse logs
- Perfect for development/testing

```env
# Comment these out to use mock mode:
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...
```

---

## What the Assignment Requires

From the course requirements:

> "To accommodate Twilio's trial limitations, the developer must manually verify their target phone number within the Twilio Console under the 'Verified Caller IDs' section."

This means:
1. ✅ You've done this - you verified `+201149957585`
2. ✅ But this is for **receiving** calls/SMS
3. ❌ You still need a **Twilio phone number** to **send from**

---

## Summary

| Step | What to Do | Status |
|------|-----------|--------|
| Get Twilio Account | Create account at twilio.com | ✅ Done |
| Get Account SID + Token | Copy from console | ✅ Done |
| **Buy Phone Number** | Purchase a Twilio number | ❌ **TODO** |
| Verify Your Number | Add to Verified Caller IDs | ✅ Done |
| Set Environment Variables | Add to `.env` | ⏳ Waiting for phone number |
| Test MFA | Login and verify | ⏳ Waiting for setup |

---

## Is Mock Mode Okay for the Assignment?

Yes! The assignment says:
> "To accommodate Twilio's trial limitations..."

This means the professor **expects** trial mode limitations. Using mock mode is acceptable because:
- ✅ You're demonstrating the MFA flow works
- ✅ You're showing OTP generation and verification
- ✅ You're respecting trial account limitations
- ✅ Code gracefully falls back to mock mode

---

## Next Steps

Choose one:

**If you want real SMS:**
1. Buy a Twilio phone number (~$1)
2. Update `.env` with the new number
3. MFA will send real SMS

**If you want to keep testing:**
1. Use mock mode (leave TWILIO vars empty)
2. Check System Pulse logs for OTP codes
3. App works perfectly for demo/grading
