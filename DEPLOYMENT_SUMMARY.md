# Deployment Summary - User Lookup Lambda Function

**Deployment Date:** 2026-03-13
**Status:** ✅ Successfully Deployed

## AWS Lambda Function Details

- **Function Name:** `acul-user-lookup`
- **Runtime:** Node.js 20.x
- **Region:** us-east-1
- **ARN:** `arn:aws:lambda:us-east-1:204352680806:function:acul-user-lookup`
- **Timeout:** 30 seconds
- **Memory:** 256 MB
- **IAM Role:** `acul-user-lookup-lambda-role`

## Function URL

**URL:** `https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/`

**CORS Configuration:**
- Allow Origins: `*` (all origins)
- Allow Methods: `POST`
- Allow Headers: `Content-Type`
- Max Age: 86400 seconds (24 hours)

## Auth0 Configuration

- **Domain:** `lavender-giraffe-84306.cic-demo-platform.auth0app.com`
- **Client ID:** `g8cmCJv6xJ6182Rz9jV7iFYhkje7VnJr`
- **M2M Application:** Connected with `read:users` permission
- **Audience:** `https://lavender-giraffe-84306.cic-demo-platform.auth0app.com/api/v2/`

## Environment Variables (Configured in Lambda)

✅ `AUTH0_DOMAIN`
✅ `AUTH0_MGMT_CLIENT_ID`
✅ `AUTH0_MGMT_CLIENT_SECRET`
✅ `AUTH0_MGMT_AUDIENCE`

## Frontend Configuration

**Updated Files:**
- ✅ `auth-screens/.env.local` - Function URL configured for local development
- ✅ `auth-screens/.env.production` - Function URL configured for production

## Testing Results

**Test 1: Lambda Invocation**
- ✅ Function invokes successfully
- ✅ Returns proper JSON response
- ✅ CORS headers included in response

**Test 2: Function URL**
- ✅ Accessible via HTTPS
- ✅ Accepts POST requests
- ✅ Returns JSON: `{"found":false}` for non-existent user

## Next Steps

### 1. Configure AWS Amplify Environment Variable

Add the Function URL to your Amplify app:

1. Go to AWS Amplify Console
2. Select your app
3. Navigate to **Environment variables**
4. Add new variable:
   - **Key:** `VITE_USER_LOOKUP_URL`
   - **Value:** `https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/`
5. Save and redeploy

### 2. Test with Real Users

Test the flow with actual users in your Auth0 tenant:

1. Build the frontend: `cd auth-screens && npm run build`
2. Serve locally: `cd auth-screens/dist && npx serve`
3. Configure Auth0 to use the local build
4. Navigate to the login page
5. Enter a username/email of an existing user
6. Verify:
   - Network request to Lambda Function URL
   - Response contains connection name
   - Redirect to `/authorize?connection=...`

### 3. Deploy to Production

Once testing is complete:

1. Push changes to your repository
2. Amplify will automatically build and deploy
3. Test the production deployment

### 4. Monitoring

**CloudWatch Logs:**
```bash
# View Lambda logs
aws logs tail /aws/lambda/acul-user-lookup --follow

# View recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/acul-user-lookup \
  --filter-pattern "ERROR"
```

**Metrics to Monitor:**
- Invocation count
- Error rate
- Duration
- Throttles

### 5. Security Hardening (Recommended for Production)

1. **Update CORS to specific domains:**
   ```bash
   aws lambda update-function-url-config \
     --function-name acul-user-lookup \
     --cors AllowOrigins="https://your-domain.com,https://lavender-giraffe-84306.cic-demo-platform.auth0app.com"
   ```

2. **Add rate limiting with AWS WAF** (optional)
3. **Set up CloudWatch alarms** for errors and throttles

## Rollback Procedure

If issues occur:

1. **Frontend Rollback:**
   - Remove API call from `LoginId.jsx`
   - Restore: `screenProvider.challenge({ username: identifier })`
   - Rebuild and deploy

2. **Lambda Rollback:**
   ```bash
   # Delete Function URL
   aws lambda delete-function-url-config --function-name acul-user-lookup

   # Delete function
   aws lambda delete-function --function-name acul-user-lookup
   ```

## Cost Estimate

**AWS Lambda Pricing:**
- Free Tier: 1M requests/month, 400,000 GB-seconds compute
- After Free Tier: $0.20 per 1M requests + compute time

**Estimated Cost:**
- For 1,000 logins/day (~30,000/month): **$0** (within free tier)
- For 10,000 logins/day (~300,000/month): **~$0.06/month**

## Support & Troubleshooting

### Common Issues

**1. User Not Found (Expected to Find User)**
- Verify user exists in Auth0 Dashboard
- Check identifier format matches (email vs username)
- Verify Management API has `read:users` scope

**2. CORS Error**
```bash
aws lambda get-function-url-config --function-name acul-user-lookup
```

**3. 500 Error**
Check CloudWatch logs for details:
```bash
aws logs tail /aws/lambda/acul-user-lookup --follow
```

### Useful Commands

**Update Lambda code:**
```bash
cd api/user-lookup
npm install
zip -r function.zip .
aws lambda update-function-code \
  --function-name acul-user-lookup \
  --zip-file fileb://function.zip
```

**Update environment variables:**
```bash
aws lambda update-function-configuration \
  --function-name acul-user-lookup \
  --environment Variables="{AUTH0_DOMAIN=...,AUTH0_MGMT_CLIENT_ID=...,AUTH0_MGMT_CLIENT_SECRET=...,AUTH0_MGMT_AUDIENCE=...}"
```

**View function configuration:**
```bash
aws lambda get-function-configuration \
  --function-name acul-user-lookup \
  --query '{Timeout:Timeout,Memory:MemorySize,Runtime:Runtime,Environment:Environment}'
```

## Resources

- Lambda Function: `acul-user-lookup` in us-east-1
- IAM Role: `acul-user-lookup-lambda-role`
- CloudWatch Logs: `/aws/lambda/acul-user-lookup`
- Function URL: https://qq2rkrlrwnkkzenmhphfk3fpbi0qfokq.lambda-url.us-east-1.on.aws/

---

**Deployment completed successfully!** 🎉

The Lambda function is ready to use. Update your Amplify environment variables and deploy to start using connection detection in your LoginId screen.
