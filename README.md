# repldb-deno



ReplDB Deno is just that, a client for ReplDB written for use in Deno and other TypeScript environments.

### How to use

<!-- Import -->

First, you want to import the ReplDB Client. In Deno, you can import it directly from its GitHub URL

```typescript
import { ReplDBClient } from 'https://raw.githubusercontent.com/lunaroyster/repldb-deno/master/mod.ts';
```
<!-- Initialize ReplDBClient -->

To initialize, use one of these:

```typescript
// This only works if REPLIT_DB_URL is defined, which should be the case when running in Repl.it
const replDB = ReplDBClient.createFromEnv();
```

```typescript
const dbUrl = Deno.env.get('REPLIT_DB_URL');
const replDB = new ReplDBClient(dbUrl);
```

<!-- JSON mode -->
<!-- CRUD operations -->
<!-- Group operations -->

### Core functions

<!-- CRUD operations -->