# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
   - Sign in with GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select `IISBeninCBT` repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_GEMINI_API_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 📋 Pre-Deployment Checklist

- [x] ✅ All changes committed to GitHub
- [ ] 🔑 Environment variables ready
- [ ] 🗄️ Supabase project created
- [ ] 🤖 Gemini API key obtained
- [ ] 🔒 Database security rules configured
- [ ] 📧 Email templates configured (optional)

---

## 🔐 Environment Variables

### Required Variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### How to Add in Vercel:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 🔧 Build Configuration

The `vercel.json` file is already configured with:

- ✅ Security headers (XSS, Frame, Content-Type protection)
- ✅ SPA routing (fallback to index.html)
- ✅ Vite framework preset
- ✅ Node.js version 18

---

## 🌐 Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `cbt.iisbenin.edu`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

---

## 🔄 Auto-Deployment

Vercel automatically deploys when you push to GitHub:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments

---

## 📊 Monitoring

After deployment, access:

- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Vercel Dashboard → Deployments → View Logs
- **Speed Insights**: Automatically enabled

---

## 🐛 Troubleshooting

### Build Fails

**Issue**: `Module not found` errors
```bash
# Solution: Clear cache and rebuild
vercel --force
```

**Issue**: Environment variables not working
```bash
# Solution: Ensure variables start with VITE_
# React/Vite only exposes variables with VITE_ prefix
```

### Runtime Errors

**Issue**: White screen after deployment
- Check browser console for errors
- Verify environment variables are set correctly
- Check Vercel logs for API errors

**Issue**: Supabase connection fails
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase project is active
- Verify RLS policies allow anonymous access where needed

---

## 🚀 Post-Deployment Steps

1. **Test the Application**
   - Try student login
   - Try teacher login
   - Try admin login
   - Test exam creation and taking

2. **Configure Supabase**
   - Add your Vercel URL to Supabase allowed URLs
   - Dashboard → Settings → API → Site URL

3. **Set Up Custom Domain** (Optional)
   - Add domain in Vercel
   - Update DNS records

4. **Enable Analytics**
   - Vercel Analytics (free)
   - Vercel Speed Insights (free)

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/guide

---

## 🎉 Success!

Once deployed, your app will be available at:
- **Production**: `https://your-project.vercel.app`
- **Preview**: `https://your-project-git-branch.vercel.app`

Share the link with your team and start testing! 🚀

---

**Deployment Status**: Ready to Deploy ✅
**Framework**: Vite + React 19
**Hosting**: Vercel
**Database**: Supabase
