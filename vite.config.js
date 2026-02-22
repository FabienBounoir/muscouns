import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			// Active le SW en mode dev pour tester le comportement offline
			devOptions: { enabled: false },
			// Le manifest sera injecté automatiquement dans le <head>
			manifest: {
				name: 'Muscouns',
				short_name: 'Muscouns',
				description:
					'Crée tes entraînements de musculation et suis tes séries et charges depuis mobile.',
				theme_color: '#7c3aed',
				background_color: '#0f0f0f',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/',
				start_url: '/',
				lang: 'fr',
				categories: ['health', 'fitness', 'sports'],
				icons: [
					// Android
					{ src: '/icons/android/android-launchericon-48-48.png',   sizes: '48x48',   type: 'image/png' },
					{ src: '/icons/android/android-launchericon-72-72.png',   sizes: '72x72',   type: 'image/png' },
					{ src: '/icons/android/android-launchericon-96-96.png',   sizes: '96x96',   type: 'image/png' },
					{ src: '/icons/android/android-launchericon-144-144.png', sizes: '144x144', type: 'image/png' },
					{ src: '/icons/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
					{ src: '/icons/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
					// iOS / universel
					{ src: '/icons/ios/16.png',   sizes: '16x16',   type: 'image/png' },
					{ src: '/icons/ios/32.png',   sizes: '32x32',   type: 'image/png' },
					{ src: '/icons/ios/64.png',   sizes: '64x64',   type: 'image/png' },
					{ src: '/icons/ios/128.png',  sizes: '128x128', type: 'image/png' },
					{ src: '/icons/ios/256.png',  sizes: '256x256', type: 'image/png' },
					{ src: '/icons/ios/512.png',  sizes: '512x512', type: 'image/png' },
					{ src: '/icons/ios/1024.png', sizes: '1024x1024', type: 'image/png' }
				]
			},
			workbox: {
				// Fichiers précachés au build
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
				runtimeCaching: [
					{
						// API : network-first, fallback sur le cache (30 min)
						urlPattern: /^\/_api\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 30 // 30 minutes
							},
							networkTimeoutSeconds: 5
						}
					},
					{
						// Pages navigables : stale-while-revalidate
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'pages-cache'
						}
					},
					{
						// Polices & assets externes : cache-first
						urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
						handler: 'CacheFirst',
						options: {
							cacheName: 'fonts-cache',
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 an
							}
						}
					}
				]
			}
		})
	]
});
