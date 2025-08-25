import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [tailwindcss(),react()],
    server: {
        proxy: {
            '/auth': 'https://pingroom.onrender.com',
            '/signaling': {
                target: 'ws://localhost:4000',
                ws: true,
            },
        },
    },
});