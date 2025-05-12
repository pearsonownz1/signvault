import { spawn } from 'child_process';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

console.log('Starting Vite development server...');

// Start API server
const apiServer = express();

// Add middleware
apiServer.use(express.json());
apiServer.use(express.urlencoded({ extended: true }));

// Add CORS middleware
apiServer.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Add environment variables to req
apiServer.use((req, res, next) => {
  req.env = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
  };
  next();
});

// Load API routes
const apiDir = path.join(__dirname, 'api');
import fs from 'fs';

// Function to dynamically load API routes
const loadApiRoutes = async () => {
  try {
    const files = fs.readdirSync(apiDir);
    
    for (const file of files) {
      if (file.endsWith('.js') && !file.includes('package.json')) {
        const filePath = path.join(apiDir, file);
        const routePath = `/${file.replace('.js', '')}`;
        
        console.log(`Loading API route: ${routePath} from ${filePath}`);
        
        try {
          const module = await import(filePath);
          const handler = module.default;
          
          if (typeof handler === 'function') {
            apiServer.all(`/api${routePath}`, (req, res) => {
              handler(req, res);
            });
            
            console.log(`Registered API route: /api${routePath}`);
          } else {
            console.error(`Invalid handler in ${file}. Expected a function.`);
          }
        } catch (err) {
          console.error(`Error loading API route ${file}:`, err);
        }
      }
    }
    
    // Handle subdirectories
    const subdirs = fs.readdirSync(apiDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const subdir of subdirs) {
      const subdirPath = path.join(apiDir, subdir);
      const files = fs.readdirSync(subdirPath);
      
      for (const file of files) {
        if (file.endsWith('.js')) {
          const filePath = path.join(subdirPath, file);
          const routePath = `/${subdir}/${file.replace('.js', '')}`;
          
          console.log(`Loading API route: ${routePath} from ${filePath}`);
          
          try {
            const module = await import(filePath);
            const handler = module.default;
            
            if (typeof handler === 'function') {
              apiServer.all(`/api${routePath}`, (req, res) => {
                handler(req, res);
              });
              
              console.log(`Registered API route: /api${routePath}`);
            } else {
              console.error(`Invalid handler in ${file}. Expected a function.`);
            }
          } catch (err) {
            console.error(`Error loading API route ${file}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error loading API routes:', err);
  }
};

// Load API routes
await loadApiRoutes();

// Start the API server
const PORT = 3000;
apiServer.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  viteProcess.kill();
  process.exit();
});
