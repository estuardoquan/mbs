function to_claude(history) {
	const messages = [];

	for (const m of history) {
		if (m.type !== 'text') continue;

		const role = m.direction === 'in' ? 'user' : 'assistant';
		const last = messages.at(-1);

		if (last?.role === role) last.content += '\n' + m.text.body;
		else messages.push({ role, content: m.text.body });
	}

	while (messages[0]?.role === 'assistant') messages.shift();

	return messages;
}

async function send_msg(to, body) {
	const res = await fetch(`https://graph.facebook.com/v26.0/${process.env.WS_WA_ID}/messages`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${process.env.WS_WA_TOKEN}`,
		},
		body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body } }),
	});

	const data = await res.json();

	if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${JSON.stringify(data.error)}`);

	return data.messages[0].id;
}

export { to_claude, send_msg };
