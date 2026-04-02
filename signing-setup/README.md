# ZJ's Painting — Remote Signing & Notification Setup

Zero monthly cost. Client signs on their phone. Zach gets a push notification the second they do.

---

## What this does

1. Zach hits **PDF** on the proposal → clean PDF opens in a new tab
2. He saves it and uploads to DocuSeal
3. DocuSeal emails the client a signing link
4. Client opens it on any device, signs with finger or stylus
5. Both get emailed the signed PDF automatically
6. Zach's phone buzzes with a push notification: **"Joseph Chege signed ✓"**

---

## Stack

| Piece | Service | Cost |
|-------|---------|------|
| PDF generation | Browser print dialog (built in) | Free |
| E-signature | DocuSeal (self-hosted) | Free |
| Hosting DocuSeal | Railway.app | Free tier |
| Push notifications | ntfy.sh | Free |
| Webhook glue | DocuSeal built-in webhooks | Free |

---

## Step 1 — Deploy DocuSeal on Railway

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project → Deploy from template**
3. Search `DocuSeal` — there's an official template
4. Click Deploy — Railway gives you a URL like `https://docuseal-production-xxxx.up.railway.app`
5. Open that URL, create your admin account
6. That's your DocuSeal instance — bookmark it

---

## Step 2 — Set up ntfy for push notifications

1. Download the **ntfy** app on Zach's iPhone (free, App Store)
2. Open ntfy → tap **+** → subscribe to a topic
3. Name the topic something private and random: `zjpainting-signed-7x4k2` (make up your own)
4. That's it — no account needed

---

## Step 3 — Connect DocuSeal webhook to ntfy

1. In DocuSeal, go to **Settings → Webhooks**
2. Add a new webhook:
   - **URL**: `https://ntfy.sh/zjpainting-signed-7x4k2` (your topic name from step 2)
   - **Events**: select `submission.completed`
   - **Method**: POST
3. In the webhook **Headers** section add:
   ```
   Title: Proposal Signed ✓
   Tags: white_check_mark
   Priority: high
   ```
4. In the **Body** template field paste:
   ```
   {{submitter.name}} signed the proposal. Check your email for the completed document.
   ```
5. Save

Now every time a client completes signing, ntfy sends a push to Zach's phone instantly.

---

## Step 4 — Your signing workflow

**Every time Zach sends a proposal:**

1. In the app → Step 5 → tap **PDF**
2. In the new tab, tap **Save as PDF** (iOS: tap share → Save to Files)
3. Go to your DocuSeal URL
4. Click **New Document → Upload** → upload the PDF
5. Add the client's email as a signer
6. Click **Send** — client gets an email with a signing link
7. Wait for the push notification on your phone

**Shortcut after a few uses:** DocuSeal has templates. Upload a blank proposal template once, then just fill in the client fields each time instead of uploading a new PDF every time.

---

## Step 5 — Optional: Adobe Acrobat Sign instead

If clients are more comfortable with Adobe (more recognizable brand):

1. Sign up at [acrobat.adobe.com](https://acrobat.adobe.com) — free tier = 5 sends/month
2. Paid plan = $15/month for unlimited
3. Upload PDF → add signer email → send
4. Webhook setup is identical — Adobe Sign has webhooks that POST to ntfy the same way

---

## How the signed document works legally

DocuSeal (and Adobe Sign) produce a signed PDF with:
- Timestamp of when each party signed
- IP address of the signing device  
- Email address of the signer
- Certificate of completion

This satisfies the **Kansas Uniform Electronic Transactions Act (UETA)** — same legal standing as a wet signature. The app already includes the UETA language in the proposal terms.

---

## Troubleshooting

**Not getting push notifications?**
- Make sure ntfy app notifications are allowed in iPhone Settings
- Confirm the topic name in the app matches the webhook URL exactly (case sensitive)

**DocuSeal Railway app sleeping?**
- Railway free tier sleeps after inactivity. First load after sleep takes ~30 seconds. Upgrade to $5/month Hobby plan to keep it awake.

**Client says they didn't get the email?**
- Check spam folder
- DocuSeal → Submissions → find the submission → Resend

---

## Files in this folder

```
README.md          — this file
webhook-test.sh    — test your ntfy webhook from terminal
docuseal-env.txt   — environment variables for Railway deployment
```
