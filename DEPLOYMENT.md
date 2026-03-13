# User Lookup Lambda Deployment Guide

This guide walks you through deploying the user lookup Lambda function that enables connection detection for the LoginId screen.

## Prerequisites

1. AWS CLI installed and configured
2. Auth0 tenant with Management API access
3. Node.js and npm installed

## Step 1: Create Auth0 Machine-to-Machine Application

1. Go to Auth0 Dashboard → Applications → Create Application
2. Name: "ACUL User Lookup Service"
3. Type: Machine to Machine
4. Authorize for: **Auth0 Management API**
5. Permissions: Grant `read:users`
6. Note down:
   - Client ID
   - Client Secret
   - Domain (e.g., `your-tenant.us.auth0.com`)

## Step 2: Create IAM Role for Lambda (if not exists)

If you don't have a Lambda execution role, create one:

```bash
# Create trust policy file
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create the role
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document file://trust-policy.json

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Get the role ARN (you'll need this)
aws iam get-role --role-name lambda-execution-role --query 'Role.Arn' --output text
```

Note the ARN output (e.g., `arn:aws:iam::123456789012:role/lambda-execution-role`)

## Step 3: Package Lambda Function

```bash
cd api/user-lookup
npm install
zip -r function.zip .
```

## Step 4: Deploy Lambda Function

Replace the placeholders with your actual values:
- `YOUR_ACCOUNT_ID` - Your AWS account ID
- `YOUR_AUTH0_DOMAIN` - Your Auth0 domain (e.g., `dev-abc123.us.auth0.com`)
- `YOUR_CLIENT_ID` - The M2M application Client ID from Step 1
- `YOUR_CLIENT_SECRET` - The M2M application Client Secret from Step 1

```bash
aws lambda create-function \
  --function-name acul-user-lookup \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --environment Variables="{AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN,AUTH0_MGMT_CLIENT_ID=YOUR_CLIENT_ID,AUTH0_MGMT_CLIENT_SECRET=YOUR_CLIENT_SECRET,AUTH0_MGMT_AUDIENCE=https://YOUR_AUTH0_DOMAIN/api/v2/}"
```

## Step 5: Create Function URL

```bash
aws lambda create-function-url-config \
  --function-name acul-user-lookup \
  --auth-type NONE \
  --cors AllowOrigins="*",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type"
```

This will output a Function URL like:
```
https://abcd1234567890.lambda-url.us-east-1.on.aws/
```

**Save this URL - you'll need it for the frontend configuration!**

## Step 6: Add Public Invoke Permissions

```bash
aws lambda add-permission \
  --function-name acul-user-lookup \
  --statement-id FunctionURLAllowPublicAccess \
  --action lambda:InvokeFunctionUrl \
  --principal "*" \
  --function-url-auth-type NONE
```

## Step 7: Test Lambda Function

Test the function directly:

```bash
aws lambda invoke \
  --function-name acul-user-lookup \
  --payload '{"body":"{\"identifier\":\"test@example.com\"}","requestContext":{"http":{"method":"POST"}}}' \
  response.json

cat response.json
```

## Step 8: Configure Frontend

### For Local Development

Update `auth-screens/.env.local`:

```bash
VITE_USER_LOOKUP_URL=https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/
```

### For Production (AWS Amplify)

1. Go to AWS Amplify Console
2. Select your app
3. Go to **Environment variables**
4. Add new variable:
   - Key: `VITE_USER_LOOKUP_URL`
   - Value: `https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/`
5. Save

## Step 9: Build and Deploy Frontend

```bash
cd auth-screens
npm install
npm run build
```

Push to your repository to trigger Amplify deployment, or deploy manually.

## Step 10: Test End-to-End

1. Navigate to your login page
2. Open browser Developer Tools (Network tab)
3. Enter a username/email
4. Click "Continue"
5. Verify:
   - POST request to Lambda Function URL
   - Response with connection info
   - Redirect to `/authorize` with `connection` parameter

## Troubleshooting

### Lambda Returns 500 Error

Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/acul-user-lookup --follow
```

Common issues:
- Incorrect Auth0 credentials
- Missing Management API permissions
- Invalid Auth0 domain

### CORS Error in Browser

Verify Function URL CORS config:
```bash
aws lambda get-function-url-config --function-name acul-user-lookup
```

Should show:
```json
{
  "AllowOrigins": ["*"],
  "AllowMethods": ["POST", "OPTIONS"],
  "AllowHeaders": ["Content-Type"]
}
```

### User Not Found (found: false)

- Verify user exists in Auth0
- Check the identifier format (email vs username)
- Verify Management API has `read:users` permission

### Frontend Shows "Looking up..." Forever

- Check Network tab for failed requests
- Verify `VITE_USER_LOOKUP_URL` is set correctly
- Check Lambda CloudWatch logs for errors

## Updating Lambda Function

To update the function code after changes:

```bash
cd api/user-lookup
npm install
zip -r function.zip .

aws lambda update-function-code \
  --function-name acul-user-lookup \
  --zip-file fileb://function.zip
```

## Security Considerations

### Production CORS Configuration

For production, restrict CORS to your specific domains:

```bash
aws lambda update-function-url-config \
  --function-name acul-user-lookup \
  --cors AllowOrigins="https://your-domain.com,https://your-tenant.us.auth0.com",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type"
```

### Rate Limiting

Consider adding AWS WAF to prevent abuse:

1. Create WAF Web ACL
2. Add rate-based rule (e.g., 100 requests per 5 minutes per IP)
3. Associate with Lambda Function URL

### Monitoring

Set up CloudWatch alarms:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name acul-user-lookup-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=acul-user-lookup
```

## Rollback

If issues occur, revert the LoginId screen:

1. Remove the user lookup logic from `LoginId.jsx`
2. Restore original: `screenProvider.challenge({ username: identifier })`
3. Rebuild and deploy

The Lambda function can remain deployed without impact.

## Cost Estimate

With AWS Lambda pricing:
- **Free Tier**: 1M requests/month, 400,000 GB-seconds compute
- **After Free Tier**: $0.20 per 1M requests + compute time

For typical usage (1000 logins/day):
- Monthly requests: ~30,000
- **Cost: $0** (within free tier)

## Additional Resources

- [AWS Lambda Function URLs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [Auth0 User Search](https://auth0.com/docs/manage-users/user-search/user-search-query-syntax)
