# Saknes App

The React map application for [saknes.org](https://saknes.org).

**Stack:** React + Vite · React-Leaflet · Supabase · Vercel

---

## Local Development

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/saknes-app.git
cd saknes-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root:
```
VITE_SUPABASE_URL=https://jqzzldruijkkfrcjmgtb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run locally
```bash
npm run dev
```
Opens at `http://localhost:5173`

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/saknes-app.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `saknes-app` repository
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**

Vercel auto-deploys on every push to `main`.

### 3. Set custom domain
In Vercel → your project → Settings → Domains:
- Add `app.saknes.org`
- Follow DNS instructions (add a CNAME record in your domain registrar pointing `app` to `cname.vercel-dns.com`)

### 4. Update Supabase redirect URL
In Supabase → Authentication → URL Configuration:
- Add `https://app.saknes.org` to Redirect URLs

---

## Supabase Schema

Make sure these tables exist (run in Supabase SQL Editor):

```sql
-- Already set up from previous build
-- properties table with added_by, lat, lng, address, parish, period, occupation, notes, photo_url
-- property_families table with property_id, name, year_from, year_to
-- Storage bucket: property-photos (public)
```

---

## Project Structure

```
src/
  App.jsx              — Auth context + Toast context
  main.jsx             — Entry point
  index.css            — All styles
  lib/
    supabase.js        — Supabase client
  pages/
    MapApp.jsx         — Main map page
  components/
    Sidebar.jsx        — Left sidebar with all panels
    AuthModal.jsx      — Sign in / Register modal
    PropertyModal.jsx  — Add / Edit property modal
    Toast.jsx          — Toast notifications
```

---

## Netlify Landing Site

The main website (Home, About, Mission) stays on Netlify at `saknes.org`.
The "Open the Map" button there should link to `https://app.saknes.org`.

Update the landing page button URLs:
```html
<button onclick="window.location.href='https://app.saknes.org'">🗺 Open the Map</button>
```
