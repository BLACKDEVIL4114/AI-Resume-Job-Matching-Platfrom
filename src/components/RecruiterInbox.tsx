import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Briefcase, Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, X } from 'lucide-react';

interface Message {
  id: number;
  company: string;
  jobTitle: string;
  recruiterName: string;
  preview: string;
  fullMessage: string;
  date: string;
  status: 'Interview Request' | 'Interested' | 'Rejected' | 'Follow Up';
  isRead: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    company: 'TechFlow',
    jobTitle: 'Senior Frontend Engineer',
    recruiterName: 'Sarah Jenkins',
    preview: 'We loved your profile and would like to schedule a technical chat...',
    fullMessage: 'Hello! Your profile on JobApplyAI stands out to us. We loved your work on specialized tech projects. Would you be available for a 30-minute technical introduction call this Friday at 2 PM IST?',
    date: '2h ago',
    status: 'Interview Request',
    isRead: false
  },
  {
    id: 2,
    company: 'Innovate AI',
    jobTitle: 'React Developer',
    recruiterName: 'Michael Chen',
    preview: 'Thanks for applying. We are currently reviewing your portfolio...',
    fullMessage: 'Hi there, thank you for your application to Innovate AI. We are very impressed with your React portfolio. We are currently in the process of reviewing all candidates and will follow up by early next week.',
    date: '1 day ago',
    status: 'Interested',
    isRead: false
  },
  {
    id: 3,
    company: 'GlobalTech',
    jobTitle: 'Full Stack Engineer',
    recruiterName: 'Emma Wilson',
    preview: 'Thank you for your interest, but we have decided to...',
    fullMessage: 'Dear candidate, thank you for Applying to GlobalTech. At this time, we have decided to move forward with other candidates who more closely match our specific infrastructure requirements. We wish you the best in your search.',
    date: '3 days ago',
    status: 'Rejected',
    isRead: true
  }
];

interface Props {
  onUnreadCount: (count: number) => void;
}

export default function RecruiterInbox({ onUnreadCount }: Props) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const unread = messages.filter(m => !m.isRead).length;
    onUnreadCount(unread);
  }, [messages, onUnreadCount]);

  const toggleRead = (id: number) => {
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, isRead: true } : m
    ));
  };

  const getStatusBadge = (status: Message['status']) => {
    const styles = {
      'Interview Request': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Interested': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Rejected': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Follow Up': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${
            !message.isRead ? 'shadow-[L-4px_0_0_0_#3b82f6]' : ''
          } ${expandedId === message.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/8'}`}
        >
          {/* Unread Glow Border */}
          {!message.isRead && (
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          )}

          <div 
            className="p-6 cursor-pointer"
            onClick={() => {
              setExpandedId(expandedId === message.id ? null : message.id);
              if (!message.isRead) toggleRead(message.id);
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  !message.isRead ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg uppercase tracking-tight">{message.company}</h3>
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="text-sm font-medium text-white/70 mb-1">{message.jobTitle}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {message.recruiterName}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {message.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:text-right">
                <AnimatePresence mode="wait">
                  {expandedId !== message.id && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-white/50 italic max-w-md truncate"
                    >
                      "{message.preview}"
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === message.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-white/80 leading-relaxed mb-6 bg-slate-900/50 p-4 rounded-xl border border-white/5 italic">
                      "{message.fullMessage}"
                    </p>
                    <div className="flex items-center gap-3">
                      <a 
                        href={`mailto:recruiter@${message.company.toLowerCase().replace(' ', '')}.ai?subject=Regarding my application for ${message.jobTitle}`}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                      >
                        Reply via Email
                      </a>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(null);
                        }}
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
