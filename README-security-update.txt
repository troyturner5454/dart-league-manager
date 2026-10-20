Security update for dart-league-manager (only changed files - copy over your folder).
1. Add SESSION_SECRET to .env.local (letters and numbers only, 32+ characters). Restart npm run dev.
2. Run PART 1 of supabase-upgrade.sql in Supabase.
3. Test locally. 4. Delete lib\supabase.ts. 5. Add SESSION_SECRET in Vercel, commit, push.
6. When the site works, run PART 2 of supabase-upgrade.sql.
