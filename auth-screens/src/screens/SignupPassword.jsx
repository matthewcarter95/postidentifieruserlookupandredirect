import { cn, getFieldErrors } from "@/lib/utils";
import { SignupPassword as ScreenProvider } from "@auth0/auth0-acul-js";

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

export default function SignupPassword() {
  // Initialize the SDK for this screen
  const screenProvider = new ScreenProvider();

  // Grab the any errors, if any
  const errors = screenProvider.transaction.errors;
  const passwordErrors = getFieldErrors("password", errors);

  // Handle the submit action
  const formSubmitHandler = (event) => {
    event.preventDefault();

    // disable the submit button
    const submitBtn = event?.target.querySelector("button#submit-btn");
    if (submitBtn) submitBtn.setAttribute("disabled", "true");

  // grab the value from the form
    const identifierInput = event.target.querySelector("input#identifier");
    const passwordInput = event.target.querySelector("input#password");

    // Call the SDK
    screenProvider.signup({
      email: identifierInput?.value,
      password: passwordInput?.value,
    });
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
        <Text className="mb-4 text-large">
          <span className="inline-block">
            Sign up as
            <span className="inline-block ml-1 font-bold">
              {screenProvider.screen.data?.email}.
            </span>
          </span>
          <Link
            href={screenProvider.screen.editLink ?? "#"}
            className="ml-2"
          >
            {screenProvider.screen.texts?.editEmailText ?? "Edit Email"}
          </Link>
        </Text>
        <Input
          type="hidden"
          name="identifier"
          id="identifier"
          value={screenProvider.screen.data?.email}
        />
        <div className="mb-2 space-y-2">
          <Label
            htmlFor="password"
            className={cn(
              "block mb-2 font-semibold",
              passwordErrors?.length ? "text-red-600" : "text-inherit"
            )}
          >
            {screenProvider.screen.texts?.passwordPlaceholder ?? "Password"}
          </Label>
          <Input type="password" id="password" name="password" />
          {passwordErrors?.map((error, index) => (
            <FieldError key={index} error={error} />
          ))}
        </div>
        <Button type="submit" className="w-full">
          {screenProvider.screen.texts?.buttonText ?? "Continue"}
        </Button>
        <Text>
          {screenProvider.screen.texts?.footerText ??
            "Already have an account?"}
          <Link className="ml-1" href={screenProvider.screen.loginLink ?? "#"}>
            {screenProvider.screen.texts?.footerLinkText ??
              "Log into your account"}
          </Link>
        </Text>
      </CardContent>
    </form>
  );
}
