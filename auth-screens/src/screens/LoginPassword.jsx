import { cn, getFieldErrors } from "@/lib/utils";
import { LoginPassword as ScreenProvider } from "@auth0/auth0-acul-js";

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

export default function LoginPassword() {
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

    // grab the values from the form
    const identifierInput = event.target.querySelector("input#identifier");
    const passwordInput = event.target.querySelector("input#password");

    // Call the SDK
    screenProvider.login({
      username: identifierInput?.value,
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
            Log in as
            <span className="inline-block ml-1 font-bold">
              {screenProvider.screen.data?.username}.
            </span>
          </span>
          <Link
            href={screenProvider.screen.editIdentifierLink ?? "#"}
            className="ml-2"
          >
            {screenProvider.screen.texts?.editEmailText ?? "Edit Email"}
          </Link>
        </Text>
        <Input
          type="hidden"
          name="identifier"
          id="identifier"
          value={screenProvider.screen.data?.username}
        />
        <div className="mb-4 space-y-2">
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
        <Button type="submit" id="submit-btn" className="w-full">
          {screenProvider.screen.texts?.buttonText ?? "Continue"}
        </Button>
        <Text>
          Need Help?
          <Link
            href={screenProvider.screen.resetPasswordLink ?? "#"}
            className="ml-1"
          >
            {screenProvider.screen.texts?.forgottenPasswordText ??
              "Forgot your Password?"}
          </Link>
        </Text>
      </CardContent>
    </form>
  );
};
