import express from 'express';

const router = express();

router.use(express.json());

router.get('/', (req, res) => {
	res.send('Hello from express server.');
});

router.get('/meta', (req, res) => {
	const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

	if (mode === 'subscribe' && token === process.env.WS_VERIFY_TOKEN) {
		console.log('WEBHOOK VERIFIED');

		res.status(200).send(challenge);
	} else {
		res.status(403).end();
	}
});

router.post('/meta', (req, res) => {
	const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

	console.log(`\n\nWebhook received ${timestamp}\n`);
	console.log(JSON.stringify(req.body, null, 2));

	res.status(200).end();
});

export default router;
