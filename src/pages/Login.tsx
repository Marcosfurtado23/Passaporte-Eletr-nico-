import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const navigate = useNavigate();
  const isIframe = window !== window.parent;

  const handleGoogleLogin = async () => {
    if (isIframe) {
      setErrorDetails("ATENÇÃO: O Login do Google não funciona dentro desta janela de visualização (iframe). Por favor, clique no ícone 'Open on new tab' (quadrado com seta no canto superior direito) para abrir o app em uma aba separada e tentar novamente.");
      return;
    }
    setLoading(true);
    setErrorDetails(null);
    
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
          // Don't block login if there's a minor fast-fail on firestore rules.
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorDetails("Janela fechada. Dica: Clique no ícone 'Open in a new tab' (quadrado com seta no topo direito) para abrir o app em outra janela.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorDetails(`Erro de Domínio: Adicione o domínio "${window.location.hostname}" no Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorDetails("Login do Google não ativado! Vá no Firebase Console > Authentication > Sign-in method > Adicionar novo provedor > Selecione 'Google', ative e salve.");
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
        <div className="w-24 h-24 bg-white/20 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 backdrop-blur-xl shadow-inner shadow-white/30">
          <Shield size={48} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">U.S. Digital Wallet</h1>
        <p className="text-white/80 mb-10 text-lg">Acesse seu Passaporte e Identidade Digital de forma segura.</p>

        {errorDetails && (
          <div className="bg-amber-500/30 text-amber-100 p-4 rounded-2xl mb-8 text-sm flex gap-3 text-left border border-amber-500/40 backdrop-blur-xl shadow-lg">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <p>{errorDetails}</p>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-xl disabled:bg-white/10 border border-white/40 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg cursor-pointer disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)]"
        >
          {loading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Entrar / Cadastrar com Google
            </>
          )}
        </button>

        <div className="mt-10 pt-6 border-t border-white/20 text-sm text-white/70">
          É um administrador? <a href="/admin" className="text-white font-bold hover:text-white/90 drop-shadow-lg underline decoration-white/50 underline-offset-4">Portal ADM</a>
        </div>
      </div>
    </div>
  );
}

