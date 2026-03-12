# Connect Auth0 CLI to your tenant
auth0 login

# Open the Universal Login Customize Utility
# This is useful for customizing the Page Template, Partials, Themes, Texts, etc.
auth0 ul customize -r standard

# Manage the ACUL Rendering Mode
# {PROMPT} - the prompt name e.g. `login-passwordless`
# {SCREEN} - the specific screen e.g. `login-passwordless-email-code`
# {CONFIG_FILE} - the path to the configuration file for this screen e.g. ./screen_configs/login-passwordless-email-code.json

# Use ACUL as the rendering mode
auth0 ul customize -r advanced -p {PROMPT} -s {SCREEN} -f {CONFIG_FILE}

# Use the default Universal Login UI
auth0 ul customize -r standard -p {PROMPT} -s {SCREEN} -f ./screen_configs/reset-to-standard.json




