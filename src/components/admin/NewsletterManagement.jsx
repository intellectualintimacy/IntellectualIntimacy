import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Clock, UserX, Search, Download, Send, Loader2, 
  Mail, Eye, Trash2, CheckCircle, XCircle, Filter, Calendar,
  FileText, Image as ImageIcon, Link as LinkIcon, Bold, Italic,
  List, Sparkles, AlertCircle, ArrowRight, X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function NewsletterManagement() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showComposer, setShowComposer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  
  // Campaign form state
  const [campaignData, setCampaignData] = useState({
    subject: '',
    preheader: '',
    content: '',
    sender_name: 'Intellectual Intimacy',
    sender_email: 'hello@intellectualintimacy.com'
  });

  const templates = [
    { id: 'default', name: 'Default', description: 'Clean and minimal' },
    { id: 'event', name: 'Event Announcement', description: 'Perfect for event promotions' },
    { id: 'newsletter', name: 'Newsletter', description: 'Multi-section layout' }
  ];

  useEffect(() => {
    loadSubscribers();
    loadCampaigns();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Error loading subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      // You may want to create a campaigns table to track sent campaigns
      // For now, we'll keep it simple
      setCampaigns([]);
    } catch (err) {
      console.error('Error loading campaigns:', err);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignData.subject || !campaignData.content) {
      alert('Please fill in subject and content');
      return;
    }

    const confirmed = window.confirm(
      `Send campaign to ${activeCount} active subscribers?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setSending(true);
    
    try {
      // Get active subscribers
      const activeSubscribers = subscribers.filter(s => s.status === 'active');
      
      // In production, you'd want to use a proper email service like:
      // - Resend (recommended for modern apps)
      // - SendGrid
      // - Mailgun
      // - AWS SES
      
      // For now, we'll call a Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subscribers: activeSubscribers,
          campaign: {
            ...campaignData,
            template: selectedTemplate,
            sent_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      // Log campaign
      await supabase.from('newsletter_campaigns').insert({
        subject: campaignData.subject,
        content: campaignData.content,
        template: selectedTemplate,
        recipients_count: activeSubscribers.length,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      setSendSuccess(true);
      
      setTimeout(() => {
        setShowComposer(false);
        setSendSuccess(false);
        setCampaignData({
          subject: '',
          preheader: '',
          content: '',
          sender_name: 'Intellectual Intimacy',
          sender_email: 'hello@intellectualintimacy.com'
        });
      }, 2000);

    } catch (err) {
      console.error('Error sending campaign:', err);
      alert('Failed to send campaign. Please try again or check your email service configuration.');
    } finally {
      setSending(false);
    }
  };

  const handleExport = () => {
    const filtered = filteredSubscribers;

    const csv = [
      ['Email', 'Name', 'Status', 'Subscribed Date', 'Confirmed Date'].join(','),
      ...filtered.map(s => [
        s.email,
        s.name || '',
        s.status,
        new Date(s.subscribed_at).toLocaleDateString(),
        s.confirmed_at ? new Date(s.confirmed_at).toLocaleDateString() : 'Not confirmed'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadSubscribers();
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      alert('Failed to delete subscriber');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          status: newStatus,
          confirmed_at: newStatus === 'active' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      loadSubscribers();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const pendingCount = subscribers.filter(s => s.status === 'pending').length;
  const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.6; color: #292524; background: #fafaf9; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e7e5e4; }
            .header { background: linear-gradient(135deg, #292524 0%, #44403c 100%); color: white; padding: 40px; text-align: center; }
            .logo { font-size: 24px; font-weight: 300; letter-spacing: 1px; }
            .content { padding: 40px; }
            .content h1 { font-size: 32px; font-weight: 300; color: #d97706; margin: 0 0 20px; }
            .content p { margin: 0 0 16px; color: #57534e; }
            .footer { background: #fafaf9; padding: 30px; text-align: center; font-size: 14px; color: #78716c; border-top: 1px solid #e7e5e4; }
            .button { display: inline-block; padding: 14px 32px; background: #292524; color: white; text-decoration: none; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✨ ${campaignData.sender_name}</div>
            </div>
            <div class="content">
              <h1>${campaignData.subject}</h1>
              ${campaignData.content.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Intellectual Intimacy. All rights reserved.</p>
              <p style="margin-top: 10px;"><a href="#" style="color: #d97706;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-light mb-2 text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Newsletter <span className="elegant-text">Management</span>
          </h2>
          <p className="text-stone-600 dark:text-stone-400 font-light">
            Manage subscribers and send campaigns
          </p>
        </div>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors inline-flex items-center gap-2 font-light"
        >
          <Send className="w-5 h-5" strokeWidth={1.5} /> 
          Compose Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="feature-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-elegant">
              <Mail className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-light elegant-text" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {subscribers.length}
            </span>
          </div>
          <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Total Subscribers</div>
        </div>

        <div className="feature-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-elegant bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400">
              <UserCheck className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-light text-green-700 dark:text-green-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {activeCount}
            </span>
          </div>
          <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Active</div>
        </div>

        <div className="feature-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-elegant bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400">
              <Clock className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-light text-yellow-700 dark:text-yellow-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {pendingCount}
            </span>
          </div>
          <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Pending</div>
        </div>

        <div className="feature-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="icon-elegant bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400">
              <UserX className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <span className="text-3xl font-light text-red-700 dark:text-red-400" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {unsubscribedCount}
            </span>
          </div>
          <div className="text-sm text-stone-600 dark:text-stone-400 font-light">Unsubscribed</div>
        </div>
      </div>

      {/* Campaign Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="feature-card p-8 mb-8"
          >
            {sendSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-light text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Campaign <span className="elegant-text">Sent</span>
                </h3>
                <p className="text-stone-600 dark:text-stone-300 font-light">
                  Your newsletter has been sent to {activeCount} active subscribers.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-light text-stone-900 dark:text-stone-50" style={{ fontFamily: 'Crimson Pro, serif' }}>
                      New <span className="elegant-text">Campaign</span>
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 font-light mt-1">
                      Create and send to {activeCount} active subscribers
                    </p>
                  </div>
                  <button
                    onClick={() => setShowComposer(false)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="elegant-divider mb-8"></div>

                <form className="space-y-6">
                  {/* Template Selection */}
                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Email Template
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 border transition-colors text-left ${
                            selectedTemplate === template.id
                              ? 'border-amber-700 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500'
                          }`}
                        >
                          <div className="font-light text-stone-900 dark:text-stone-100 mb-1">
                            {template.name}
                          </div>
                          <div className="text-xs text-stone-600 dark:text-stone-400">
                            {template.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sender Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Sender Name
                      </label>
                      <input
                        type="text"
                        value={campaignData.sender_name}
                        onChange={(e) => setCampaignData({...campaignData, sender_name: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                        placeholder="Your name or organization"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                        Sender Email
                      </label>
                      <input
                        type="email"
                        value={campaignData.sender_email}
                        onChange={(e) => setCampaignData({...campaignData, sender_email: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                        placeholder="hello@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Subject Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignData.subject}
                      onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      placeholder="Your compelling subject line"
                    />
                  </div>

                  {/* Preheader */}
                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Preheader Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={campaignData.preheader}
                      onChange={(e) => setCampaignData({...campaignData, preheader: e.target.value})}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
                      placeholder="Preview text that appears after the subject"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm mb-3 text-stone-700 dark:text-stone-300 font-light">
                      Email Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={12}
                      value={campaignData.content}
                      onChange={(e) => setCampaignData({...campaignData, content: e.target.value})}
                      className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light resize-none"
                      placeholder="Write your newsletter content here...&#10;&#10;You can use plain text or basic formatting.&#10;Each paragraph will be automatically formatted in the final email."
                    />
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-light">
                      Tip: Keep paragraphs short and use line breaks for better readability
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-sm text-blue-900 dark:text-blue-300 font-light">
                      <strong className="font-medium">Email Service Configuration:</strong> Make sure you've set up a Supabase Edge Function called 'send-newsletter' with your email service provider (Resend, SendGrid, etc.) to actually send emails.
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light inline-flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                      Preview
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowComposer(false)}
                        className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors font-light"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSendCampaign}
                        disabled={sending || !campaignData.subject || !campaignData.content}
                        className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors font-light inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" strokeWidth={1.5} />
                            Send to {activeCount} subscribers
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <h3 className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Email <span className="elegant-text">Preview</span>
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-stone-50 dark:bg-stone-950">
                <iframe
                  srcDoc={getPreviewHTML()}
                  className="w-full h-full border-0"
                  style={{ minHeight: '600px' }}
                  title="Email Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search subscribers by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-none focus:outline-none focus:border-amber-700 dark:focus:border-amber-500 transition-colors font-light"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <button
          onClick={handleExport}
          className="px-6 py-3 border border-stone-300 dark:border-stone-600 hover:border-stone-900 dark:hover:border-stone-300 transition-colors inline-flex items-center justify-center gap-2 font-light whitespace-nowrap"
        >
          <Download className="w-5 h-5" strokeWidth={1.5} /> Export CSV
        </button>
      </div>

      {/* Subscribers Table */}
      <div className="feature-card overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-stone-500 dark:text-stone-400 font-light">
              {searchQuery || statusFilter !== 'all' 
                ? 'No subscribers match your filters' 
                : 'No subscribers yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Subscribed</th>
                  <th className="px-6 py-4 text-left text-sm font-light text-stone-700 dark:text-stone-300">Confirmed</th>
                  <th className="px-6 py-4 text-right text-sm font-light text-stone-700 dark:text-stone-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                {filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors">
                    <td className="px-6 py-4 font-light text-stone-900 dark:text-stone-100">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400 font-light">
                      {sub.name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={sub.status}
                        onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                        className={`px-3 py-1 text-xs font-light border-0 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all ${
                          sub.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : sub.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="unsubscribed">Unsubscribed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400 font-light">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 dark:text-stone-400 font-light">
                      {sub.confirmed_at 
                        ? new Date(sub.confirmed_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors inline-flex items-center justify-center"
                        title="Delete subscriber"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredSubscribers.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-stone-600 dark:text-stone-400 font-light">
            Showing {filteredSubscribers.length} of {subscribers.length} subscribers
          </p>
        </div>
      )}
    </motion.div>
  );
}