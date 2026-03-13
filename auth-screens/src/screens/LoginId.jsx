import { useState } from "react";
import { cn, getFieldErrors } from "@/lib/utils";
import { LoginId as ScreenProvider } from "@auth0/auth0-acul-js";
import { lookupUserConnection } from "@/lib/api";
import { OAUTH_CONFIG } from "@/lib/constants";

// UI Components
import { FieldError } from "@/components/ui/field-error";
import { ScreenErrors } from "@/components/ui/screen-errors";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function LoginId() {
  // Initialize the SDK for this screen
  const screenProvider = new ScreenProvider();
  const [isLoading, setIsLoading] = useState(false);

  // Check if alternateConnections is available and has at least one item
  // if (!screenProvider.transaction.alternateConnections) {
  //   console.error('No alternate connections available.');
  // }

  
//  console.log("Identifiers: " + screenProvider.getLoginIdentifiers());
  // console.log(`REQUIRED FIELDS: ${requiredFields}`);

  // Grab the any errors, if any
  const errors = screenProvider.transaction.errors;
  const identifierErrors = getFieldErrors("username", errors) || getFieldErrors("stub_username", errors);

  // Handle the submit action
  const formSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    // disable the submit button
    const submitBtn = event.target.querySelector("button#submit-btn");
    if (submitBtn) submitBtn.setAttribute("disabled", "true");

    // grab the values from the form
    const identifierInput = event.target.querySelector("input#identifier");
    const identifier = identifierInput?.value;

    try {
      // Step 1: Lookup user connection
      const result = await lookupUserConnection(identifier);

      // Build authorize URL with OAuth parameters
      const auth0Domain = window.location.hostname;
      const authorizeUrl = new URL(`${window.location.protocol}//${auth0Domain}/authorize`);

      // OAuth parameters from config
      authorizeUrl.searchParams.set('client_id', OAUTH_CONFIG.CLIENT_ID);
      authorizeUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.REDIRECT_URI);
      authorizeUrl.searchParams.set('scope', OAUTH_CONFIG.SCOPE);
      authorizeUrl.searchParams.set('response_type', OAUTH_CONFIG.RESPONSE_TYPE);

      // Add login_hint to pre-populate identifier
      authorizeUrl.searchParams.set('login_hint', identifier);

      if (result.found && result.connection) {
        // User found - add detected connection
        authorizeUrl.searchParams.set('connection', result.connection);
        console.log('User found - Redirecting to connection:', result.connection);
      } else {
        // User not found - redirect without connection parameter
        // Auth0 will show default Universal Login
        console.log('User not found - Redirecting to default Universal Login');
      }

      console.log('Authorize URL:', authorizeUrl.toString());

      // Redirect to /authorize
      window.location.href = authorizeUrl.toString();
    } catch (error) {
      console.error('User lookup error:', error);

      // Fallback: redirect to /authorize without connection
      console.log('Error during lookup, falling back to default Universal Login');

      const auth0Domain = window.location.hostname;
      const authorizeUrl = new URL(`${window.location.protocol}//${auth0Domain}/authorize`);

      // OAuth parameters from config
      authorizeUrl.searchParams.set('client_id', OAUTH_CONFIG.CLIENT_ID);
      authorizeUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.REDIRECT_URI);
      authorizeUrl.searchParams.set('scope', OAUTH_CONFIG.SCOPE);
      authorizeUrl.searchParams.set('response_type', OAUTH_CONFIG.RESPONSE_TYPE);
      authorizeUrl.searchParams.set('login_hint', identifier);

      console.log('Fallback Authorize URL:', authorizeUrl.toString());

      // Redirect to /authorize without connection parameter
      window.location.href = authorizeUrl.toString();
    }
  };

  // Render the form
  return (
    <form noValidate onSubmit={formSubmitHandler}>
      <CardHeader>
        <CardTitle className="mb-2 text-center" style={{fontSize: '24px'}}>
          Log in to the Personal Investor site
        </CardTitle>
        <CardDescription className="mb-8 text-center" style={{fontSize: '14px'}}>
          Not a personal investor?
        </CardDescription>
        <ScreenErrors className="mb-4" errors={errors} />
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <Label
            htmlFor="identifier"
            className={cn(
              "block mb-2 font-semibold",
              identifierErrors?.length ? "text-red-600" : "text-inherit"
            )}
          >
            Username
          </Label>
          <Input
            type="text"
            id="identifier"
            name="identifier"
            defaultValue={
              screenProvider.screen.data?.username ??
              screenProvider.untrustedData.submittedFormData?.username
            }
          />
          {identifierErrors?.map((error, index) => (
            <FieldError key={index} error={error} />
          ))}
        </div>
        <Button type="submit" id="submit-btn" className="w-full mt-4" disabled={isLoading}>
          {isLoading ? "Looking up..." : (screenProvider.screen.texts?.buttonText ?? "Continue")}
        </Button>
        <Text className="mb-2">
          {screenProvider.screen.texts?.footerText ??
            "Don't have an account yet?"}
          <Link className="ml-1" href={screenProvider.screen.signupLink ?? "#"}>
            {screenProvider.screen.texts?.footerLinkText ??
              "Create your account"}
          </Link>
        </Text>
        <Text>
          Need Help?
          <Link
            className="ml-1"
            href={screenProvider.screen.resetPasswordLink ?? "#"}
          >
            {screenProvider.screen.texts?.forgottenPasswordText ??
              "Forgot your Password?"}
          </Link>
        </Text>
      </CardContent>
    </form>
  );
}
