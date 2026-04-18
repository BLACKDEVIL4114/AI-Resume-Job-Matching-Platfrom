import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, XCircle, Clock, Briefcase, Target, Zap, Calendar, AlertCircle, Globe, Loader2 } from 'lucide-react';

interface Application {
  id: number;
  job_title: string;
  company: string;
  portal: string;
  status: string;
  created_at: string;
  applied_at: string | null;
  error_message: string | null;
}

interface Props {
  resumeId: number;
}

export default function ApplicationDashboard({ resumeId }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard mounted with resumeId:', resumeId);
    fetchApplications();
  }, [resumeId]);

  const fetchApplications = async () => {
    if (!resumeId) {
      console.warn('No resumeId provided to dashboard');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching applications...');
      const res = await fetch(`/api/applications?resume_id=${resumeId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched applications:', data);
        setApplications(Array.isArray(data) ? data : []);
      } else {
        console.error('API responded with error:', res.status);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!resumeId) return null;



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'selected': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'interviewing': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'applied': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default: return <Clock className="w-5 h-5 text-white/40" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'interviewing': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'rejected': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'applied': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'failed': return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
      default: return 'bg-white/10 border-white/20 text-white/60';
    }
  };

  const stats = (applications || []).reduce((acc, app) => {
    acc.total++;
    const s = (app?.status || 'applied').toLowerCase();
    if (s === 'selected') acc.selected++;
    else if (s === 'rejected') acc.rejected++;
    else if (s === 'interviewing') acc.interviewing++;
    else if (s === 'applied') acc.applied++;
    return acc;
  }, { total: 0, selected: 0, rejected: 0, interviewing: 0, applied: 0 });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Application Command Center
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real-time tracking of your recruiter interactions and application statuses.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: Briefcase, color: 'from-slate-500 to-slate-700' },
            { label: 'Applied', value: stats.applied, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
            { label: 'Selected', value: stats.selected, icon: Zap, color: 'from-green-500 to-emerald-500' },
            { label: 'Interviews', value: stats.interviewing, icon: Calendar, color: 'from-blue-500 to-indigo-500' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-rose-600' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3 shadow-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black mb-0.5">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Live Tracking
              </h3>
              <div className="text-[10px] text-white/30 font-medium">REAL-TIME SYNC ACTIVE</div>
            </div>

            {loading ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-20 text-center">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-blue-500 mb-4" />
                <p className="text-white/40">Syncing with recruiters...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-20 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-white/40">No applications found in the sync stream.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-5">
                          <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{app.job_title}</h4>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-white/50">
                              <span className="font-semibold text-white/70">{app.company}</span>
                              <span className="text-white/20">•</span>
                              <div className="flex items-center gap-1.5 capitalize bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                <Globe className="w-3.5 h-3.5" />
                                {app.portal.replace('_', ' ')}
                              </div>
                              {app.applied_at && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                          <div className="text-[10px] text-white/30 font-bold">ID: APP-{(app.id % 9000).toString().padStart(4, '0')}</div>
                        </div>
                      </div>

                      {/* Recruiter Response Section */}
                      {(app.status === 'selected' || app.status === 'interviewing' || app.status === 'rejected') && (
                        <div className="mt-6 pt-5 border-t border-white/5">
                          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-[10px] font-bold text-white/40 tracking-wider">RECRUITER RESPONSE</span>
                            </div>
                            <p className="text-sm text-white/80 italic">
                              "{app.error_message || (
                                app.status === 'selected' ? "Your profile matches our requirements perfectly. Let's discuss the next steps!" :
                                app.status === 'interviewing' ? "Thank you for the initial talk. We'd like to schedule a technical deep-dive." :
                                "Thank you for your interest. After review, we've decided to move forward with other candidates."
                              )}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-yellow-400" />
                Live Feed
              </h3>
              <div className="space-y-4">
                {[
                  { time: 'Just now', msg: 'System verified matches for 4 new roles', type: 'info' },
                  { time: '2m ago', msg: 'Resume successfully parsed by internal engine', type: 'success' },
                  { time: '1h ago', msg: 'Application to GlobalTech was marked as Received', type: 'status' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="w-0.5 bg-white/10 rounded-full" />
                    <div>
                      <div className="text-white/30 mb-0.5">{item.time}</div>
                      <div className="text-white/70">{item.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Application Insights</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">
                    <span>Keyword Match Rate</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[88%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1.5 uppercase tracking-wider">
                    <span>Recruiter Engagement</span>
                    <span>High</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[75%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

