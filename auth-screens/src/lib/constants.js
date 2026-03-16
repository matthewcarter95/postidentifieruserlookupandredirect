// Base URL for Assets (Local or Remote)
export const BASE_URL = "";
// export const BASE_URL = "https://bucket-name.s3.us-east-2.amazonaws.com";

// App Homepage URL
export const APP_URL = "#";

// Lambda Function URL for user lookup
export const USER_LOOKUP_URL = import.meta.env.VITE_USER_LOOKUP_URL || "";

// OAuth Configuration for connection-based redirects
export const OAUTH_CONFIG = {
  CLIENT_ID: "K0ru08tcnrlTDq9n7sR0XcqaSdUEbmRv",
  REDIRECT_URI: "https://githubypfbxxva-mo4w--5173--8669d46c.local-credentialless.webcontainer.io/",
  SCOPE: "openid profile email",
  RESPONSE_TYPE: "code"
};
