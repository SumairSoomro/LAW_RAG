# 🔧 Google OAuth Setup - TODO

**Status**: ⏳ Pending Configuration

## Steps to Complete Google Sign-In

### 1. Google Cloud Console Setup
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing)
3. **Enable Google+ API**:
   - APIs & Services → Library → Search "Google+ API" → Enable
4. **Create OAuth credentials**:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - **Authorized redirect URIs**: Add this exact URL:
     ```
     https://dunoqqbkgfkdndfvjhep.supabase.co/auth/v1/callback
     ```
   - **Save and copy Client ID + Client Secret**

### 2. Supabase Configuration
1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Find Google** and click to configure
3. **Enable Google** provider
4. **Paste credentials**:
   - **Client ID**: From Google Console
   - **Client Secret**: From Google Console
5. **Redirect URL**: Should be pre-filled
6. **Save**

### 3. Test
- Click "Continue with Google" button on login page
- Should redirect to Google OAuth flow
- After authorization, should redirect back to dashboard

## Current Status
- ✅ Frontend Google OAuth code implemented
- ⏳ Google Cloud Console setup needed
- ⏳ Supabase provider configuration needed
- ⏳ Testing needed

## Notes
- Google OAuth button is functional but will show error until configured
- All code is ready - just needs OAuth provider setup