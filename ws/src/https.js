import { createServer } from 'https';
import fs from 'fs';
import path from 'path';

export async function readCrtKeyFileSync(crt, key, attempts = 3) {
	let https = null;

	const delay = (t) => {
		return new Promise((resolve) => setTimeout(resolve, t));
	};

	while (!https && attempts > 0) {
		try {
			https = {
				cert: fs.readFileSync(crt),
				key: fs.readFileSync(key),
			};
		} catch (err) {
			await delay(5000);

			console.log(err);
		} finally {
			i--;
		}
	}

	return https;
}

// export default async (router) => {
// 	const path = process.env.WS_HTTPS_PATH ?? '/';

// 	const crt = process.env.WS_HTTPS_CRT ?? 'site.crt';
// 	const key = process.env.WS_HTTPS_KEY ?? 'site.key';

// 	const https = await readCrtKeyFileSync(path.resolve(path, crt), path.resolve(path, key));

// 	return createServer(https, router);
// };
