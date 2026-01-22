import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_BASE_URL': JSON.stringify(env.GEMINI_BASE_URL),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.OPENAI_BASE_URL': JSON.stringify(env.OPENAI_BASE_URL),
        'process.env.DEEPSEEK_API_KEY': JSON.stringify(env.DEEPSEEK_API_KEY),
        'process.env.DEEPSEEK_BASE_URL': JSON.stringify(env.DEEPSEEK_BASE_URL),
        'process.env.QWEN_API_KEY': JSON.stringify(env.QWEN_API_KEY),
        'process.env.QWEN_BASE_URL': JSON.stringify(env.QWEN_BASE_URL),
        'process.env.DOUBAO_API_KEY': JSON.stringify(env.DOUBAO_API_KEY),
        'process.env.DOUBAO_BASE_URL': JSON.stringify(env.DOUBAO_BASE_URL),
        'process.env.GLM4_API_KEY': JSON.stringify(env.GLM4_API_KEY),
        'process.env.GLM4_BASE_URL': JSON.stringify(env.GLM4_BASE_URL),
        'process.env.K2_API_KEY': JSON.stringify(env.K2_API_KEY),
        'process.env.K2_BASE_URL': JSON.stringify(env.K2_BASE_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
