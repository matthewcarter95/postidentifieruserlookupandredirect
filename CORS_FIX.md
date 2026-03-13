# CORS Issue Fix - Lambda Function

**Date:** 2026-03-13
**Issue:** Duplicate Access-Control-Allow-Origin headers causing CORS failure

## Problem

When the frontend called the Lambda Function URL from Auth0's custom domain (`https://lavender-giraffe-84306.oktademo.cloud`), the browser received this error:

```
Access to fetch at 'https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/'
from origin 'https://lavender-giraffe-84306.oktademo.cloud' has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header contains multiple values '*, https://lavender-giraffe-84306.oktademo.cloud',
but only one is allowed.
```

## Root Cause

The Lambda function was setting CORS headers in two places:

1. **Lambda Function URL CORS Configuration** - Automatically added by AWS
2. **Manual CORS headers in Lambda code** - Set in the `corsResponse()` function

This resulted in duplicate `Access-Control-Allow-Origin` headers in the response:
- First value: `*` (from the Lambda function code)
- Second value: `https://lavender-giraffe-84306.oktademo.cloud` (from Function URL CORS config)

Browsers only allow a single `Access-Control-Allow-Origin` header, so the request failed.

## Solution

### Step 1: Update Lambda Function Code

Modified the Lambda function to read the `Origin` header from the incoming request and echo it back specifically:

**Before:**
```javascript
function corsResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',  // ❌ Always returns *
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
```

**After:**
```javascript
export const handler = async (event) => {
  // Get origin from request headers for CORS
  const origin = event.headers?.origin || event.headers?.Origin || '*';

  // Pass origin to all corsResponse calls
  // ...
};

function corsResponse(statusCode, body, origin = '*') {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': origin,  // ✅ Returns specific origin
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
```

### Step 2: Remove Function URL CORS Configuration

Deleted and recreated the Function URL without CORS configuration to let the Lambda code handle CORS manually:

```bash
# Delete old Function URL with CORS config
aws lambda delete-function-url-config --function-name acul-user-lookup

# Create new Function URL without CORS config
aws lambda create-function-url-config \
  --function-name acul-user-lookup \
  --auth-type NONE
```

**Note:** This changed the Function URL from:
- Old: `https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/`
- New: `https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/`

### Step 3: Update Configuration

Updated all references to the Function URL:

1. **Amplify Environment Variable:**
   ```bash
   aws amplify update-app \
     --app-id d13shsosd2jld2 \
     --environment-variables VITE_USER_LOOKUP_URL=https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/
   ```

2. **Local .env files:**
   - `auth-screens/.env.local`
   - `auth-screens/.env.production`

### Step 4: Redeploy

- Updated Lambda function code
- Triggered new Amplify build (Job #5)

## How It Works Now

1. **Browser sends request** with `Origin` header:
   ```
   Origin: https://lavender-giraffe-84306.oktademo.cloud
   ```

2. **Lambda reads Origin** from event headers:
   ```javascript
   const origin = event.headers?.origin || event.headers?.Origin || '*';
   ```

3. **Lambda returns specific origin**:
   ```
   Access-Control-Allow-Origin: https://lavender-giraffe-84306.oktademo.cloud
   ```

4. **Browser accepts response** - single, matching origin header ✅

## Testing

Tested with the actual Auth0 origin:

```bash
curl -X POST https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://lavender-giraffe-84306.oktademo.cloud" \
  -d '{"identifier":"opco2-user2@atko.email"}'
```

**Result:** ✅ Success
```json
{
  "found": true,
  "connection": "OpCo2-email",
  "userId": "auth0|69b4685a9bd5911e8cc72a4a"
}
```

## Security Considerations

### Current Implementation (Development)

The Lambda function now accepts requests from **any origin** by echoing back the requesting origin. This is fine for development but should be restricted in production.

### Production Recommendation

Add origin validation to only allow specific domains:

```javascript
function corsResponse(statusCode, body, origin = '*') {
  // Whitelist of allowed origins
  const allowedOrigins = [
    'https://lavender-giraffe-84306.oktademo.cloud',
    'https://lavender-giraffe-84306.cic-demo-platform.auth0app.com',
    'https://danaher.d13shsosd2jld2.amplifyapp.com'
  ];

  // Only return the origin if it's in the whitelist
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'null';

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
```

## Key Learnings

1. **Lambda Function URLs can auto-handle CORS** for OPTIONS preflight requests, but this can conflict with manual CORS headers in your code.

2. **Only one source should handle CORS** - either the Function URL configuration OR your Lambda code, not both.

3. **Returning specific origins is more secure** than using `*`, especially when credentials or sensitive data are involved.

4. **Always test with actual origins** - testing with curl without an Origin header won't catch CORS issues.

## Related Files

- `api/user-lookup/index.mjs` - Updated Lambda function code
- `auth-screens/.env.local` - Updated Function URL
- `auth-screens/.env.production` - Updated Function URL
- Amplify environment variables - Updated via AWS CLI

## Summary

✅ CORS issue fixed by having the Lambda function read and echo back the requesting origin
✅ Function URL recreated without CORS config to avoid conflicts
✅ All configuration files updated with new Function URL
✅ Amplify rebuild triggered to pick up changes
✅ Tested successfully with Auth0 origin header

**New Function URL:** `https://lisvhie4vjfkcldhncpqiwjzce0jdmeo.lambda-url.us-east-1.on.aws/`
