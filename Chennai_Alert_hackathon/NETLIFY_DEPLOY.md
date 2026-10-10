# Netlify deployment

Deploy the **whole extracted project folder**, not the ZIP file itself. The folder must contain `index.html` at its top level.

## Recommended: Netlify Git deployment

1. Push this folder to GitHub.
2. In Netlify choose **Add new site → Import an existing project**.
3. Select the GitHub repository.
4. Use these settings:
   - Build command: leave empty
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
5. Add an environment variable named `SECRET_TOKEN` with a private value.
6. Deploy the site.

The public site is:

```text
https://YOUR-SITE.netlify.app/
```

The admin page is:

```text
https://YOUR-SITE.netlify.app/admin/?secret=YOUR_SECRET_TOKEN
```

Reports submitted through `/.netlify/functions/reports` become visible to the admin only after three reports overlap in the same area within three hours.

## Netlify Drop warning

Netlify Drop is suitable for the static page, but it does not reliably deploy serverless functions. Use a Git-connected Netlify site or the Netlify CLI when you need the admin reports API.

The current function stores reports in `reports-store.json`. For a production service, replace that file with a persistent database because serverless function filesystems are temporary.
