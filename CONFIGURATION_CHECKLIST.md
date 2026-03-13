# User Lookup Implementation - Configuration Checklist

Use this checklist to track your deployment progress.

## 1. Auth0 Configuration

### Create Machine-to-Machine Application
- [ ] Go to Auth0 Dashboard → Applications → Create Application
- [ ] Name: "ACUL User Lookup Service"
- [ ] Type: Machine to Machine
- [ ] Authorize for: Auth0 Management API
- [ ] Grant permission: `read:users`
- [ ] Record credentials:
  - Client ID: `_______________________`
  - Client Secret: `_______________________`
  - Domain: `_______________________`

## 2. AWS Lambda Deployment

### Create IAM Role (if needed)
- [ ] Create Lambda execution role: `lambda-execution-role`
- [ ] Attach policy: `AWSLambdaBasicExecutionRole`
- [ ] Record Role ARN: `_______________________`

### Package Lambda Function
```bash
cd api/user-lookup
npm install
zip -r function.zip .
```
- [ ] Dependencies installed
- [ ] Function packaged

### Deploy Lambda Function
```bash
aws lambda create-function \
  --function-name acul-user-lookup \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --environment Variables="{AUTH0_DOMAIN=YOUR_DOMAIN,AUTH0_MGMT_CLIENT_ID=YOUR_CLIENT_ID,AUTH0_MGMT_CLIENT_SECRET=YOUR_CLIENT_SECRET,AUTH0_MGMT_AUDIENCE=https://YOUR_DOMAIN/api/v2/}"
```
- [ ] Function created successfully

### Create Function URL
```bash
aws lambda create-function-url-config \
  --function-name acul-user-lookup \
  --auth-type NONE \
  --cors AllowOrigins="*",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type"
```
- [ ] Function URL created
- [ ] Record Function URL: `_______________________`

### Add Invoke Permissions
```bash
aws lambda add-permission \
  --function-name acul-user-lookup \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```
- [ ] Permissions added

### Test Lambda Function
```bash
aws lambda invoke \
  --function-name acul-user-lookup \
  --payload '{"body":"{\"identifier\":\"test@example.com\"}","requestContext":{"http":{"method":"POST"}}}' \
  response.json
```
- [ ] Test successful
- [ ] Response contains expected data

## 3. Frontend Configuration

### Local Development
- [ ] Update `auth-screens/.env.local` with Function URL
- [ ] Test locally with `npm run dev`

### Production (AWS Amplify)
- [ ] Add environment variable in Amplify Console:
  - Key: `VITE_USER_LOOKUP_URL`
  - Value: `https://your-lambda-url.lambda-url.us-east-1.on.aws/`
- [ ] Trigger Amplify rebuild

## 4. Testing

### Manual Testing
- [ ] Navigate to login page
- [ ] Open browser DevTools (Network tab)
- [ ] Enter a known username/email
- [ ] Click "Continue"
- [ ] Verify POST request to Lambda
- [ ] Verify response contains connection
- [ ] Verify redirect to `/authorize?connection=...`

### Test Cases
- [ ] User exists in database connection → Should detect connection
- [ ] User exists in social connection → Should detect connection
- [ ] User doesn't exist → Should fall back to normal flow
- [ ] API error → Should fall back to normal flow
- [ ] Network error → Should fall back to normal flow

## 5. Monitoring & Security

### CloudWatch
- [ ] Verify logs appear in `/aws/lambda/acul-user-lookup`
- [ ] Set up error alarm (optional)

### Security Hardening (Production)
- [ ] Update CORS to specific domains (not *)
- [ ] Consider adding AWS WAF rate limiting
- [ ] Review Lambda execution role permissions

## 6. Documentation

- [ ] Update team documentation with new flow
- [ ] Document rollback procedure
- [ ] Note Function URL for future reference

## Troubleshooting Reference

### Lambda Returns 500
Check CloudWatch logs:
```bash
aws logs tail /aws/lambda/acul-user-lookup --follow
```

### CORS Error
Verify CORS config:
```bash
aws lambda get-function-url-config --function-name acul-user-lookup
```

### User Not Found (Expected to be Found)
- Check Auth0 Dashboard for user
- Verify Management API permissions
- Check identifier format (email vs username)

### Frontend Shows "Looking up..." Forever
- Check Network tab for failed requests
- Verify `VITE_USER_LOOKUP_URL` environment variable
- Check Lambda CloudWatch logs

## Configuration Summary

Once completed, record your configuration here:

**Auth0 Configuration:**
- Domain: `_______________________`
- M2M Client ID: `_______________________`

**AWS Configuration:**
- Lambda Function Name: `acul-user-lookup`
- Lambda Region: `_______________________`
- Function URL: `_______________________`

**Frontend Configuration:**
- Amplify App: `_______________________`
- Environment Variable Set: Yes / No

**Deployment Date:** `_______________________`
**Deployed By:** `_______________________`
