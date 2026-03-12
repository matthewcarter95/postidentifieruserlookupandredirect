import { cn, getFieldErrors } from "@/lib/utils";
import { MfaWebAuthnPlatformChallenge as ScreenProvider } from "@auth0/auth0-acul-js";
import { useState } from "react";


// UI Components
import { FieldError } from "@/components/ui/field-error";
import { ScreenErrors } from "@/components/ui/screen-errors";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Link } from "@/components/ui/link";
import {
  CardHeader,
  CardContent,
} from "@/components/ui/card";

export default function MfaWebAuthnPlatformChallenge() {
  // Initialize the SDK for this screen
  const screenProvider = new ScreenProvider();
  const [isProcessing, setIsProcessing] = useState(false);

  // Grab any errors, if any
  const errors = screenProvider.transaction?.errors || [];

  // Handle the WebAuthn challenge
  const handleWebAuthnChallenge = async () => {
    setIsProcessing(true);
    try {
      await screenProvider.submitPasskeyCredential();
      // On success, Auth0 handles redirection
    } catch (error) {
      console.error('WebAuthn challenge failed:', error);
      if (error.name && error.message) {
        await screenProvider.reportBrowserError({ 
          error: { name: error.name, message: error.message } 
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle skip action
  const handleSkip = () => {
    if (screenProvider.screen.showSkipButton) {
      screenProvider.skip();
    }
  };

  // Render the form
  return (
    <div>
      <CardHeader>
        <ScreenErrors className="mb-4" errors={errors} />
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {screenProvider.screen.texts?.title ?? "Use your security key or biometric"}
          </h2>
          <p className="text-gray-600 mb-6">
            {screenProvider.screen.texts?.description ?? "Touch your security key or use your device's biometric authentication to continue."}
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleWebAuthnChallenge}
            disabled={isProcessing}
            className="w-full rounded-full"
          >
            {isProcessing ? "Authenticating..." : (screenProvider.screen.texts?.buttonText ?? "Use Security Key / Biometric")}
          </Button>

          {screenProvider.screen.showSkipButton && (
            <Button 
              onClick={handleSkip}
              variant="outline"
              className="w-full rounded-full"
              disabled={isProcessing}
            >
              {screenProvider.screen.texts?.skipButtonText ?? "Skip for now"}
            </Button>
          )}
        </div>

        <Text className="text-center mt-4">
          <Link
            className="text-sm"
            href="#"
          >
            Having trouble? Try another method
          </Link>
        </Text>
      </CardContent>
    </div>
  );
}