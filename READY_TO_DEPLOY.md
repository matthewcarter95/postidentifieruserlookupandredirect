# Ready to Deploy - Connection Routing with Hardcoded OAuth Params

**Status:** ✅ Code changes complete, ready to push

## What Was Implemented

### 1. OAuth Configuration
Added hardcoded OAuth parameters to `auth-screens/src/lib/constants.js`:
```javascript
export const OAUTH_CONFIG = {
  CLIENT_ID: "igpUob4dLoHLf6LzJU6wS8k5EJNfSrOV",
  REDIRECT_URI: "https://lavender-giraffe-84306.storytime.oktademo.app/callback",
  SCOPE: "openid profile email",
  RESPONSE_TYPE: "code"
};
```

### 2. Connection-Based Redirect
Updated `auth-screens/src/screens/LoginId.jsx` to:
1. Lookup user connection via Lambda
2. If found, redirect to `/authorize` with:
   - All required OAuth parameters
   - Detected `connection` parameter
   - `login_hint` with user's identifier

### 3. Lambda CORS Fix
Fixed duplicate CORS headers issue by:
- Lambda now reads and echoes back the requesting origin
- Removed Function URL CORS configuration
- **New Function URL:** `https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/`

## Changes Made

**Modified Files:**
- `auth-screens/src/screens/LoginId.jsx` - Connection routing logic
- `auth-screens/src/lib/constants.js` - OAuth config constants
- `auth-screens/.env.local` - Updated Lambda Function URL
- `auth-screens/.env.production` - Updated Lambda Function URL
- `api/user-lookup/index.mjs` - CORS fix

**New Files:**
- `AMPLIFY_SETUP.md` - Amplify configuration guide
- `CONNECTION_ROUTING_SOLUTION.md` - Detailed routing solutions
- `CORS_FIX.md` - CORS issue documentation
- `TEST_RESULTS.md` - Lambda test results
- `auth-screens/src/lib/connection-router.js` - Helper utilities
- `auth0-actions/connection-router.js` - Action example (not used)

## Git Status

**Branch:** danaher
**Commit:** 2b9e851

All changes are committed locally. Need to push to origin.

## To Deploy

### Step 1: Push to GitHub

```bash
cd /Users/matt.carter/software/auth0/acul/sko26-acul-lab

# Option A: Push via HTTPS (requires GitHub credentials)
git push origin danaher

# Option B: Push via SSH (if configured)
git remote set-url origin git@github.com:matthewcarter95/postidentifieruserlookupandredirect.git
git push origin danaher

# Option C: Use GitHub CLI
gh auth login
git push origin danaher
```

### Step 2: Amplify Will Auto-Deploy

Once pushed, AWS Amplify will automatically:
1. Detect the push to the `danaher` branch
2. Start a new build
3. Deploy to: `https://danaher.d13shsosd2jld2.amplifyapp.com`

### Step 3: Test the Flow

1. Navigate to your Auth0 login
2. Enter a test identifier: `opco2-user2@atko.email`
3. **Expected behavior:**
   - Frontend calls Lambda function
   - Lambda returns: `{"found":true,"connection":"OpCo2-email"}`
   - Frontend redirects to: `/authorize?client_id=...&connection=OpCo2-email&login_hint=opco2-user2@atko.email`
   - Auth0 routes to OpCo2-email connection
   - User proceeds to password entry for OpCo2-email

4. Test with username: `opco3user3`
   - Should redirect to `OpCo3-username` connection

5. Test with non-existent user: `notfound`
   - Should fall back to normal ACUL flow

## Expected Authorization URL

When a user is found, the redirect URL will be:
```
https://lavender-giraffe-84306.oktademo.cloud/authorize?
  client_id=igpUob4dLoHLf6LzJU6wS8k5EJNfSrOV
  &redirect_uri=https://lavender-giraffe-84306.storytime.oktademo.app/callback
  &scope=openid%20profile%20email
  &response_type=code
  &connection=OpCo2-email
  &login_hint=opco2-user2@atko.email
```

This should successfully initiate a new OAuth flow with the detected connection.

## Troubleshooting

### Issue: Still getting "Missing required parameter" error

**Check:**
1. Verify OAuth parameters are correct in `constants.js`
2. Check browser console for the full authorize URL
3. Verify client_id matches your Auth0 application
4. Ensure redirect_uri is whitelisted in Auth0 application settings

### Issue: CORS error

**Solution:** Already fixed! But if it reoccurs:
```bash
# Test the Lambda directly
curl -X POST https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://lavender-giraffe-84306.oktademo.cloud" \
  -d '{"identifier":"opco2-user2@atko.email"}'
```

Should return without CORS errors.

### Issue: User not found

**Check:**
1. Lambda CloudWatch logs: `aws logs tail /aws/lambda/acul-user-lookup --follow`
2. Verify user exists in Auth0 Dashboard
3. Check identifier matches exactly (email or username)

## Configuration Summary

**Auth0:**
- Domain: `lavender-giraffe-84306.oktademo.cloud`
- Client ID: `igpUob4dLoHLf6LzJU6wS8k5EJNfSrOV`
- Redirect URI: `https://lavender-giraffe-84306.storytime.oktademo.app/callback`

**Lambda Function:**
- Name: `acul-user-lookup`
- URL: `https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/`
- Region: us-east-1

**Amplify:**
- App ID: `d13shsosd2jld2`
- Branch: `danaher`
- URL: `https://danaher.d13shsosd2jld2.amplifyapp.com`

**Test Users:**
- `opco2-user2@atko.email` → Connection: `OpCo2-email`
- `opco3user3` → Connection: `OpCo3-username`

## Next Steps

1. ✅ Code complete and committed locally
2. ⏳ **Push to GitHub** (manual step required)
3. ⏳ Wait for Amplify auto-deploy
4. ⏳ Test the connection routing flow
5. ⏳ Monitor for any errors

---

**All changes are ready!** Just need to push to GitHub to trigger the deployment.
