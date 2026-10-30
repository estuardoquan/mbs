import { WebSocketServer } from 'ws';
import { parse } from 'url';

import { readCrtKeyFileSync } from './https.js';
import express from 'express';

import { createServer as createHttp } from 'http';
import { createServer as createHttps } from 'https';
import { createClient } from 'redis';

const downloadImage = async (url, path) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const blob = await response.blob();
		const arrayBuffer = await blob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await fs.writeFile(path, buffer);
		console.log(`Image downloaded successfully to ${path}`);
	} catch (error) {
		console.error(`Error downloading image: ${error.message}`);
	}
};

async function initializeServer(router) {
	if (process.env.WS_HTTPS) {
		const __dir = process.env.WS_HTTPS_PATH ?? '/';
		const __crt = process.env.WS_HTTPS_CRT ?? 'site.crt';
		const __key = process.env.WS_HTTPS_KEY ?? 'site.key';

		const crt = path.resolve(__dir, __crt);
		const key = path.resolve(__dir, __key);

		const https = await readCrtKeyFileSync(crt, key);

		return createHttps(https, router);
	} else {
		return createHttp(router);
	}
}

function initializeRedis() {
	const host = process.env.WS_REDIS_HOST ?? '127.0.0.1';
	const port = process.env.WS_REDIS_PORT ?? 6379;

	const url = `redis://${host}:${port}`;

	return createClient({ url });
}

export default (async () => {
	console.time('> ws v1.0.0 ready in');

	const port = process.env.WS_PORT ?? 5000;

	const redis = initializeRedis();

	const subscribers = new Map();

	const redis_connect = async ([k, v], i) => {
		v.on('error', (err) => console.log(`redis client (${i}) [Err]`, err));
		await v.connect();
	};

	Object.entries({ redis }).forEach(redis_connect);

	subscribers.set('app', redis.duplicate());
	subscribers.set('terminal', redis.duplicate());

	subscribers.entries().forEach(redis_connect);

    await subscribers.get('terminal').subscribe('app:claude', async (message, channel) => {
        const h = (await redis.lRange(message, 0, -1)).map(JSON.parse);
	});

    await subscribers.get('terminal').subscribe('app:notifications', (message, channel) => {
		console.log(channel, message);

	});

	const wss = new WebSocketServer({ noServer: true });

	wss.on('connection', function connection(socket) {
		subscribers.get('app').subscribe('app:notifications', (message, channel) => {
			socket.send(JSON.stringify({ channel: channel, message: message }));
		});
	});

	const router = express();

	router.use(express.json());
    
    router.get('/', (req, res) => {
	    res.send('Hello from express server.');
    });
	
    router.get('/meta', (req, res) => {
        
		const {
			'hub.mode': mode,
			'hub.challenge': challenge,
			'hub.verify_token': token,
		} = req.query;

		if (mode === 'subscribe' && token === process.env.WS_VERIFY_TOKEN) {
			console.log('WEBHOOK VERIFIED');

			res.status(200).send(challenge);
		} else {
			res.status(403).end();
		}
	});

	router.post('/meta', async (req, res) => {
		const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
		
		const { object, entry } = req.body;
		const { id, changes } = entry[0];
		const { field, value } = changes[0];

		const { messaging_product, metadata, contacts} = value;
        
        if ("messages" in value) {
            for (const m of value.messages) {
                if (m.type === "text") {
                    const k = `conv:${m.from}`;
                    const e = JSON.stringify({
                        direction: "in",
                        ...m
                    }, null, 2);


                    await redis.rPush(k, e);
                    await redis.publish('app:claude', k);
		            await redis.publish('app:notifications', `${m.from}:${m.text.body}`);
                }
            }
            
        }

        if ("statuses" in value) {
		    const s = value.statuses[0];
		    await redis.publish('app:notifications', s.status);
        }
		


		res.status(200).end();
	});

	const server = await initializeServer(router);

	server.on('upgrade', function upgrade(request, socket, head) {
		const { pathname } = parse(request.url);

		if (pathname === '/app') {
			wss.handleUpgrade(request, socket, head, function done(websocket) {
				wss.emit('connection', websocket, request);
			});
		} else {
			socket.destroy();
		}
	});

	console.log('');
	console.timeEnd('> ws v1.0.0 ready in');
	console.log('');

	server.listen(port, () => {
		console.log(` ➜  Local:  https://localhost:${port}`);
		console.log(` ➜  Socket: ws://localhost:${port}`);
	});
})();
