import { useState } from "react";
import { cn, getFieldErrors } from "@/lib/utils";
import { LoginId as ScreenProvider } from "@auth0/auth0-acul-js";
import { lookupUserConnection } from "@/lib/api";

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

      if (result.found && result.connection) {
        // Step 2: Re-initiate authorize with connection parameter
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('connection', result.connection);
        urlParams.set('login_hint', identifier); // Auto-populate identifier

        // Get the Auth0 domain from the current URL
        const auth0Domain = window.location.hostname;

        // Redirect to /authorize with connection param
        window.location.href = `${window.location.protocol}//${auth0Domain}/authorize?${urlParams.toString()}`;
      } else {
        // User not found - proceed with normal flow
        screenProvider.challenge({ username: identifier });
      }
    } catch (error) {
      console.error('User lookup error:', error);
      // Fallback to normal flow on error
      screenProvider.challenge({ username: identifier });
    } finally {
      setIsLoading(false);
      if (submitBtn) submitBtn.removeAttribute("disabled");
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
