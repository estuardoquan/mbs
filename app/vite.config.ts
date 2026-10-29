import { defineConfig, type UserConfig } from 'vite';
// import smallstep from 'vite-plugin-smallstep';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(async (): Promise<UserConfig> => {
	return {
		server: {
			host: true,
			port: 5173,
			hmr: {
				host: process.env.VITECONFIG_HMR_HOST,
				clientPort: process.env.VITECONFIG_HMR_CLIENTPORT,
			},
		},
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './node_modules'),
				'@': path.resolve(__dirname, './src'),
			},
		},
		plugins: [
			vue(),
			tailwindcss(),
			// smallstep({
			//	steppath: process.env.VITECONFIG_STEPPATH,
			// }),
		],
	};
});


