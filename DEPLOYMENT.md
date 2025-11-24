# 🚀 Deployment Guide

This guide covers deploying your SALT application to production.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers seamless deployment for React applications with automatic SSL and CDN.

#### Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - Framework Preset: **Vite**
     - Build Command: `npm run build`
     - Output Directory: `dist`
   
3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Netlify

1. **Build Your Project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or connect your GitHub repo for automatic deployments

3. **Configure Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your Supabase credentials

### Option 3: Self-Hosting (VPS/Server)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Copy `dist` folder to your server**
   ```bash
   scp -r dist/ user@your-server:/var/www/salt
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/salt;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

4. **Set up SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Pre-Deployment Checklist

### 🔒 Security

- [ ] Enable email confirmation in Supabase
- [ ] Review all RLS policies
- [ ] Rotate Supabase keys if exposed
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Add security headers

### ⚙️ Supabase Configuration

- [ ] Enable email confirmation
- [ ] Customize email templates
- [ ] Set up password requirements
- [ ] Configure redirect URLs:
  ```
  https://your-domain.com/**
  ```
- [ ] Set up database backups
- [ ] Monitor database usage

### 🎨 Frontend Configuration

- [ ] Update site title in `index.html`
- [ ] Add favicon
- [ ] Configure meta tags for SEO
- [ ] Test all features
- [ ] Check responsive design
- [ ] Test on multiple browsers

### 📊 Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (optional)
- [ ] Monitor Supabase usage
- [ ] Set up uptime monitoring

## Environment Variables

Make sure these are set in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

⚠️ **Never commit these to Git!**

## Supabase Production Settings

### 1. Enable Email Confirmations

1. Go to Authentication → Settings
2. Enable "Confirm email"
3. Customize email templates with your branding

### 2. Configure Redirect URLs

In Authentication → URL Configuration, add:
```
https://your-domain.com/**
https://your-domain.com/login
https://your-domain.com/signup
```

### 3. Set Up Backups

1. Go to Database → Backups
2. Enable automatic daily backups
3. Test restore process

### 4. Monitor Performance

- Set up usage alerts
- Monitor slow queries
- Review connection pool settings
- Check API rate limits

## Custom Domain Setup

### Vercel

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 minutes)

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Configure DNS as instructed
4. SSL will be automatically configured

## Post-Deployment Testing

Test these features in production:

- [ ] Student signup with @kellenberg.org email
- [ ] Moderator signup
- [ ] Email verification (if enabled)
- [ ] Login/logout
- [ ] Create events (moderator)
- [ ] Sign up for events (student)
- [ ] Approve signups (moderator)
- [ ] Export CSV
- [ ] Mobile responsiveness
- [ ] All pages load correctly
- [ ] 404 redirects to home

## Performance Optimization

### 1. Enable Compression

Most platforms (Vercel, Netlify) enable this automatically.

### 2. Image Optimization

If you add images, use:
- WebP format
- Lazy loading
- CDN hosting

### 3. Code Splitting

Already configured with Vite + React Router.

### 4. Caching

Configure caching headers:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Monitoring & Maintenance

### Weekly Tasks
- Check error logs
- Review Supabase usage
- Monitor user signups
- Check for security updates

### Monthly Tasks
- Review and update dependencies
- Check database performance
- Review RLS policies
- Backup database manually

### Quarterly Tasks
- Security audit
- Performance review
- User feedback analysis
- Feature planning

## Troubleshooting Production Issues

### Users Can't Sign Up
1. Check Supabase dashboard for auth errors
2. Verify email service is working
3. Check browser console for errors
4. Verify RLS policies are correct

### Environment Variables Not Working
1. Rebuild and redeploy
2. Verify variable names are correct
3. Check they're set in deployment platform
4. Ensure `VITE_` prefix is present

### 404 Errors on Refresh
1. Configure catch-all redirect to `index.html`
2. For Vercel, add `vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
3. For Netlify, add `_redirects` in `public/`:
   ```
   /*    /index.html   200
   ```

## Scaling Considerations

### Database
- Monitor connection pool usage
- Consider read replicas for high traffic
- Optimize slow queries
- Add database indexes as needed

### Frontend
- Use CDN for static assets
- Implement caching strategies
- Consider edge functions for server-side logic

### Costs
- Supabase free tier: 500MB database, 2GB bandwidth
- Paid plans start at $25/month for unlimited
- Most deployments (Vercel/Netlify) are free for small projects

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Supabase Support](https://supabase.com/support)

---

**Good luck with your deployment!** 🚀

