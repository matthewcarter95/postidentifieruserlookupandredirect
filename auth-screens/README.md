# SKO26 Lab Boilerplate
This boilerplate repos uses [React](https://react.dev/), [Typescript](https://www.typescriptlang.org/), and [Vite](https://vite.dev/) to build custom interfaces for the various Universal Login screens. This setup is common for minimal React apps that do not require state management or routing. It was created by running the following command in terminal.

`npm create vite@latest -- --template react-ts`

#### What's included?
This boilerplate includes
* [ACUL SDK](https://auth0.github.io/universal-login/modules.html) for building custom interfaces and submitting data to the server.
* [ShadCN](https://ui.shadcn.com/) for generating simple components.
* [TailwindCSS v3](https://v3.tailwindcss.com/) for styling those components.
* A Universal Login [page template](https://auth0.com/docs/customize/login-pages/universal-login/customize-templates) that matches the base design of the boilerplate for use with default UL screens.
* Setting and Theme configurations for Universal Login that match the base design.
* [Auth0 CLI](https://github.com/auth0/auth0-cli) commands and configuration files for configuring ACUL for each pre-built screen.

#### What's not included?
* **Every screen in Universal Login.** Universal Login contains ~80 distinct screens. We are still working to add support of all these screens. Watch the [Auth0 Changelog](https://auth0.com/changelog) and join [#cic-acul-ea](https://okta.enterprise.slack.com/archives/C0842AUKMU3) in Slack for updates.
* **A production-ready build pipeline.** This boilerplate is to help you get up an running for you own demos and testing. We will be providing more guidance on examples on production-ready builds, deployment, and hosting.

## Getting Started
After extracting or cloning this repo, do the following to verify that it is up and running

1. Navigate to the `auth-screens` directory in terminal
2. Run `npm install`
3. Run `npm run dev`
4. Open [localhost:5173](http://localhost:5173/), you should see a stub of the Login Id screen with errors

## Developing against your Auth0 Tenant
In order to develop against your tenant you need to configure it to use one or more of you custom screens. To do this

1. Navigate to the `universal-login` directory in terminal
2. Run the Auth0 CLI command for configuring a screen (see `auth0_cli_commands.sh`) for details. Once this is done your tenant is now pointing to your local environment to load the asset bundles.
3. Navigate back to the `auth-screens` directory in terminal
4. Run `npm run build`. This will build a version of your bundles
5. Navigate to the `auth-screen/dist` directory in terminal
6. Start a local dev server by running `npx serve` in the `dist` folder. Now you should be able to use the Try button in the dashboard to load up your custom interface.
