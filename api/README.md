# User Lookup API

AWS Lambda function that looks up Auth0 users and returns their connection information.

## Purpose

This Lambda function is used by the LoginId screen to determine which Auth0 connection a user belongs to based on their identifier (email or username). This enables connection-specific login flows.

## How It Works

1. Receives identifier (email or username) from frontend
2. Obtains Management API token using client credentials
3. Searches Auth0 users using Lucene query: `email:"X" OR username:"X"`
4. Returns the user's connection name

## API Contract

### Request

```http
POST /
Content-Type: application/json

{
  "identifier": "user@example.com"
}
```

### Response - User Found

```json
{
  "found": true,
  "connection": "Username-Password-Authentication",
  "userId": "auth0|123456789"
}
```

### Response - User Not Found

```json
{
  "found": false
}
```

### Response - Error

```json
{
  "error": "Internal server error"
}
```

## Environment Variables

Required environment variables (set in Lambda configuration):

- `AUTH0_DOMAIN` - Your Auth0 tenant domain (e.g., `dev-abc123.us.auth0.com`)
- `AUTH0_MGMT_CLIENT_ID` - M2M application client ID
- `AUTH0_MGMT_CLIENT_SECRET` - M2M application client secret
- `AUTH0_MGMT_AUDIENCE` - Management API audience (e.g., `https://dev-abc123.us.auth0.com/api/v2/`)

## Local Testing

You can test the Lambda function locally using the AWS SAM CLI:

```bash
# Install dependencies
npm install

# Invoke locally with test event
sam local invoke -e test-event.json
```

Create `test-event.json`:

```json
{
  "body": "{\"identifier\":\"test@example.com\"}",
  "requestContext": {
    "http": {
      "method": "POST"
    }
  }
}
```

## Deployment

See `DEPLOYMENT.md` in the root directory for complete deployment instructions.

Quick deploy:

```bash
cd api/user-lookup
npm install
zip -r function.zip .

aws lambda update-function-code \
  --function-name acul-user-lookup \
  --zip-file fileb://function.zip
```

## Security

- All Auth0 credentials are stored as Lambda environment variables
- CORS is enabled for Function URL
- Input is sanitized to prevent injection attacks
- Errors are logged to CloudWatch but generic messages returned to client

## Monitoring

CloudWatch Logs are automatically created at:
```
/aws/lambda/acul-user-lookup
```

View logs:
```bash
aws logs tail /aws/lambda/acul-user-lookup --follow
```

## Cost

This function runs on AWS Lambda free tier:
- 1M requests/month free
- 400,000 GB-seconds compute free

Typical usage: < $1/month

## Troubleshooting

### 500 Error - "Internal server error"

Check CloudWatch logs for details. Common causes:
- Invalid Auth0 credentials
- Missing Management API permissions
- Network issues reaching Auth0

### CORS Error

Verify Function URL CORS configuration:
```bash
aws lambda get-function-url-config --function-name acul-user-lookup
```

### User Not Found (when you expect it to be found)

- Verify user exists in Auth0 Dashboard
- Check identifier format matches (email vs username)
- Verify Management API has `read:users` scope
