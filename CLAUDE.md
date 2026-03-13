# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a boilerplate for building custom Auth0 Universal Login screens using **Auth0 Custom Universal Login (ACUL)**. It uses React, TypeScript, Vite, TailwindCSS, and ShadCN UI components to create custom authentication interfaces.

The project consists of two main directories:
- `auth-screens/`: React application containing custom screen implementations
- `universal-login/`: Auth0 configuration files (page templates, themes, settings, screen configs)

## Development Commands

### Setting Up
```bash
cd auth-screens
npm install
```

### Development Workflow
```bash
# Development mode with hot reload
cd auth-screens
npm run dev
# Opens at http://localhost:5173

# Build for production (with watch mode)
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Deploying to Auth0 Tenant

1. Build the React application:
```bash
cd auth-screens
npm run build
```

2. Serve the built files locally:
```bash
cd auth-screens/dist
npx serve
# Default serves at http://localhost:3000
```

3. Configure Auth0 tenant (from `universal-login/` directory):
```bash
# Connect to your Auth0 tenant
auth0 login

# Configure a specific screen to use ACUL
# Replace {PROMPT}, {SCREEN}, and {CONFIG_FILE} with actual values
auth0 ul customize -r advanced -p {PROMPT} -s {SCREEN} -f {CONFIG_FILE}

# Example for login-id screen:
auth0 ul customize -r advanced -p login -s login-id -f ./screen_configs/login-id.json

# Reset a screen to standard Universal Login
auth0 ul customize -r standard -p {PROMPT} -s {SCREEN} -f ./screen_configs/reset-to-standard.json
```

## Architecture

### Screen Registration Pattern

All custom screens follow a registration pattern in `auth-screens/src/screens/index.jsx`:

1. **Import the screen component** (e.g., `import LoginId from "./LoginId"`)
2. **Add to `screenMap` object** with its screen identifier (e.g., `"login-id": LoginId`)
3. **Screen identifier** must match the Auth0 screen name (e.g., `login-id`, `signup-password`)

The `getScreenComponent()` function looks up the current screen and returns the appropriate component, or shows a "Not yet implemented" message if the screen isn't in the map.

### Screen Component Structure

Each screen component (e.g., `LoginId.jsx`, `Signup.jsx`) follows this pattern:

```jsx
import { LoginId as ScreenProvider } from "@auth0/auth0-acul-js";

export default function LoginId() {
  // 1. Initialize the ACUL SDK screen provider
  const screenProvider = new ScreenProvider();

  // 2. Extract errors from transaction
  const errors = screenProvider.transaction.errors;
  const fieldErrors = getFieldErrors("fieldname", errors);

  // 3. Create form submit handler that calls SDK method
  const formSubmitHandler = (event) => {
    event.preventDefault();
    // Extract form values and call SDK
    screenProvider.login({ username: value, password: value });
  };

  // 4. Render form with SDK data (texts, links, errors)
  return <form onSubmit={formSubmitHandler}>...</form>;
}
```

Key SDK concepts:
- **`screenProvider.transaction`**: Contains errors, alternate connections, and transaction state
- **`screenProvider.screen`**: Contains texts, data, links (signupLink, resetPasswordLink)
- **`screenProvider.untrustedData`**: Contains submitted form data from previous attempts
- **SDK methods**: Each screen provider has specific methods (e.g., `.login()`, `.signup()`, `.challenge()`)

### Application Entry Point

The application bootstrap follows this flow:

1. `main.jsx` creates the root div and renders `<App />`
2. `App.jsx` renders the `<Widget />` layout component
3. `Widget.jsx` calls `getCurrentScreen()` from ACUL SDK and renders the appropriate screen using `getScreenComponent()`

The `getCurrentScreen()` function returns the current Auth0 screen identifier (e.g., "login-id", "signup-password"), which is used to look up the correct screen component.

### Layout Components

- **`Widget.jsx`**: Main layout wrapper that determines which screen to render based on `getCurrentScreen()`
- **`PageFooter.jsx`**: Footer component for the page

### UI Components

Located in `auth-screens/src/components/ui/`:
- ShadCN-based components (Button, Card, Input, Label)
- Custom error display components (`field-error.jsx`, `screen-errors.jsx`)
- Typography components (Text, Link, Heading)

All UI components are styled with TailwindCSS.

### Utilities

`auth-screens/src/lib/utils.js` exports:
- **`cn()`**: Merges Tailwind classes using `clsx` and `twMerge`
- **`getFieldErrors(field, errors)`**: Filters SDK errors array for specific field

### Build Configuration

Vite configuration (`vite.config.js`) is customized for ACUL:
- Outputs single `bundle.js` file (no code splitting)
- Outputs single `style.css` file (no CSS splitting)
- Uses `@` alias for `./src` imports
- Includes sourcemaps for debugging

This single-file build approach matches the Auth0 screen configuration format in `universal-login/screen_configs/*.json`, which references:
```json
"head_tags": [
  { "tag": "script", "attributes": { "src": "http://localhost:3000/bundle.js" } },
  { "tag": "link", "attributes": { "href": "http://localhost:3000/style.css" } }
]
```

### Auth0 Configuration Files

Located in `universal-login/`:

- **`screen_configs/*.json`**: Screen-specific configuration files that define:
  - `rendering_mode`: Set to "advanced" for ACUL
  - `context_configuration`: What data is available to the screen
  - `head_tags`: Script and stylesheet references to your custom bundles

- **`settings.json`**: Global Universal Login settings (colors, logo_url)
- **`theme.json`**: Theme configuration for Universal Login
- **`page_layout.html.liquid`**: Page template for Universal Login

## Available Screens

Currently implemented screens in `auth-screens/src/screens/`:
- `login.jsx` - Basic login screen
- `login-id.jsx` - Identifier (username/email) login screen
- `login-password.jsx` - Password entry screen
- `signup.jsx` - Basic signup screen
- `signup-id.jsx` - Identifier signup screen
- `signup-password.jsx` - Password creation screen
- `mfa-webauthn-platform-challenge.jsx` - WebAuthn platform authentication
- `mfa-sms-challenge.jsx` - SMS MFA challenge screen

## Adding New Screens

To add a new screen:

1. Create the screen component in `auth-screens/src/screens/`
2. Import the appropriate SDK provider from `@auth0/auth0-acul-js`
3. Register the screen in `auth-screens/src/screens/index.jsx` by adding it to `screenMap`
4. Create a config file in `universal-login/screen_configs/` based on existing examples
5. Build and configure Auth0 tenant to use the new screen
