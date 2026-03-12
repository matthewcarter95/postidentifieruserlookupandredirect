import { cn, getFieldErrors } from "@/lib/utils";
import { SignupId as ScreenProvider } from "@auth0/auth0-acul-js";

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

export default function SignupId() {
  // Initialize the SDK for this screen
  const screenProvider = new ScreenProvider();

  // Grab the any errors, if any
  const errors = screenProvider.transaction.errors;
  const identifierErrors = getFieldErrors("username", errors);
  const firstnameErrors = getFieldErrors("firstname", errors);

  // Handle the submit action
  const formSubmitHandler = (event) => {
    event.preventDefault();

    // disable the submit button
    const submitBtn = event.target.querySelector("button#submit-btn");
    if (submitBtn) submitBtn.setAttribute("disabled", "true");

    // grab the value from the form
    const identifierInput = event.target.querySelector("input#identifier");
    const firstnameInput = event.target.querySelector("input#firstname");

    // Call the SDK
    screenProvider.signup({ username: identifierInput?.value, "ulp-firstname": firstnameInput?.value });
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
     <div className="mb-4 space-y-2">
<Label
htmlFor="firstname"
className={cn(
"block mb-2 font-semibold",
firstnameErrors?.length ? "text-red-600" : "text-inherit"
)}
>
First Name
</Label>
<Input
type="text"
id="firstname"
name="firstname"
/>
{firstnameErrors?.map((error, index) => (
<FieldError key={index} error={error} />
))}
        </div>
        <Button type="submit" id="submit-btn" className="w-full">
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
};
