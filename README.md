# Deep Field — "claim a 20-digit number" website

This is a complete, working website. You don't need to write or understand
any code to get it live — just follow the steps below in order. It takes
about 15 minutes the first time.

The site has two parts that need to be connected:
1. **Supabase** — the database that stores every number, who found it, and
   how many times it's been selected.
2. **Vercel** — hosts the actual website so people can visit it in a browser.

Both have free tiers that are more than enough to start.

---

## Step 1 — Create the database (Supabase)

1. Go to https://supabase.com and sign up (free).
2. Click **New Project**. Give it any name, set a database password (save
   it somewhere), pick the region closest to you, and click **Create**.
   Wait about a minute for it to finish setting up.
3. In the left sidebar, click the **SQL Editor** icon.
4. Click **New query**.
5. Open the file `supabase/schema.sql` in this folder, copy its entire
   contents, and paste them into the SQL editor.
6. Click **Run**. You should see "Success. No rows returned." This created
   the two tables (`numbers` and `selections`) and the function that
   safely records a claim.
7. In the left sidebar, click the **gear icon (Project Settings) > API**.
   You'll need two values from this page in Step 3:
   - **Project URL**
   - **anon public** key (a long string of letters and numbers)

---

## Step 2 — Put the code on GitHub

1. Go to https://github.com and sign up if you don't have an account.
2. Click **New repository**, name it something like `deep-field`, keep it
   **Public** or **Private** (either works), and click **Create repository**.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in every file and folder from this project (everything you see in
   this folder) and commit them.

(If you're comfortable with git instead, the usual `git init`, `git add .`,
`git commit`, `git push` works too — but the web upload is fine.)

---

## Step 3 — Put the website online (Vercel)

1. Go to https://vercel.com and sign up using your GitHub account — this
   makes the next step automatic.
2. Click **Add New > Project**.
3. Choose the `deep-field` repository you just created and click **Import**.
4. Before clicking Deploy, open **Environment Variables** and add two:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste the Project URL from Step 1.7
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste the anon public key from Step 1.7
5. Click **Deploy**. After a minute or two, Vercel gives you a live link
   like `deep-field.vercel.app` — that's your website.

That's it. Anyone with the link can now type in a 20-digit number and see
if they're the first to claim it.

---

## How it works, in plain terms

- When someone submits a number, the website asks the database: "has this
  exact 20-digit string ever been seen before?"
- The database can only answer this correctly for one person at a time,
  even if two people submit the identical number in the same second —
  that's what the `claim_number` function in `supabase/schema.sql` 
  guarantees. Exactly one of them will be told they're first.
- Every number's page (like `deep-field.vercel.app/number/00004192837465019283`)
  shows who found it first, when, and how many times it's been selected
  since.
- A few numbers get an automatic label — palindrome, all-matching-digits,
  ascending sequence, and so on — detected the moment they're first
  claimed.

## What you might want to add later

- **Accounts** — right now anyone can type any name; there's no login. If
  you want names to be verified and permanent, Supabase Auth (email or
  Google login) plugs into this same database with a small addition.
- **A leaderboard page** — most-selected numbers, most recently discovered,
  all numbers with a pattern label. The data for this already exists in
  the `numbers` table; it just needs a new page.
- **Rate limiting** — to stop one person from scripting thousands of
  submissions per minute. Vercel and Supabase both offer simple ways to
  add this when you're ready.
- **Monetization** — once there's traffic, this structure supports things
  like: paid "reserve a number before anyone else" claims, a subscription
  for extra badges/history, or sponsored "interesting number of the day."

If you want help with any of these next steps, just ask.
