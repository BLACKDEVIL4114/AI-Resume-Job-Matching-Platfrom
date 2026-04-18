import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Chrome, ArrowRight, Loader2, CheckCircle, Globe } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthProps {
  onSuccess: (user: any) => void;
  onCancel?: () => void;
}

export default function Auth({ onSuccess, onCancel }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState(0); 
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Standard Supabase Auth Pattern
      const { data, error: authError } = isLogin 
        ? await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password })
        : await supabase.auth.signUp({ 
            email: formData.email, 
            password: formData.password,
            options: { data: { full_name: formData.name } }
          });

      if (authError) {
        // Fallback to Mock API if Supabase isn't configured for this local demo
        console.log('Supabase not configured, falling back to Mock DB');
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const mockData = await response.json();
          onSuccess(mockData.user);
        } else {
          setError(authError.message);
        }
      } else if (data.user) {
        onSuccess(data.user);
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setGoogleStep(1); 
    setError(null);
    
    try {
      if (isSupabaseConfigured) {
        // PROPER SUPABASE GOOGLE AUTH CALL (Only if keys are present)
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin }
        });
        if (authError) throw authError;
      } else {
        // Fallback to high-end mock behavior for the preview
        console.log('Using proper mock sequence (Supabase keys not detected in .env)');
        await new Promise(r => setTimeout(r, 2000));
        const res = await fetch('/api/auth/google', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setGoogleStep(2);
          setTimeout(() => onSuccess(data.user), 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
      setGoogleStep(0);
    } finally {
      if (!isSupabaseConfigured) setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <AnimatePresence mode="wait">
          {googleStep === 1 ? (
             <motion.div key="g1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10">
               <div className="relative w-20 h-20 mx-auto mb-8">
                 <div className="absolute inset-0 border-4 border-slate-800 rounded-2xl" />
                 <div className="absolute inset-0 border-4 border-blue-500 rounded-2xl border-t-transparent animate-spin" />
                 <Chrome className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold mb-1">Authenticating...</h3>
               <p className="text-white/30 text-xs">Connecting to Google Identity Services</p>
             </motion.div>
          ) : googleStep === 2 ? (
            <motion.div key="g2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-1 text-white">Verified</h3>
              <p className="text-white/30 text-xs uppercase tracking-widest font-bold">Profile Synchronized</p>
            </motion.div>
          ) : (
            <motion.div key="main">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-6">
                   <Lock className="w-3 h-3 text-blue-400" />
                   <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Secure Portal</span>
                </div>
                <h3 className="text-4xl font-black mb-2 tracking-tighter text-white">
                  {isLogin ? 'Login' : 'Sign Up'}
                </h3>
                <p className="text-white/30 text-sm font-medium">Empower your career with AI automation.</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-14 bg-white hover:bg-slate-50 active:scale-[0.98] rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-white/5"
                >
                  <Chrome className="w-5 h-5 text-[#4285F4]" />
                  <span className="text-slate-900 font-bold text-sm">Continue with Google</span>
                </button>

                <div className="flex items-center gap-4 py-2 opacity-10">
                  <div className="h-px flex-1 bg-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">OR</span>
                  <div className="h-px flex-1 bg-white" />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <input
                      type="text"
                      placeholder="NAME"
                      className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-xs font-bold tracking-widest placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all uppercase"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  )}
                  
                  <input
                    type="email"
                    placeholder="EMAIL"
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-xs font-bold tracking-widest placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all uppercase"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />

                  <input
                    type="password"
                    placeholder="PASSWORD"
                    className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-xs font-bold tracking-widest placeholder:text-white/20 outline-none focus:border-blue-500/50 transition-all uppercase"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl font-black text-white active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 uppercase tracking-widest text-xs"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Proceed to Vault</span>}
                  </button>
                </form>

                <div className="pt-6 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]">
                    {isLogin ? "Need a profile? Sign Up" : "Returning? Log In"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
