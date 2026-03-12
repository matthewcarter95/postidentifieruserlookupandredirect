// Import all the screens here
import Signup from "./Signup";
import SignupId from "./SignupId";
import SignupPassword from "./SignupPassword";
import Login from "./Login";
import LoginId from "./LoginId";
import LoginPassword from "./LoginPassword";
import MfaWebAuthnPlatformChallenge from "./MfaWebAuthnPlatformChallenge";
import MfaSmsChallenge from "./MfaSmsChallenge";

// Reference all the screens in this map
const screenMap = {
  "login": Login,
  "login-id": LoginId,
  "login-password": LoginPassword,
  "signup": Signup,
  "signup-id": SignupId,
  "signup-password": SignupPassword,
  "mfa-webauthn-platform-challenge": MfaWebAuthnPlatformChallenge,
  "mfa-sms-challenge": MfaSmsChallenge
};

/**
 * Finds the right screen component or returns an empty one
 * @param screen - the name of the current screen
 * @returns - the React screen component
 */
export function getScreenComponent(screen) {
  const ScreenComponent = screenMap[screen];

  return ScreenComponent ? (
    <ScreenComponent />
  ) : (
    <div>
      <h1 className="mb-4 text-2xl font-medium">Not yet implemented!</h1>
      <p>Screen: {screen}</p>
    </div>
  );
}
