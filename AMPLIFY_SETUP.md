# AWS Amplify Configuration Complete

**App Name:** postidentifieruserlookupandredirect
**App ID:** d13shsosd2jld2
**Branch:** danaher (PRODUCTION)
**Status:** ✅ Environment variable configured, build in progress

## Environment Variable

✅ **VITE_USER_LOOKUP_URL** = `https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/`

This variable is now available to your application during the build process.

## Deployment URLs

**Danaher Branch:**
```
https://danaher.d13shsosd2jld2.amplifyapp.com
```

**Main Branch:**
```
https://main.d13shsosd2jld2.amplifyapp.com
```

**Default Domain:**
```
https://d13shsosd2jld2.amplifyapp.com
```

## Current Build Status

**Build Job #4** - Triggered at 2026-03-13 16:47:55

Monitor progress:
```bash
# Check build status
aws amplify get-job \
  --app-id d13shsosd2jld2 \
  --branch-name danaher \
  --job-id 4

# Or view in console
https://console.aws.amazon.com/amplify/home?region=us-east-1#/d13shsosd2jld2
```

## Testing Instructions

Once the build completes (typically 3-5 minutes), follow these steps:

### Step 1: Open Your Application
Navigate to: https://danaher.d13shsosd2jld2.amplifyapp.com

### Step 2: Open Browser DevTools
- Press F12 or right-click → Inspect
- Go to **Network** tab
- Filter by "Fetch/XHR"

### Step 3: Test with Real Users

#### Test Case 1: Email User (OpCo2)
1. Enter: `opco2-user2@atko.email`
2. Click "Continue"
3. **Expected:**
   - POST request to Lambda function
   - Response: `{"found":true,"connection":"OpCo2-email","userId":"auth0|69b4685a9bd5911e8cc72a4a"}`
   - Redirect to: `/authorize?connection=OpCo2-email&login_hint=opco2-user2@atko.email`

#### Test Case 2: Username User (OpCo3)
1. Enter: `opco3user3`
2. Click "Continue"
3. **Expected:**
   - POST request to Lambda function
   - Response: `{"found":true,"connection":"OpCo3-username","userId":"auth0|69b468749bd5911e8cc72a4c"}`
   - Redirect to: `/authorize?connection=OpCo3-username&login_hint=opco3user3`

#### Test Case 3: Non-existent User
1. Enter: `notfound`
2. Click "Continue"
3. **Expected:**
   - POST request to Lambda function
   - Response: `{"found":false}`
   - Proceeds with normal Universal Login flow (no redirect)

### Step 4: Verify in Network Tab

Look for:
```
Request URL: https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/
Request Method: POST
Status Code: 200
```

Response body should contain:
```json
{
  "found": true,
  "connection": "OpCo2-email",
  "userId": "auth0|..."
}
```

### Step 5: Check CloudWatch Logs

Monitor Lambda execution:
```bash
aws logs tail /aws/lambda/acul-user-lookup --follow
```

## Troubleshooting

### Issue: Lambda Function Not Called

**Check 1: Environment Variable**
```bash
aws amplify get-app --app-id d13shsosd2jld2 --query 'app.environmentVariables'
```
Should show: `VITE_USER_LOOKUP_URL`

**Check 2: Build Logs**
1. Go to Amplify Console
2. Click on the build
3. Check "Build" step logs for environment variables

**Check 3: Browser Console**
- Open DevTools → Console
- Look for errors
- Check if `import.meta.env.VITE_USER_LOOKUP_URL` is defined

### Issue: CORS Error

**Symptoms:**
```
Access to fetch at 'https://...' from origin 'https://danaher.d13shsosd2jld2.amplifyapp.com' has been blocked by CORS policy
```

**Solution:**
The Lambda Function URL already has CORS configured for `*` (all origins), so this shouldn't happen. If it does:

```bash
aws lambda get-function-url-config --function-name acul-user-lookup
```

Should show:
```json
{
  "AllowOrigins": ["*"],
  "AllowMethods": ["POST"],
  "AllowHeaders": ["content-type"]
}
```

### Issue: 500 Error from Lambda

**Check CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/acul-user-lookup --since 10m
```

Common causes:
- Invalid Auth0 credentials
- Missing Management API permissions
- Network connectivity issues

### Issue: User Not Found (But Should Be)

**Check:**
1. User exists in Auth0 Dashboard
2. Identifier matches exactly (email or username)
3. Management API has `read:users` permission
4. Lambda has correct Auth0 domain configured

## Managing Environment Variables

### Add New Variable
```bash
aws amplify update-app \
  --app-id d13shsosd2jld2 \
  --environment-variables KEY1=VALUE1,KEY2=VALUE2
```

### View All Variables
```bash
aws amplify get-app \
  --app-id d13shsosd2jld2 \
  --query 'app.environmentVariables'
```

### Remove Variable
```bash
aws amplify update-app \
  --app-id d13shsosd2jld2 \
  --environment-variables VITE_USER_LOOKUP_URL=""
```

## Triggering Builds

### Manual Build
```bash
aws amplify start-job \
  --app-id d13shsosd2jld2 \
  --branch-name danaher \
  --job-type RELEASE
```

### Check Build Status
```bash
aws amplify list-jobs \
  --app-id d13shsosd2jld2 \
  --branch-name danaher \
  --max-results 5
```

### View Build Logs
Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d13shsosd2jld2/YnJhbmNoZXMvZGFuYWhlcg==

## Integration with Auth0

Once testing is successful, update your Auth0 screen configuration to point to the deployed Amplify URL:

**File:** `universal-login/screen_configs/login-id.json`

Update `head_tags` to use Amplify URLs:
```json
"head_tags": [
  {
    "tag": "script",
    "attributes": {
      "src": "https://danaher.d13shsosd2jld2.amplifyapp.com/bundle.js"
    }
  },
  {
    "tag": "link",
    "attributes": {
      "rel": "stylesheet",
      "href": "https://danaher.d13shsosd2jld2.amplifyapp.com/style.css"
    }
  }
]
```

Then deploy to Auth0:
```bash
cd universal-login
auth0 ul customize -r advanced -p login -s login-id -f ./screen_configs/login-id.json
```

## Success Criteria

✅ Build completes successfully
✅ Environment variable is available at runtime
✅ Lambda function is called when user submits identifier
✅ Correct connection is detected and returned
✅ User is redirected with connection parameter
✅ Auth0 uses the correct connection for authentication

## Next Steps After Successful Testing

1. **Update CORS for Production** (restrict to Auth0 domain only)
2. **Set up CloudWatch Alarms** for Lambda errors
3. **Monitor Lambda execution metrics** in CloudWatch
4. **Document the flow** for your team
5. **Consider load testing** with multiple concurrent users

---

**Configuration Complete!** 🎉

Your Amplify app now has the Lambda Function URL configured and is building. Once the build completes, test the full flow and verify connection detection is working correctly.
