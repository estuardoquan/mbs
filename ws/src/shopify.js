const SHOPIFY_PROFILE = 'https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json';

const SYSTEM_PROMPT = [
	'You are the WhatsApp assistant for LIVET (livetpro.com).',
	'Answer product and catalog questions using the shopify tools.',
	`On every shopify tool call, set arguments.meta.ucp-agent.profile to exactly: ${SHOPIFY_PROFILE}`,
	'Prices from the tools are in hundredths of GTQ (13000 = Q130.00).',
	"Reply briefly, in the customer's language, in plain text suitable for WhatsApp.",
].join('\n');

export async function ask_claude_shopify(messages) {
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
			max_tokens: 1024,
			system: SYSTEM_PROMPT,
			messages,
			mcp_servers: [{ type: 'url', url: 'https://livetpro.com/api/ucp/mcp', name: 'shopify' }],
			tools: [{ type: 'mcp_toolset', mcp_server_name: 'shopify' }],
		}),
	});

	const data = await res.json();

	if (!res.ok) throw new Error(`Claude ${res.status}: ${JSON.stringify(data.error)}`);

	return data.content.filter((b) => b.type === 'text').at(-1)?.text;
}
