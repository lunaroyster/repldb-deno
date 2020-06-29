export type ReplDBClientMode = 'raw' | 'json';

export interface ReplDBClientOptions {
	mode: ReplDBClientMode;
}

export class ReplDBClient {
	url: string;
	mode?: ReplDBClientMode;
	constructor(dbUrl: string, options?: ReplDBClientOptions) {
		this.url = dbUrl;
		if (options) {
			this.mode = options.mode;
		}
	}
	/**
	 * Creates a ReplDBClient from the environment. (This works on a ReplDB enabled repl.)
	 */
	static createFromEnv(options?: ReplDBClientOptions) {
		let dbUrl = Deno.env.get('REPLIT_DB_URL');
		if (!dbUrl) {
			throw new Error('REPLIT_DB_URL is not defined!')
		}
		return new ReplDBClient(dbUrl, options);
	}

  /****************
   * CORE FUNCTIONS
   ****************/

  /**
	 * Gets the value corresponding to `key`, or null if that key doesn't exist
   * @param key The ReplDB key
   */
	async Get (key: string) : Promise<string|null> {
		let res = await fetch(`${this.url}/${key}`);
		if (res.status === 404) {
			return null;
		}
		return await res.text();
  }

	/**
	 * Sets the value of `key` to the string `value`. Returns true on success.
   * @param key
   * @param value
	 */
	async Set(key: string, value: string) : Promise<boolean> {
		if (typeof key !== 'string' || key == '') {
			throw new Error('`key` must be a non-zero length string');
		}

		try {
			let res = await fetch(this.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `${key}=${value}`,
			});
			if (res.status !== 200) {
				throw new Error(`ReplDB returned a non-200 response`);
			}
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	/**
	 * Returns a list of keys with the given `prefix`.
   * @param prefix Return keys starting with this prefix
	 */
	async ListPrefix(prefix: string): Promise<Array<string>> {

		if (!prefix) {
			// Listing is read-only, so we don't require explicitly using `ListAll()`
			prefix = '';
		}

    let params = (new URLSearchParams({prefix})).toString();

		let res = await fetch(`${this.url}?${params}`, {
			method: 'GET',
		});
		if (res.status !== 200) {
			return [];
		}
		let contents = await res.text();
		return contents.split('\n').filter(k => k !== '');
  }
	/**
	 * Deletes given key (and its value)
   * @param key the key to delete
	 */
	async Delete(key: string): Promise<boolean> {
		
		if (!key) {
			throw new Error('`key` not provided.')
		}

		let res = await fetch(`${this.url}/${key}`, {
			method: 'DELETE',
		});
		return res.status === 200;
  }

  /*********************
   * Interface functions
   *********************/

	async get(key: string) {
		let value = await this.Get(key);
		if (!value) return null;
		if (this.mode === 'json') {
			value = JSON.parse(value);
		}
		return value;
	}
	async set(key: string, value: any) {
		if (this.mode === 'json') {
			value = JSON.stringify(value);
		}
		await this.Set(key, value);
  }
  /**
	 * Lists keys
   * @param prefix When provided, only returns keys containing prefix
	 */
	async list(prefix: string = ''): Promise<Array<string>> {
		return await this.ListPrefix(prefix);
  }

  async delete(key: string): Promise<boolean> {
    return await this.Delete(key);
  }

  /**
	 * Deletes all keys (and their values) with given `prefix`
   * @param prefix delete keys that start with this prefix
	 */
	async _deletePrefix(prefix: string): Promise<boolean> {
		let keys = await this.ListPrefix(prefix);
		let results = await Promise.allSettled(keys.map(k => this.Delete(k)));
		for (let result of results) {
			if (result.status !== 'fulfilled' || result.value===false) return false
		}
		return true;
  }
  /**
	 * Deletes all keys and values.
	 */
	async deleteEverything(): Promise<boolean> {
		return await this._deletePrefix('');
  }
  
  async deletePrefix(prefix: string) {
		if (!prefix) {
			throw new Error('`prefix` not provided. To delete all keys, explicitly use `.deleteEverything()`')
    }
    return await this._deletePrefix(prefix);
  }

}