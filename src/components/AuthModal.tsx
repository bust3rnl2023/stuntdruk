import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function AuthModal(props: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!props.isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      props.onLoginSuccess(result.user);
      props.onClose();
    } catch (err: any) {
      console.error("Google login failed:", err);
      setErrorMessage("Google inloggen is mislukt. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage("Vul alle verplichte velden in.");
      return;
    }

    if (activeTab === 'register') {
      if (!fullName) {
        setErrorMessage("Vul je volledige naam in.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Wachtwoorden komen niet overeen.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Wachtwoord moet minimaal 6 tekens bevatten.");
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Wachtwoord of e-mail is onjuist.");
        }

        // Create compatible user session
        const customUser = {
          ...data.user,
          isCustom: true,
          token: data.token,
          getIdToken: async () => data.token,
        };

        // Cache custom credentials in localStorage
        localStorage.setItem('stuntdruk_custom_user', JSON.stringify(customUser));
        
        props.onLoginSuccess(customUser);
        props.onClose();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registratie is mislukt.");
        }

        setSuccessMessage("Registratie succesvol! Je kunt nu direct inloggen.");
        setActiveTab('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Er is een fout opgetreden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-fade-in">
      <div id="auth-modal-content" className="relative w-full max-w-md rounded-2xl border border-slate-150 bg-white shadow-2xl p-6 sm:p-8 animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={props.onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1.5 hover:bg-slate-50 transition-colors"
          aria-label="Sluit loginvenster"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Welkom bij <span className="text-indigo-600">Stuntdruk.nl</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Meld u aan voor orderbeheer, facturen en snelle checkout.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-150 mb-6">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Inloggen
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 pb-3 text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Registreren
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mb-4 flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-rose-700 text-xs font-semibold animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 flex items-start space-x-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-emerald-700 text-xs font-semibold animate-fade-in">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Custom Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Volledige Naam</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Bv. Jan de Vries"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mailadres</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="naam@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Wachtwoord</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Wachtwoord Bevestigen</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Verwerken..." : activeTab === 'login' ? "Veilig Inloggen" : "Account Aanmaken"}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute inset-x-0 h-px bg-slate-150"></span>
          <span className="relative bg-white px-3 text-[10px] grid text-slate-400 uppercase tracking-wider font-extrabold">of log in met</span>
        </div>

        {/* Social Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 rounded-xl border-2 border-slate-200 bg-white py-2 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 transition-all cursor-pointer disabled:opacity-50"
        >
          {/* SVG Google Logo */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.727 1.49 6.71l3.776 3.055z"
            />
            <path
              fill="#4285F4"
              d="M24 12.273c0-.873-.073-1.727-.218-2.545H12v4.836h6.727a5.753 5.753 0 0 1-2.49 3.782l3.855 2.982C22.345 19.236 24 16.036 24 12.273z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.245 0 5.973-1.073 7.964-2.91l-3.855-2.982c-1.073.71-2.436 1.146-4.11 1.146-3.172 0-5.854-2.136-6.818-5.018l-3.773 3.055C3.309 21.218 7.318 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M1.49 6.71c-.328.982-.51 2.018-.51 3.09 0 1.074.182 2.11.51 3.091l3.773-3.054a7.043 7.043 0 0 1 0-3.09L1.49 6.709z"
            />
          </svg>
          <span>Google Account</span>
        </button>

      </div>
    </div>
  );
}
