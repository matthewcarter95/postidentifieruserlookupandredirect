# Connection Routing Solution

## The Problem

When trying to redirect users to their detected connection from the LoginId screen, we encounter:
```
Missing required parameter: response_type
```

This happens because when we redirect to `/authorize`, we're only passing:
- `state`
- `connection`
- `login_hint`

But we're missing required OAuth parameters:
- `response_type` (required)
- `client_id` (required)
- `redirect_uri` (required)
- `scope` (optional but recommended)

## Why This Is Difficult

When you're inside the Universal Login flow (on the LoginId screen), you don't have easy access to the original OAuth parameters that started the `/authorize` request. These parameters are:
1. Encoded in the `state` parameter
2. Managed internally by Auth0
3. Not easily accessible from the ACUL SDK context

## Solution Options

### Option 1: Don't Redirect (Recommended for Most Cases)

**Approach:** Continue with the normal ACUL flow and let Auth0 handle connection routing.

**Implementation:**
```javascript
// In LoginId.jsx
const result = await lookupUserConnection(identifier);

// Just proceed with the normal flow
screenProvider.challenge({ username: identifier });
```

**When Auth0 routes automatically:**
- If you've configured Home Realm Discovery (HRD)
- If connections are configured with specific email domains
- If you have routing rules set up in Auth0

**Pros:**
- Simple, no complex redirect logic
- Preserves OAuth context
- Works with Auth0's built-in routing

**Cons:**
- Doesn't explicitly control which connection is used
- Relies on Auth0's routing logic

### Option 2: Use Auth0 Actions for Connection Routing

**Approach:** Use an Auth0 Redirect Action to handle the connection routing while preserving OAuth context.

**Step 1:** Create an Action in Auth0 Dashboard

Go to Actions → Library → Build Custom → Create Action

```javascript
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  // This won't work as intended - Actions run AFTER authentication
  // Keeping here for reference of what NOT to do
};
```

**Issue:** Post-Login Actions run AFTER authentication, not during identifier entry, so they can't help with routing.

### Option 3: Use Client-Side Redirect with Full OAuth Params (Complex)

**Approach:** Extract all OAuth parameters and construct a complete `/authorize` URL.

**The Challenge:** Getting the original OAuth parameters from within Universal Login.

**Possible Implementation:**
```javascript
// Try to get params from ACUL SDK
const transaction = screenProvider.transaction;
const client = transaction?.client;

// Build authorize URL
const authorizeUrl = new URL(`https://${window.location.hostname}/authorize`);
authorizeUrl.searchParams.set('response_type', 'code'); // Assumption
authorizeUrl.searchParams.set('client_id', client?.clientId);
authorizeUrl.searchParams.set('redirect_uri', client?.callbackURL);
authorizeUrl.searchParams.set('scope', 'openid profile email');
authorizeUrl.searchParams.set('state', /* current state */);
authorizeUrl.searchParams.set('connection', detectedConnection);
authorizeUrl.searchParams.set('login_hint', identifier);

window.location.href = authorizeUrl.toString();
```

**Issues:**
- Hard to extract all required parameters
- Assumptions about response_type may be wrong
- redirect_uri might not be available
- Creates a NEW OAuth flow (might break the original flow)

### Option 4: Pre-Login Connection Selection (Best for True Identifier-First)

**Approach:** Determine the connection BEFORE initiating the OAuth flow.

**Flow:**
1. User lands on your application
2. Show a custom identifier input field (NOT Auth0's)
3. Call the Lambda function to detect connection
4. Redirect to `/authorize` with the detected connection
5. Auth0 skips identifier input and goes straight to the connection's login screen

**Implementation:**

On your application's login page (NOT in Universal Login):
```html
<!-- Your app's login page -->
<form id="login-form">
  <input type="text" id="identifier" placeholder="Enter email or username" />
  <button type="submit">Continue</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const identifier = document.getElementById('identifier').value;

  // Call your Lambda function
  const response = await fetch('https://your-lambda-url.lambda-url.us-east-1.on.aws/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier })
  });

  const result = await response.json();

  if (result.found && result.connection) {
    // Redirect to Auth0 with connection parameter
    window.location.href = `https://YOUR_AUTH0_DOMAIN/authorize?` +
      `response_type=code&` +
      `client_id=YOUR_CLIENT_ID&` +
      `redirect_uri=${encodeURIComponent(YOUR_REDIRECT_URI)}&` +
      `scope=openid%20profile%20email&` +
      `connection=${result.connection}&` +
      `login_hint=${encodeURIComponent(identifier)}`;
  } else {
    // User not found, proceed without connection parameter
    window.location.href = `https://YOUR_AUTH0_DOMAIN/authorize?` +
      `response_type=code&` +
      `client_id=YOUR_CLIENT_ID&` +
      `redirect_uri=${encodeURIComponent(YOUR_REDIRECT_URI)}&` +
      `scope=openid%20profile%20email`;
  }
});
</script>
```

**Pros:**
- Complete control over the flow
- All OAuth parameters are known
- Clean, straightforward implementation

**Cons:**
- Requires hosting a custom login page
- Can't use Auth0's Universal Login branding
- More maintenance overhead

## Recommended Solution

**For your current setup with ACUL:**

Since you're already using Auth0's Custom Universal Login with ACUL, and you want connection routing based on identifier, the recommended approach is:

### Hybrid Approach: Front-end Detection + Action-Based Routing

**Step 1:** Store the detected connection
```javascript
// In LoginId.jsx
const result = await lookupUserConnection(identifier);

if (result.found && result.connection) {
  // Store in sessionStorage for potential use
  sessionStorage.setItem('detected_connection', result.connection);
  sessionStorage.setItem('detected_identifier', identifier);
}

// Continue with normal flow
screenProvider.challenge({ username: identifier });
```

**Step 2:** Configure Auth0 connection routing

In Auth0 Dashboard → Authentication → Database → Connection Settings:

Set up "Home Realm Discovery" or connection-specific domains if applicable.

**Step 3:** (Optional) Create a Post-Login Action to verify/log routing

This won't change the routing, but can help with debugging:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  console.log('User authenticated with connection:', event.connection.name);
  console.log('Username:', event.user.username || event.user.email);
};
```

## Current Implementation

I've updated `LoginId.jsx` to:
1. Lookup the user's connection via Lambda
2. Store the detected connection in sessionStorage
3. Continue with the normal ACUL flow using `screenProvider.challenge()`

This approach:
- ✅ Doesn't break the OAuth flow
- ✅ Preserves all OAuth context
- ✅ Provides connection information for logging/debugging
- ✅ Works with Auth0's built-in routing
- ❌ Doesn't explicitly force the detected connection

## Next Steps

If you need EXPLICIT connection control (not just detection), implement **Option 4** (Pre-Login Connection Selection) by:

1. Creating a custom login page in your application
2. Moving the identifier input to that page
3. Calling the Lambda function before initiating OAuth
4. Redirecting to `/authorize` with all proper parameters

Let me know if you'd like me to implement Option 4 instead.
