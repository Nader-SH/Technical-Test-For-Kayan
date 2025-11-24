# Deploying to Render

This guide will help you deploy the backend server to Render.

## Prerequisites

- GitHub repository with your code
- Render account (sign up at https://render.com)
- Neon database (already set up)

## Step-by-Step Deployment

### 1. Push Code to GitHub

Make sure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `Technical-Test-For-Kayan`

### 3. Configure Build Settings

- **Name**: `kayan-healthcare-backend` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server` (important!)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

### 4. Set Environment Variables

In the Render dashboard, go to **Environment** section and add:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_jMC8LJo7KsFl@ep-delicate-bar-a4wq6s9w-pooler.us-east-1.aws.neon.tech/kayan-healthcare?sslmode=require&channel_binding=require
JWT_ACCESS_SECRET=<generate_a_random_32_char_secret>
JWT_REFRESH_SECRET=<generate_a_random_32_char_secret>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Important Notes:**
- Replace `DATABASE_URL` with your actual Neon connection string
- Generate strong secrets for JWT tokens (use `openssl rand -hex 32` or similar)
- Set `CORS_ORIGIN` to your frontend URL (e.g., Vercel deployment)

### 5. Generate JWT Secrets

You can generate secure secrets using:

**On Linux/Mac:**
```bash
openssl rand -hex 32
```

**On Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Or use an online generator: https://www.random.org/strings/

### 6. Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. Your service will be available at: `https://your-service-name.onrender.com`

### 7. Build Database Schema

After deployment, you need to build the database schema. You can do this by:

**Option A: Using Render Shell**
1. Go to your service → **Shell** tab
2. Run: `npm run build:db`

**Option B: Using Local Machine**
1. Set `DATABASE_URL` in your local `.env`
2. Run: `npm run build:db`

### 8. Verify Deployment

1. Check health endpoint: `https://your-service-name.onrender.com/health`
2. Should return: `{"success":true,"data":{"status":"healthy","database":"connected",...}}`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Render sets this automatically) | `10000` |
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://...` |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) | `abc123...` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | `xyz789...` |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token expiration | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration | `7d` |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | `10` |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://your-app.vercel.app` |

## Troubleshooting

### Build Fails

- Check that `Root Directory` is set to `server`
- Verify `package.json` has correct `build` and `start` scripts
- Check build logs in Render dashboard

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Ensure connection string includes `?sslmode=require`

### Service Crashes

- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure database schema is built (`npm run build:db`)

### CORS Errors

- Update `CORS_ORIGIN` to match your frontend URL
- Check that frontend is using correct API URL

## Render Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading for production use

## Next Steps

After backend is deployed:
1. Update frontend `.env` with Render URL: `VITE_API_URL=https://your-service-name.onrender.com`
2. Deploy frontend to Vercel/Netlify
3. Update backend `CORS_ORIGIN` with frontend URL

## Support

For issues:
- Check Render logs: Dashboard → Your Service → Logs
- Check Neon logs: Neon Console → Your Project → Logs
- Review server logs in Render dashboard

