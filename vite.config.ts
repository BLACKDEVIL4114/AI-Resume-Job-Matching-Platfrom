import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

// Modern Technical Keyword Library for ATS Scoring
const TECH_KEYWORDS = [
  'react', 'typescript', 'next.js', 'javascript', 'node', 'python', 'java', 'sql',
  'aws', 'azure', 'docker', 'kubernetes', 'ai', 'llm', 'tailwind', 'graphql',
  'frontend', 'backend', 'fullstack', 'ci/cd', 'agile', 'docker', 'terraform',
  'cloud', 'microservices', 'rest api', 'unit testing', 'playwright', 'jest'
];

// Mock DB in-memory for live demo session
const mockDb: any = {
  resumes: [],
  matches: [],
  applications: [],
  users: []
};

// Custom Mock API Plugin
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const path = url.pathname;

      if (path.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');

        // Immediate handlers for simple GET requests
        if (req.method === 'GET') {
          if (path === '/api/applications') {
            const resumeId = url.searchParams.get('resume_id');
            // Filter by resume or return all mock ones
            return res.end(JSON.stringify(mockDb.applications.length > 0 ? mockDb.applications : [
                 { id: 101, job_title: 'Senior Frontend Engineer', company: 'TechFlow', portal: 'adzuna', status: 'selected', applied_at: new Date(Date.now() - 86400000 * 2).toISOString(), error_message: 'Your profile matches our requirements perfectly. Let\'s discuss the next steps!' },
                 { id: 102, job_title: 'React Developer', company: 'Innovate AI', portal: 'remoteok', status: 'interviewing', applied_at: new Date(Date.now() - 86400000).toISOString(), error_message: 'We liked your project portfolio! Can you do a technical chat on Tuesday?' }
            ]));
          }
          if (path === '/api/job-matches') {
            return res.end(JSON.stringify(mockDb.matches.length > 0 ? mockDb.matches : [
                { id: 1, job_title: 'Senior Frontend Engineer', company: 'TechFlow', portal: 'adzuna', match_score: 94 },
                { id: 2, job_title: 'React Developer', company: 'Innovate AI', portal: 'remoteok', match_score: 88 }
            ]));
          }
        }

        // Body handlers for POST requests
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          let payload: any = {};
          try { if (body) payload = JSON.parse(body); } catch (e) {}

          // Auth Handlers
          if (path === '/api/auth/signup' && req.method === 'POST') {
            const newUser = { 
              id: 'user-' + Date.now(), 
              email: payload.email, 
              user_metadata: { full_name: payload.name || 'New User' },
              created_at: new Date().toISOString()
            };
            mockDb.users.push(newUser);
            console.log('User signed up and saved to mock DB:', newUser);
            return res.end(JSON.stringify({ user: newUser, session: { access_token: 'mock-token' } }));
          }

          if (path === '/api/auth/login' && req.method === 'POST') {
            const user = mockDb.users.find((u: any) => u.email === payload.email) || {
              id: 'user-default',
              email: payload.email,
              user_metadata: { full_name: 'Returning User' }
            };
            return res.end(JSON.stringify({ user, session: { access_token: 'mock-token' } }));
          }

          if (path === '/api/auth/google' && req.method === 'POST') {
             const googleUser = {
              id: 'google-' + Date.now(),
              email: 'google_user@gmail.com',
              user_metadata: { full_name: 'Google explorer', avatar_url: 'https://i.pravatar.cc/150?u=google' }
            };
            mockDb.users.push(googleUser);
            return res.end(JSON.stringify({ user: googleUser, session: { access_token: 'google-token' } }));
          }

          if (path === '/api/resumes' && req.method === 'POST') {
            const content = (payload.content || '').toLowerCase();
            const foundCount = TECH_KEYWORDS.filter(kw => content.includes(kw)).length;
            const score = Math.min(100, (foundCount * 8) + 40 + Math.floor(Math.random() * 10));
            
            const resume = { 
              id: Date.now(), 
              filename: payload.filename || 'resume.pdf', 
              content: payload.content || '', 
              ats_score: score, 
              created_at: new Date().toISOString() 
            };
            mockDb.resumes.push(resume);
            return res.end(JSON.stringify(resume));
          }

          if (path === '/api/ats-analyze' && req.method === 'POST') {
            const content = (payload.resume_content || '').toLowerCase();
            const found = TECH_KEYWORDS.filter(kw => content.includes(kw));
            const score = Math.min(100, (found.length * 7) + 45);
            
            return res.end(JSON.stringify({
              score: score,
              suggestions: [
                found.length < 5 ? 'Add more specialized tech keywords' : 'Quantify your achievements with numbers',
                'Your skill density is ' + (found.length > 8 ? 'Strong' : 'Moderate'),
                'Ensure ATS-friendly formatting in headers'
              ],
              keywords_found: found
            }));
          }

          if (path === '/api/fetch-real-jobs' && req.method === 'POST') {
             const mockJobs = [
              { id: 1, job_title: 'Senior Frontend Engineer', company: 'TechFlow', location: 'Remote', salary: '$140k - $180k', match_score: 94, portal: 'adzuna', job_url: '#' },
              { id: 2, job_title: 'React Developer', company: 'Innovate AI', location: 'San Francisco, CA', salary: '$120k - $160k', match_score: 88, portal: 'remoteok', job_url: '#' },
              { id: 3, job_title: 'Full Stack Ninja', company: 'Web3 Wizards', location: 'Remote', salary: '$150k - $200k', match_score: 91, portal: 'adzuna', job_url: '#' },
              { id: 4, job_title: 'Software Architect', company: 'Global Cloud', location: 'Berlin, DE', salary: '€90k - €120k', match_score: 85, portal: 'remoteok', job_url: '#' }
            ];
            mockDb.matches = mockJobs;
            return res.end(JSON.stringify({ jobs: mockJobs, count: 4 }));
          }

          if ((path === '/api/auto-apply' || path === '/api/auto-apply-real') && req.method === 'POST') {
            const ids = payload.job_match_ids || (payload.job_match_id ? [payload.job_match_id] : []);
            const results = ids.map((id: number) => {
              const job = mockDb.matches.find((j:any) => j.id === id);
              const rand = Math.random();
              const status = rand > 0.8 ? 'interviewing' : (rand > 0.6 ? 'selected' : 'applied');
              const feedback = status === 'selected' ? 'Your profile stands out! When can you chat?' : (status === 'interviewing' ? 'Technical assessment invitation sent.' : null);

              const app = {
                id: Date.now() + Math.random(),
                job_title: job?.job_title || 'Software Engineer',
                company: job?.company || 'Employer',
                portal: job?.portal || 'Web Portal',
                status: status,
                applied_at: new Date().toISOString(),
                error_message: feedback
              };
              mockDb.applications.push(app);
              return { success: true, application_id: app.id, job_match_id: id, message: feedback || 'Successfully applied!' };
            });
            return res.end(JSON.stringify({ success: true, results }));
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        });
        return;
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), tailwindcss(), mockApiPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
});
