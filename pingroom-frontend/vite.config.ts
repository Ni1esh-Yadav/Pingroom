import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [tailwindcss(),react()],
    server: {
        proxy: {
            '/auth': 'http://localhost:4000',
            '/signaling': {
                target: 'ws://localhost:4000',
                ws: true,
            },
        },
    },
});