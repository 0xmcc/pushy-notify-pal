import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from 'fs'
import express from 'express';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certs/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './certs/cert.pem')),
    },
    middleware: (app) => {
      console.log('🚀 Setting up middleware...');
      
      app.use(express.json());
      console.log('✅ JSON middleware added');
      
      app.use('/api/notifications', require('./src/api/notifications').default);
      console.log('✅ Notifications route registered at /api/notifications');
      
      // Add a test route to verify middleware is working
      app.get('/api/test', (req, res) => {
        res.json({ message: 'API is working' });
      });
      console.log('✅ Test route added at /api/test');
    },
  },
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use(express.json());
        server.middlewares.use('/api/notifications', require('./src/api/notifications').default);
      },
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
