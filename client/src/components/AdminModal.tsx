import React, { useState, useEffect } from 'react';
import type { LeadRecord } from '../types';
import { X, Download, RefreshCw, Key, Send, Database, Settings, Shield, Clock, FileText, MessageSquare } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'settings' | 'logs'>('leads');
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ service: string; result: any } | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leads') {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.leads) setLeads(data.leads);
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } else if (activeTab === 'logs') {
        const res = await fetch('/api/integration-logs');
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('Error saving settings.');
      }
    } catch {
      setSaveStatus('Network error.');
    }
  };

  const handleTestIntegration = async (service: 'crm' | 'email' | 'whatsapp' | 'mailchimp' | 'google_sheet') => {
    setTestingService(service);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service })
      });
      const data = await res.json();
      setTestResult({ service, result: data.result });
    } catch (err: any) {
      setTestResult({ service, result: { error: err.message } });
    } finally {
      setTestingService(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#071b13] border border-emerald-600/40 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-emerald-900/80 flex items-center justify-between bg-emerald-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-400/20 text-lime-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-emerald-100">
                LifeITUp Admin & Automation Hub
              </h2>
              <p className="text-xs text-emerald-400/70">
                Review captured leads, configure CRM / Email / WhatsApp, and audit integrations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-800/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-emerald-900/60 bg-emerald-950/30 gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'leads'
                ? 'border-lime-400 text-lime-300 font-semibold'
                : 'border-transparent text-emerald-400/70 hover:text-emerald-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Captured Leads ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-lime-400 text-lime-300 font-semibold'
                : 'border-transparent text-emerald-400/70 hover:text-emerald-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Integrations & Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-lime-400 text-lime-300 font-semibold'
                : 'border-transparent text-emerald-400/70 hover:text-emerald-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Delivery Logs</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LEADS */}
          {activeTab === 'leads' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-emerald-400/80">
                  {leads.length} assessment lead(s) recorded in SQLite
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadData}
                    className="p-2 rounded-lg bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 hover:text-white text-xs inline-flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <a
                    href="/api/leads/export"
                    download="lifeitup_leads.csv"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400 text-emerald-950 font-semibold text-xs hover:bg-lime-300 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-16 text-emerald-400/60 text-sm">
                  No assessment leads recorded yet. Complete an assessment to see records here.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-800/60 bg-emerald-950/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-emerald-900/60 text-emerald-300 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Mobile</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Zone</th>
                        <th className="p-3">State</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Google Sheet</th>
                        <th className="p-3">CRM / MC</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/40 text-emerald-200">
                      {leads.map((l) => (
                        <tr key={l.id} className="hover:bg-emerald-900/30">
                          <td className="p-3 font-mono text-emerald-400">{l.id}</td>
                          <td className="p-3 font-medium text-emerald-100">{l.full_name}</td>
                          <td className="p-3 font-mono">{l.email}</td>
                          <td className="p-3 font-mono">{l.mobile}</td>
                          <td className="p-3 font-bold text-lime-300">{l.score}/48</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-800/80 text-emerald-200">
                              {l.score_band_name}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 border border-emerald-700/60 text-emerald-200">
                              {l.state || 'Delhi'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              l.email_status === 'success' || l.email_status === 'mailchimp_sent' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-800 text-stone-400'
                            }`}>
                              {l.email_status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              l.sheet_status === 'success' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-800 text-stone-400'
                            }`}>
                              {l.sheet_status || 'pending'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              l.crm_status === 'mailchimp_synced' || l.crm_status === 'success' ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-800 text-stone-400'
                            }`}>
                              {l.crm_status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-emerald-400/60 whitespace-nowrap">
                            {new Date(l.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={`/api/leads/${l.id}/pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Download/View Official PDF Report"
                                className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white border border-emerald-700/50 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </a>
                              {(() => {
                                const cleanPhone = String(l.mobile || '').replace(/[^\d]/g, '');
                                const toPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
                                const pdfUrl = `${window.location.origin}/api/leads/${l.id}/pdf`;
                                const waMsg = encodeURIComponent(
                                  `🌿 *LifeITUp Wellbeing Assessment Report*\n\nHello *${l.full_name}*,\n\nThank you for participating in the *LifeITUp 2-Minute Holistic Wellbeing Check*.\n\n📊 *Your Holistic Wellbeing Score:* *${l.score} / 48*\n✨ *Status:* *${l.score_band_name}*\n\n📄 *Download Your Official 2-Page PDF Report:*\n${pdfUrl}\n\n_Empowering Your Holistic Success — LifeITUp_`
                                );
                                const waUrl = toPhone 
                                  ? `https://api.whatsapp.com/send?phone=${toPhone}&text=${waMsg}`
                                  : `https://api.whatsapp.com/send?text=${waMsg}`;
                                return (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Send Report from My WhatsApp"
                                    className="p-1.5 rounded-lg bg-[#25d366]/20 hover:bg-[#25d366]/40 text-[#25d366] hover:text-white border border-[#25d366]/50 transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTEGRATIONS & SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Mailchimp Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-900 flex items-center justify-center font-bold text-sm shadow-sm">
                      🐵
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-100 flex items-center gap-2">
                        <span>Mailchimp Automation & Audience Sync</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 font-medium">Connected</span>
                      </h3>
                      <p className="text-[11px] text-emerald-400/80">
                        Automatically syncs leads, Holistic Scores, & Wellness Zones into your LifeITUp Audience
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestIntegration('mailchimp')}
                    disabled={testingService === 'mailchimp'}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all disabled:opacity-50 cursor-pointer font-medium"
                  >
                    {testingService === 'mailchimp' ? 'Testing...' : 'Test Mailchimp Sync'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 mb-1">Mailchimp API Key</label>
                    <input
                      type="password"
                      value={settings.mailchimp_api_key || ''}
                      onChange={(e) => setSettings({ ...settings, mailchimp_api_key: e.target.value })}
                      placeholder="e.g. 2452d6bce...-us3"
                      className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-1">Audience / List ID</label>
                    <input
                      type="text"
                      value={settings.mailchimp_list_id || ''}
                      onChange={(e) => setSettings({ ...settings, mailchimp_list_id: e.target.value })}
                      placeholder="e.g. 0e7cd84597"
                      className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Google Sheets Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-emerald-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Google Sheets Real-Time Sync</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleTestIntegration('google_sheet')}
                    disabled={testingService === 'google_sheet'}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-200 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer font-medium"
                  >
                    {testingService === 'google_sheet' ? 'Testing...' : 'Test Sheet Sync'}
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 mb-1">Google Apps Script Webhook URL</label>
                    <input
                      type="url"
                      value={settings.google_sheet_url || ''}
                      onChange={(e) => setSettings({ ...settings, google_sheet_url: e.target.value })}
                      placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                      className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                    />
                    <p className="text-[11px] text-emerald-400/80 mt-1.5">
                      Columns automatically synced: <strong>Timestamp, Full Name, Mobile, Email, Score, Status, State (from IP)</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* CRM Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-emerald-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-lime-400" />
                    <span>CRM Integration (Make.com, Zapier, MailerLite, Interakt, HubSpot)</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleTestIntegration('crm')}
                    disabled={testingService === 'crm'}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-200 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {testingService === 'crm' ? 'Testing...' : 'Test CRM Webhook'}
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 mb-1">CRM Webhook Endpoint URL</label>
                    <input
                      type="url"
                      value={settings.crm_webhook_url || ''}
                      onChange={(e) => setSettings({ ...settings, crm_webhook_url: e.target.value })}
                      placeholder="https://hook.eu1.make.com/... or https://connect.mailerlite.com/..."
                      className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-1">CRM API Key / Bearer Token (Optional)</label>
                    <input
                      type="password"
                      value={settings.crm_api_key || ''}
                      onChange={(e) => setSettings({ ...settings, crm_api_key: e.target.value })}
                      placeholder="Bearer token if required"
                      className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Email Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-emerald-100 flex items-center gap-2">
                    <Send className="w-4 h-4 text-lime-400" />
                    <span>Email Delivery (SMTP / Transactional Email)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleTestIntegration('email')}
                    disabled={testingService === 'email'}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-200 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {testingService === 'email' ? 'Testing...' : 'Test Email SMTP'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtp_host || ''}
                      onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                      placeholder="smtp.resend.com or smtp.gmail.com"
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-1">SMTP Port</label>
                    <input
                      type="text"
                      value={settings.smtp_port || '587'}
                      onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                      placeholder="587 or 465"
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-1">SMTP User / API Username</label>
                    <input
                      type="text"
                      value={settings.smtp_user || ''}
                      onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-1">SMTP Password</label>
                    <input
                      type="password"
                      value={settings.smtp_pass || ''}
                      onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-emerald-300 mb-1">From Sender Address</label>
                    <input
                      type="text"
                      value={settings.smtp_from || 'ho@lifeitupworldwide.com'}
                      onChange={(e) => setSettings({ ...settings, smtp_from: e.target.value })}
                      placeholder="LifeITUp <ho@lifeitupworldwide.com>"
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-emerald-100 flex items-center gap-2">
                    <Key className="w-4 h-4 text-lime-400" />
                    <span>WhatsApp Personal Automation (UltraMsg QR Linked)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleTestIntegration('whatsapp')}
                    disabled={testingService === 'whatsapp'}
                    className="text-xs px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-200 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {testingService === 'whatsapp' ? 'Testing...' : 'Test WhatsApp'}
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#08281a] border border-[#d4af37]/40 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-lime-300 flex items-center gap-1.5">
                          <span>⚡ Local WhatsApp Direct Link (Zero 3rd-party setup)</span>
                        </div>
                        <p className="text-[11px] text-emerald-300/80 mt-0.5">
                          Scan QR code once from your normal WhatsApp app (Linked Devices). Whenever someone clicks "Send Me", report + PDF are sent directly from your number!
                        </p>
                      </div>
                      <a
                        href="/api/whatsapp/qr-page"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-lime-400 text-emerald-950 font-bold hover:bg-lime-300 text-xs whitespace-nowrap shadow-md cursor-pointer"
                      >
                        Open QR Scanner ➔
                      </a>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-900/30 border border-emerald-700/40 text-[11px] text-emerald-300">
                    💡 <strong>Alternative (UltraMsg Cloud):</strong> Paste your UltraMsg Instance ID &amp; Token below if using cloud server.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-emerald-300 mb-1">UltraMsg Instance ID</label>
                      <input
                        type="text"
                        value={settings.ultramsg_instance_id || ''}
                        onChange={(e) => setSettings({ ...settings, ultramsg_instance_id: e.target.value })}
                        placeholder="e.g. instance12345"
                        className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-300 mb-1">UltraMsg Token</label>
                      <input
                        type="password"
                        value={settings.ultramsg_token || ''}
                        onChange={(e) => setSettings({ ...settings, ultramsg_token: e.target.value })}
                        placeholder="e.g. abcd1234ef..."
                        className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100 font-mono"
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-800/40">
                    <label className="block text-emerald-300 mb-1">Or Generic Webhook / Interakt Endpoint URL</label>
                    <input
                      type="url"
                      value={settings.whatsapp_webhook_url || ''}
                      onChange={(e) => setSettings({ ...settings, whatsapp_webhook_url: e.target.value })}
                      placeholder="https://api.interakt.ai/v1/public/message/..."
                      className="w-full p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels Section */}
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/60">
                <h3 className="text-sm font-semibold text-emerald-100 mb-3">
                  Official Social Channels (Shown on Report Screen when filled)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-emerald-300 mb-1">Instagram Profile URL</label>
                    <input
                      type="url"
                      value={settings.social_instagram_url || ''}
                      onChange={(e) => setSettings({ ...settings, social_instagram_url: e.target.value })}
                      placeholder="https://instagram.com/lifeitup_official"
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-300 mb-1">WhatsApp Official Channel URL</label>
                    <input
                      type="url"
                      value={settings.social_whatsapp_url || ''}
                      onChange={(e) => setSettings({ ...settings, social_whatsapp_url: e.target.value })}
                      placeholder="https://whatsapp.com/channel/..."
                      className="w-full p-2 rounded-lg bg-emerald-900/40 border border-emerald-700/60 text-emerald-100"
                    />
                  </div>
                </div>
              </div>

              {/* Live Test Feedback Modal / Banner */}
              {testResult && (
                <div className="p-3.5 rounded-xl bg-emerald-900/60 border border-lime-400/50 text-xs">
                  <div className="font-semibold text-lime-300 mb-1 uppercase tracking-wide">
                    Test Result ({testResult.service}):
                  </div>
                  <pre className="font-mono text-[11px] text-emerald-100 overflow-x-auto p-2 bg-emerald-950/80 rounded">
                    {JSON.stringify(testResult.result, null, 2)}
                  </pre>
                </div>
              )}

              {/* Save Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-emerald-900/60">
                {saveStatus && (
                  <span className="text-xs font-medium text-lime-300">{saveStatus}</span>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-lime-400 text-emerald-950 font-bold text-xs sm:text-sm hover:bg-lime-300 transition-all shadow-md cursor-pointer"
                  >
                    Save All Settings
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: LOGS */}
          {activeTab === 'logs' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-emerald-400/80">
                  Last 50 integration events
                </span>
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-lg bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 hover:text-white text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-16 text-emerald-400/60 text-sm">
                  No delivery logs recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs flex flex-col gap-1 font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lime-300 font-bold uppercase">{log.service}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          log.status === 'success' ? 'bg-emerald-800 text-emerald-100' :
                          log.status === 'not_configured' ? 'bg-amber-900 text-amber-200' : 'bg-rose-900 text-rose-200'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[10px] text-emerald-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-emerald-400/80 text-[11px] truncate">
                        Payload: {log.request_payload}
                      </div>
                      <div className="text-emerald-300/60 text-[10px] truncate">
                        Response: {log.response_payload}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
