import '@/css/app.css';

import { createApp, reactive, type App, type Reactive } from 'vue';

import vue from '@/App.vue';
import { get_storage_item, set_storage_item } from './composables/storage';
import router from './router';

const app: App<Element> = createApp(vue);

const sock = new WebSocket(`wss://sock.balraug.com/app`);

console.log('[sock] connecting...');

sock.onopen = (e) => {
	console.log('[sock] connected.');
};

const load_conversations = () => {
	const stored = get_storage_item('conversations');
	if (!stored) {
		return new Map();
	}

	return new Map(stored);
};

const conversations: Reactive<Map<string, any>> = reactive(load_conversations());

sock.onmessage = (e) => {
	const data = JSON.parse(e.data);
	const message = JSON.parse(data.message);
	const { id, changes } = message.entry[0];

	conversations.set(id, changes[0].value);

	set_storage_item('conversations', [...conversations]);
};

app.provide('conversations', conversations);

app.directive('scroll', {
	mounted: function (el, binding): void {
		let f = function (e: any): void {
			if (binding.value(e, el)) {
				window.removeEventListener('scroll', f);
			}
		};
		window.addEventListener('scroll', f);
	},
});

app.use(router);

app.mount('#app');
