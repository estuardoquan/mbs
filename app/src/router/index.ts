import {
	createRouter,
	createWebHistory,
	type Router,
	type RouteRecordRaw,
	type RouterHistory,
	type RouterOptions,
} from 'vue-router';

import { Home, Conversations, Callback } from '@/views';

const history: RouterHistory = createWebHistory();

const routes: RouteRecordRaw[] = [
	{
		path: '/auth/callback',
		name: 'callback',
		component: Callback,
	},
	{
		path: '/',
		component: Home,
		children: [
			{
				path: 'c/:id',
				component: Conversations,
			},
		],
	},
];

const router_options: RouterOptions = {
	history,
	routes,
};

const router: Router = createRouter(router_options);

export default router;
