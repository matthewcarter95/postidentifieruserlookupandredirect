import { cn, getFieldErrors } from "@/lib/utils";
import ScreenProvider from "@auth0/auth0-acul-js/mfa-sms-challenge";
import { useState } from "react";

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
  CardContent,
} from "@/components/ui/card";

export default function MfaSmsChallenge() {
  // Initialize the SDK for this screen
  const screenProvider = new ScreenProvider();
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Grab any errors, if any
  const errors = screenProvider.transaction?.errors || [];
  const otpErrors = getFieldErrors("otp", errors);

  // Handle the submit action
  const formSubmitHandler = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      await screenProvider.continueMfaSmsChallenge({
        code: otp,
        rememberDevice: false
      });
      // On success, Auth0 handles redirection
    } catch (error) {
      console.error("MFA SMS challenge failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resend SMS
  const handleResend = async () => {
    try {
      await screenProvider.requestNewCode();
    } catch (error) {
      console.error("Resend SMS failed:", error);
    }
  };

  // Render the form
  return (
    <form noValidate onSubmit={formSubmitHandler}>
      <CardHeader>
        <ScreenErrors className="mb-4" errors={errors} />
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {screenProvider.screen.texts?.title ?? "Enter verification code"}
          </h2>
          <p className="text-gray-600 mb-6">
            {screenProvider.screen.texts?.description ?? "Please enter the verification code sent to your phone"}
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <Label
            htmlFor="otp"
            className={cn(
              "block mb-2 font-semibold",
              otpErrors?.length ? "text-red-600" : "text-inherit"
            )}
          >
            Verification Code
          </Label>
          <Input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoComplete="one-time-code"
            autoFocus
          />
          {otpErrors?.map((error, index) => (
            <FieldError key={index} error={error} />
          ))}
        </div>

        <Button 
          type="submit" 
          className="w-full rounded-full mb-4"
          disabled={isProcessing}
        >
          {isProcessing ? "Verifying..." : (screenProvider.screen.texts?.buttonText ?? "Verify")}
        </Button>

        <Text className="text-center">
          <Link
            onClick={handleResend}
            className="text-sm cursor-pointer"
          >
            {screenProvider.screen.texts?.resendText ?? "Resend code"}
          </Link>
        </Text>
      </CardContent>
    </form>
  );
}