class ReplDBClient {
	url: string;
	constructor(dbUrl: string) {
		this.url = dbUrl;
	}
	/**
	 * Creates a ReplDBClient from the environment. (This works on a ReplDB enabled repl.)
	 */
	static createReplDBFromEnv() {
		let dbUrl = Deno.env.get('REPLIT_DB_URL');
		if (!dbUrl) {
			throw new Error('REPLIT_DB_URL is not defined!')
		}
		return new ReplDBClient(dbUrl);
	}

	/**
	 * Gets the value corresponding to `key`, or null.
	 */
	async Get (key: string) : Promise<string|null> {
		let res = await fetch(`${this.url}/${key}`);
		if (res.status === 404) {
			return null;
		}
		return await res.text();
	}

	/**
	 * Sets the value of `key` to `value`. Returns true on success.
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
	 * Returns a list of keys with the given `prefix`
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
		return contents.split('\n');
	}
	/**
	 * Lists all keys
	 */
	async ListAll(): Promise<Array<string>> {
		return await this.ListPrefix('');
	}
	/**
	 * Deletes given key (and its value)
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
	/**
	 * Deletes all keys (and their values) with given `prefix`
	 */
	async DeletePrefix(prefix: string): Promise<boolean> {

		if (!prefix) {
			throw new Error('`prefix` not provided. To delete all keys, explicitly use `.DeleteEverything()`')
		}

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
	async DeleteEverything(): Promise<boolean> {
		return await this.DeletePrefix('');
	}
}
