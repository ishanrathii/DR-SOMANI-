# Site Assets

## Logo
- `logo.svg` — a scalable recreation of the "Be Safe & Sure" flower-in-hands mark (used by default).
- To use the **exact official logo**, drop the real file in as `assets/logo.png`.
  The navbar, footer and favicon already prefer `logo.png` and fall back to `logo.svg` if it's missing —
  so no code change is needed, just add the file and push.

## Doctor photo — REQUIRED
Add the photo of **Dr Kushal A Somani** here named exactly:

```
assets/dr-kushal-somani.jpg
```

The site loads it automatically in three places (hero card, About section, Doctors card).
Until the file is added, a 👨‍⚕️ placeholder shows instead (no broken images).

### How to add it
1. Save the photo as `dr-kushal-somani.jpg`.
2. Place it in this `assets/` folder.
3. Commit & push:
   ```bash
   git add assets/dr-kushal-somani.jpg
   git commit -m "Add Dr Somani photo"
   git push
   ```

**Tip:** a portrait (vertical) crop works best. Square also fine — it's centred on the face.

## Optional: second doctor photo
To show a photo for **Dr Antim Somani** too, add `assets/dr-antim-somani.jpg`
and update the fallback `<div>` in `index.html` (Doctors section) to an `<img>` like Dr Kushal's.
