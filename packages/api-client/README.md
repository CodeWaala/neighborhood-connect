# @neighborhood-connect/api-client

Typed client for the `/v1` API, shared by `apps/web` and `apps/mobile`.

The package ships TypeScript source (no build step); Vite and Metro compile it.

```ts
import { configureApiClient, setGetUserId, listMatches } from '@neighborhood-connect/api-client';

configureApiClient({
  baseUrl: 'http://localhost:3000/v1',
  onUnauthorized: () => { /* clear the session, go to sign-in */ },
});
setGetUserId(() => currentUserId);
```
