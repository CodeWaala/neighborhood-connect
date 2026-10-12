# Neighborhood Connect

A neighborhood-based connection platform for parents of young children and pet parents to find and meet nearby people who share routines and interests, favoring real-world meetups over online engagement.

## Language

**Web App**:
The existing Vite + React single-page app serving the authenticated product (onboarding, discovery, connections, messaging, profile) over the browser.
_Avoid_: "the app" (now ambiguous with Mobile App), frontend

**Mobile App**:
The React Native (Expo) client shipping the same core product as the Web App, released on iOS first with Android as a committed near-term follow-on from the same codebase.
_Avoid_: iOS App (too narrow — Android is coming), native app

**Mobile Auth Client**:
The Cognito App Client dedicated to the Mobile App, with its own redirect URI scheme and session lifetime, distinct from the Web App's Hosted-UI App Client but issued against the same Cognito User Pool.
_Avoid_: Cognito client, app client (ambiguous now that there are two)

**Device Token**:
The token identifying a specific Mobile App install for push delivery, registered with the backend after login/launch so a user's connection requests and messages can trigger a push notification.
_Avoid_: push token (fine informally, but "Device Token" is the term to use in schema/code)
