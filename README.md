# repldb-deno

ReplDB Deno is just that, a client for ReplDB written for use in Deno and other TypeScript environments.

## How to use

### Importing ReplDB

First, you want to import the ReplDB Client. In Deno, you can import it directly from its GitHub URL

```typescript
import { ReplDBClient } from 'https://raw.githubusercontent.com/lunaroyster/repldb-deno/master/mod.ts';
```
### Initializing ReplDB

To initialize, use one of these:

```typescript
// This only works if REPLIT_DB_URL is defined, which should be the case when running in Repl.it
const replDB = ReplDBClient.createFromEnv();
```

```typescript
const dbUrl = Deno.env.get('REPLIT_DB_URL');
const replDB = new ReplDBClient(dbUrl);
```

#### JSON mode

You can also initialize ReplDB in json mode, which automatically serializes and deserializes values to JSON strings before storing in ReplDB.

```typescript
const replDB = new ReplDBClient(dbUrl, { mode: 'json' });
```

Or,

```typescript
const replDB = ReplDBClient.createFromEnv({ mode: 'json' });
```

### CRUD operations

Here's some examples 

```typescript
// Setting a value for a given key
await replDB.set('date', '6/28/2020');

// Getting a value
let date = await replDB.get('date');
console.log(date);
// 6/28/2020

// Listing all keys
let keys = await replDB.list();
console.log(keys);
// [ "date" ]

// Deleting a key (and its value)
await replDB.delete('date')
console.log(await replDB.list().length === 0)
// true

```

### Group operations (wip)
<!-- Group operations -->

### Core functions

The client contains 'Core functions' that are wrappers around the main http calls. These start with a capital letter.