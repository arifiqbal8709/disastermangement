import React, { useState } from 'react';
import { Shield, Lock, Mail, KeyRound, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@resilience.gov.in');
  const [password, setPassword] = useState('ResilienceAdmin#2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.login(email, password);
      if (res && res.data && res.data.token) {
        localStorage.setItem('resilience_admin_token', res.data.token);
        localStorage.setItem('resilience_admin_user', JSON.stringify(res.data.user));
        onLoginSuccess(res.data.user);
      } else {
        throw new Error('Authentication token missing from response');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F2F6FA] min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200 p-8 rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-[#061A2F] text-blue-500 rounded-xl flex items-center justify-center shadow-md">
            <Lock className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-navy-950 font-display">
            Administrator Gateway
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Single Administrator Access Portal | State Disaster Management Authority
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="admin@resilience.gov.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-blue-700">
              <Shield className="h-3.5 w-3.5" />
              System Authorization
            </div>
            <p className="text-slate-600">
              Public registration is disabled. Only the designated National Disaster Intelligence Officer can access the configuration repository.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#061A2F] hover:bg-navy-950 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              'Authenticate Administrator'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

