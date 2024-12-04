import docs from './lib/docs';
import app from './routes';

// Add OpenAPI docs
docs(app);

export interface Env {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  UNSUBSCRIBE_TOKEN_SECRET: string;
  ARGON_SECRET: string;
}

// Handle Scheduled Tasks
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    console.log(`Cloudflare running with ${env.DATABASE_URL}`);
    // Default to main app routes
    return app.fetch(request);
  },
};
