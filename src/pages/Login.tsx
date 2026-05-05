import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, Shield, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email) {
      setErrorDetails('Por favor, insira seu e-mail para receber o link de redefinição de senha.');
      return;
    }
    setLoading(true);
    setErrorDetails(null);
    setSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Um link de redefinição de senha foi enviado para o seu e-mail.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setErrorDetails('Nenhum usuário encontrado com este e-mail.');
      } else {
        setErrorDetails('Erro ao enviar o link de redefinição. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetails(null);
    setSuccessMessage(null);
    
    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email || '',
              createdAt: Date.now()
            });
          }
        } catch(err) {
          console.error("Error setting user doc", err);
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        setErrorDetails("Login por E-mail/Senha não está habilitado. Ative no Firebase Console ou use o Google.");
      } else if (err.code === 'auth/invalid-credential') {
        setErrorDetails("A senha inserida não está correta ou a conta não existe.");
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorDetails("Este e-mail já está cadastrado. Vá para 'Fazer Login'.");
      } else {
        setErrorDetails(err.message || "Erro ao conectar.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorDetails(null);
    setSuccessMessage(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email || '',
              createdAt: Date.now()
            });
          }
        } catch(e: any) {
          console.error("Error saving user data", e);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorDetails("Janela fechada. Dica: Clique no ícone 'Open in a new tab' (quadrado com seta no topo direito) para abrir o app em outra janela.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorDetails(`Erro de Domínio: Adicione o domínio "${window.location.hostname}" no Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorDetails("Login do Google não ativado! Vá no Firebase Console.");
      } else {
        setErrorDetails(err.message || "Erro ao conectar com Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/PinDown.io__mariaemarenco8959_1777974949_np4j75.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-3xl rounded-3xl p-10 shadow-2xl relative z-10 text-center border border-white/30">
        <div className="w-24 h-24 bg-white/20 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20 backdrop-blur-xl shadow-inner shadow-white/30">
          <Shield size={48} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">U.S. Digital Wallet</h1>
        <p className="text-white/80 mb-6 text-base">Acesse seu Passaporte e Identidade Digital de forma segura.</p>

        {errorDetails && (
          <div className="bg-amber-500/30 text-amber-100 p-4 rounded-xl mb-6 text-sm flex gap-3 text-left border border-amber-500/40 backdrop-blur-xl shadow-lg">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <p>{errorDetails}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-500/30 text-emerald-100 p-4 rounded-xl mb-6 text-sm flex gap-3 text-left border border-emerald-500/40 backdrop-blur-xl shadow-lg">
            <Shield className="shrink-0 mt-0.5" size={20} />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
          <div className="text-left space-y-1">
            <label className="text-sm font-medium text-white/90 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-white/40 backdrop-blur-md disabled:opacity-50"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="text-left space-y-1">
            <label className="text-sm font-medium text-white/90 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={!loading}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-white/40 backdrop-blur-md disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
            {!isRegistering && (
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="text-sm text-white/80 hover:text-white font-medium drop-shadow-md"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600/80 hover:bg-blue-600 backdrop-blur-xl disabled:bg-blue-800/50 border border-blue-500/40 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-lg mt-4 cursor-pointer disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                {isRegistering ? 'Criar Conta' : 'Acessar Passaporte'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mb-4">
          <button 
            type="button" 
            disabled={loading}
            onClick={() => {setIsRegistering(!isRegistering); setErrorDetails(null);}} 
            className="text-sm text-white/80 font-medium hover:text-white drop-shadow-md disabled:opacity-50"
          >
            {isRegistering ? 'Já tenho uma conta. Fazer Login.' : 'Não tem conta? Cadastre-se com e-mail.'}
          </button>
        </div>

        <div className="relative flex items-center py-2 mb-4">
          <div className="flex-grow border-t border-white/20"></div>
          <span className="flex-shrink-0 mx-4 text-white/50 text-sm">ou</span>
          <div className="flex-grow border-t border-white/20"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-xl disabled:bg-white/10 border border-white/40 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 text-base cursor-pointer disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]"
        >
          {loading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Entrar com Google
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-white/20 text-sm text-white/70">
          É um administrador? <Link to="/ADM" className="text-white font-bold hover:text-white/90 drop-shadow-lg underline decoration-white/50 underline-offset-4">Portal ADM</Link>
        </div>
      </div>
    </div>
  );
}

