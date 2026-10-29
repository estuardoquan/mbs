/**
 * Might have to be replaced by session storage!
 **/

function get_storage_item(key: string): any {
	const storage_item: string | null = localStorage.getItem(key);

	if (!storage_item) return null;

	return JSON.parse(storage_item);
}

function set_storage_item(key: string, value: any): void {
	const item: string = JSON.stringify(value);

	localStorage.setItem(key, item);
}

function remove_storage_item(key: string): void {
	if (localStorage.hasOwnProperty(key)) {
		localStorage.removeItem(key);
	}
}

export { get_storage_item, set_storage_item, remove_storage_item };
