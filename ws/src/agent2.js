const SYSTEM_PROMPT = [
	'You are the WhatsApp assistant for Grupo Recsa (recsacorp.com).',
	'Answer product and catalog questions using the wix tools.',
	'The customer is a site visitor. Only search for and describe products; do not create, change or book anything.',
	'Quote prices exactly as the tools return them, and say when a product is out of stock.',
	"Reply briefly, in the customer's language, in plain text suitable for WhatsApp.",
].join('\n');

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

async function ask_claude(messages) {
	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': process.env.WS_CLAUDE_KEY,
			'anthropic-version': '2023-06-01',
			'anthropic-beta': 'mcp-client-2025-11-20',
		},
		body: JSON.stringify({
			model: 'claude-haiku-5-5',
			max_tokens: 4096,
			system: SYSTEM_PROMPT,
			messages,
			mcp_servers: [{ type: 'url', url: 'https://recsacorp.com/_api/mcp', name: 'wix' }],
			tools: [{ type: 'mcp_toolset', mcp_server_name: 'wix' }],
		}),
	});

	const data = await res.json();

	if (!res.ok) throw new Error(`Claude ${res.status}: ${JSON.stringify(data.error)}`);

	console.log(JSON.stringify({
		stop_reason: data.stop_reason,
		usage: data.usage,
		content: data.content.map((b) =>
			b.type === 'mcp_tool_use' ? { type: b.type, name: b.name, input: b.input }
			: b.type === 'mcp_tool_result' ? { type: b.type, is_error: b.is_error, result: JSON.stringify(b.content).slice(0, 300) }
			: b.type === 'text' ? { type: b.type, text: b.text }
			: { type: b.type }),
	}, null, 2));

	return data.content.filter((b) => b.type === 'text').at(-1)?.text;
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

export { to_claude, ask_claude, send_msg };
