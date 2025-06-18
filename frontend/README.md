# SkillSutra Frontend

## Netlify SPA Routing

If you deploy this project to Netlify, you must include a `_redirects` file in the `public` directory with the following content:

```
/*    /index.html   200
```

This ensures that all routes (e.g., `/instructor-acceptance`, `/profile`, etc.) are handled by your React app and do not result in a 404 error when accessed directly or refreshed.

**After adding or updating this file, always redeploy your site on Netlify.**

---

## Other Notes
- Make sure your environment variables for EmailJS and API endpoints are set correctly in your backend for instructor acceptance/rejection emails to work. 