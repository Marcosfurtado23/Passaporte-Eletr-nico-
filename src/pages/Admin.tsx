import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Search, LayoutDashboard, LogOut, ArrowRight, ArrowLeft, Activity, MapPin, ScanFace, Building2, Fingerprint, Lock, Mail, AlertTriangle, Plane, Plus, BookKey, Edit2, Trash2, Shield, Loader2, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, setDoc, addDoc, deleteDoc, where, getDocs, getDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Admin() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if(user) {
        // Check if user is official admin by email
        if (user.email?.toLowerCase() === 'marcossilva192024@gmail.com') {
          setIsAdminLoggedIn(true);
        } else {
          setIsAdminLoggedIn(false);
          await auth.signOut(); // Force sign out if not admin
        }
      } else {
        setIsAdminLoggedIn(false);
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <Loader2 size={48} className="animate-spin text-blue-500" />
    </div>
  );
  if (!isAdminLoggedIn) return <AdminLogin />;
  return <AdminDashboard />;
}

function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail !== 'marcossilva192024@gmail.com') {
      setErrorDetails("Acesso Negado: E-mail não autorizado.");
      return;
    }

    setLoading(true);
    setErrorDetails(null);
    try {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          // If the user doesn't exist yet, automatically create
          await createUserWithEmailAndPassword(auth, cleanEmail, password);
        } else {
          throw err;
        }
      }
    } catch(err: any) {
      if (err.code === 'auth/operation-not-allowed') {
         setErrorDetails("Login de E-mail/Senha não está ativado! Ative 'Email/Password' no Firebase Authentication para usar este método.");
      } else {
         setErrorDetails(`Erro: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

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

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-3xl rounded-3xl p-10 shadow-2xl relative z-10 text-center border border-white/30">
        <button 
          onClick={() => navigate('/login')} 
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white backdrop-blur-md"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 backdrop-blur-xl shadow-inner shadow-blue-500/20">
          <Shield size={40} />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-white tracking-tight">Portal ADM</h1>
        
        {errorDetails && (
          <div className="bg-amber-500/30 text-amber-100 p-4 rounded-xl mb-6 text-sm flex gap-3 text-left border border-amber-500/40 backdrop-blur-md">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <p>{errorDetails}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="text-left space-y-1">
            <label className="text-sm font-medium text-white/90 ml-1">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-white/40 backdrop-blur-md disabled:opacity-50"
                placeholder="admin@email.com"
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
                disabled={loading}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-white/40 backdrop-blur-md disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-blue-600/80 hover:bg-blue-600 backdrop-blur-xl disabled:bg-blue-800/50 border border-blue-500/40 text-white font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-lg cursor-pointer disabled:cursor-not-allowed shadow-[0_8px_32px_rgba(0,0,0,0.3)] mt-4"
          >
            {loading ? (
               <><Loader2 size={24} className="animate-spin" /> Verificando...</> 
            ) : (
               <>Acessar Painel</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'flights' | 'passports' | 'manage'>('users');
  const [verifications, setVerifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [passports, setPassports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    const unsubVerifs = onSnapshot(collection(db, 'verifications'), (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a: any, b: any) => b.createdAt - a.createdAt);
      setVerifications(data);
    });

    const unsubTickets = onSnapshot(collection(db, 'tickets'), (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a: any, b: any) => b.createdAt - a.createdAt);
      setTickets(data);
    });

    const unsubPassports = onSnapshot(collection(db, 'passports'), (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a: any, b: any) => b.createdAt - a.createdAt);
      setPassports(data);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
      setUsers(data);
    });

    return () => { unsubVerifs(); unsubTickets(); unsubPassports(); unsubUsers(); };
  }, []);

  const updateVerificationStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'verifications', id), { 
        status, 
        updatedAt: Date.now() 
      });
    } catch(err) {
      alert("Erro ao atualizar status.");
    }
  }

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tickets', id), { status });
    } catch(err) {
      alert("Erro ao atualizar status do vôo.");
    }
  }

  const handleDeleteUserAndData = async (userId: string) => {
    if (!confirm("Tem certeza que deseja excluir todos os dados deste usuário? Isso excluirá vôos, passaportes, verificações e o registro do Firestore deste usuário.")) {
      return;
    }
    try {
      // Find all related data and delete it
      const verifq = query(collection(db, 'verifications'), where('userId', '==', userId));
      const verifSnaps = await getDocs(verifq);
      const deleteVerifPromises = verifSnaps.docs.map(docSnap => deleteDoc(doc(db, 'verifications', docSnap.id)));
      
      const ticketsq = query(collection(db, 'tickets'), where('userId', '==', userId));
      const ticketSnaps = await getDocs(ticketsq);
      const deleteTicketsPromises = ticketSnaps.docs.map(docSnap => deleteDoc(doc(db, 'tickets', docSnap.id)));
      
      const passportsq = query(collection(db, 'passports'), where('userId', '==', userId));
      const passportSnaps = await getDocs(passportsq);
      const deletePassportsPromises = passportSnaps.docs.map(docSnap => deleteDoc(doc(db, 'passports', docSnap.id)));
      
      await Promise.all([
        ...deleteVerifPromises,
        ...deleteTicketsPromises,
        ...deletePassportsPromises,
        deleteDoc(doc(db, 'users', userId))
      ]);

      alert('Dados do usuário e registros associados foram excluídos com sucesso do banco de dados.');
    } catch(err) {
      console.error(err);
      alert('Houve um erro ao excluir dados do banco.');
    }
  };

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-[#111113] flex flex-col p-4 border-r border-white/10 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => navigate('/login')} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white shrink-0"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg text-blue-500 truncate">U.S. Border Control</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <ScanFace size={18} /> Verificações Faciais
          </button>
          <button onClick={() => setActiveTab('flights')} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'flights' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Plane size={18} /> Voos
          </button>
          <button onClick={() => setActiveTab('passports')} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'passports' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <BookKey size={18} /> Passaportes
          </button>
          <button onClick={() => setActiveTab('manage')} className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'manage' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Users size={18} /> Gerenciar Usuários
          </button>
        </nav>
        <button onClick={() => { auth.signOut(); navigate('/login'); }} className="mt-auto flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors"><LogOut size={20}/> Sair</button>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {activeTab === 'users' && (
          <>
            <h2 className="text-2xl font-bold mb-8 text-white">Verificações Faciais</h2>
            <div className="space-y-6">
              {verifications.length === 0 ? (
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-10 text-center text-slate-400">
                  Nenhuma submissão recente.
                </div>
              ) : (
                verifications.map((demoData) => {
                  const userEmail = users.find(u => u.id === demoData.userId)?.email || 'Email desconhecido';
                  
                  return (
                    <div key={demoData.id} className="bg-[#111113] rounded-2xl border border-white/10 p-6 shadow-sm overflow-hidden relative">
                      {demoData.status === 'approved' && <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-500/20">Aprovado</div>}
                      {demoData.status === 'rejected' && <div className="absolute top-4 right-4 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-red-500/20">Rejeitado</div>}
                      {demoData.status === 'pending' && <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-500/20">Aguardando Avaliação</div>}

                      <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4 text-slate-200">Verificação de Indivíduo</h3>
                      <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-slate-700 shrink-0 bg-[#0a0a0c] relative">
                          <img src={demoData.photo} className="w-full h-full object-cover transform -scale-x-100" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">E-mail do Usuário</p>
                              <p className="font-mono text-sm mt-1 bg-[#0a0a0c] text-white px-3 py-2 rounded-lg border border-white/5">{userEmail}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Data do Envio</p>
                              <p className="text-sm font-medium mt-1 text-slate-200 bg-[#0a0a0c] px-3 py-2 rounded-lg border border-white/5">{new Date(demoData.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Localização GPS Constatada</p>
                            <div className="bg-blue-900/10 p-4 rounded-xl mt-2 font-mono text-sm border border-blue-900/30 flex items-center gap-3">
                              <MapPin className="text-blue-500" />
                              <div className="text-slate-300">
                                <span className="block text-blue-200">LAT: {demoData.location.lat}</span>
                                <span className="block text-blue-200">LNG: {demoData.location.lng}</span>
                              </div>
                            </div>
                          </div>
                          
                          {demoData.status === 'pending' && (
                            <div className="mt-6 flex gap-4 border-t border-white/10 pt-4">
                              <button onClick={() => updateVerificationStatus(demoData.id, 'rejected')} className="bg-red-500/10 text-red-400 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center flex-1 gap-2 border border-red-500/20 hover:bg-red-500/20 transition-colors shadow-sm"><XCircle size={18}/> Negar Entrada</button>
                              <button onClick={() => updateVerificationStatus(demoData.id, 'approved')} className="bg-emerald-500/10 text-emerald-400 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center flex-1 gap-2 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors shadow-sm"><CheckCircle size={18}/> Aprovar Entrada</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'flights' && (
          <FlightsManager users={users} tickets={tickets} onUpdateStatus={updateTicketStatus} />
        )}

        {activeTab === 'passports' && (
          <PassportsManager users={users} passports={passports} />
        )}

        {activeTab === 'manage' && (
          <UserManager users={users} onDelete={handleDeleteUserAndData} />
        )}
      </div>
    </div>
  );
}

function FlightsManager({ users, tickets, onUpdateStatus }: { users: any[], tickets: any[], onUpdateStatus: (id: string, status: string) => void }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Gerenciador de Voos</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} /> Adicionar Voo
        </button>
      </div>

      {showAdd && <AddFlightForm users={users} onComplete={() => setShowAdd(false)} />}

      <div className="space-y-4">
         {tickets.length === 0 ? (
           <div className="bg-[#111113] border border-white/10 rounded-2xl p-10 text-center text-slate-400">
             Nenhum voo cadastrado.
           </div>
         ) : (
           tickets.map(ticket => {
             const userEmail = users.find(u => u.id === ticket.userId)?.email || 'Desconhecido';
             return (
               <div key={ticket.id} className="bg-[#111113] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{userEmail}</span>
                     {ticket.status === 'confirmed' && <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold uppercase border border-emerald-500/20">Confirmado</span>}
                     {ticket.status === 'pending' && <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded font-bold uppercase border border-amber-500/20">Pendente</span>}
                     {ticket.status === 'cancelled' && <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded font-bold uppercase border border-red-500/20">Cancelado</span>}
                   </div>
                   <div className="flex items-center gap-3">
                     <h4 className="text-xl font-bold">{ticket.originCode}</h4>
                     <Plane size={16} className="text-slate-500 transform rotate-45" />
                     <h4 className="text-xl font-bold">{ticket.destinationCode}</h4>
                   </div>
                   <p className="text-sm text-slate-400 mt-1">{new Date(ticket.departureTime).toLocaleString()} • Voo {ticket.flightNumber}</p>
                 </div>
                 
                 <div className="flex gap-2">
                    <button onClick={() => onUpdateStatus(ticket.id, 'confirmed')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${ticket.status === 'confirmed' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/50' : 'bg-[#0a0a0c] border-white/10 text-slate-400 hover:text-white'}`}>Confirmado</button>
                    <button onClick={() => onUpdateStatus(ticket.id, 'pending')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${ticket.status === 'pending' ? 'bg-amber-500/20 border-amber-500 text-amber-400 ring-2 ring-amber-500/50' : 'bg-[#0a0a0c] border-white/10 text-slate-400 hover:text-white'}`}>Pendente</button>
                    <button onClick={() => onUpdateStatus(ticket.id, 'cancelled')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${ticket.status === 'cancelled' ? 'bg-red-500/20 border-red-500 text-red-400 ring-2 ring-red-500/50' : 'bg-[#0a0a0c] border-white/10 text-slate-400 hover:text-white'}`}>Cancelado</button>
                 </div>
               </div>
             )
           })
         )}
      </div>
    </div>
  )
}

function AddFlightForm({ users, onComplete }: { users: any[], onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    originCity: 'São Paulo',
    originCode: 'GRU',
    destinationCity: 'Lisboa',
    destinationCode: 'LIS',
    departureTime: '',
    flightNumber: 'LA8076',
    duration: '9h 20m',
    seat: '12A',
    image: 'https://images.unsplash.com/photo-1558582823-7fa364cd05ce?w=400&q=80',
    status: 'confirmed'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.departureTime) return alert("Preencha todos os campos.");
    setLoading(true);
    
    try {
      const ts = new Date(formData.departureTime).getTime();
      await addDoc(collection(db, 'tickets'), {
        ...formData,
        departureTime: ts,
        createdAt: Date.now()
      });
      onComplete();
    } catch(err) {
      console.error(err);
      alert("Erro ao criar voo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111113] border border-white/10 rounded-2xl p-6 mb-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2 text-lg font-bold border-b border-white/10 pb-2 mb-2">Adicionar Nova Passagem (Marcar Voo)</div>
      
      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase font-bold">Usuário (E-mail)</label>
        <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500">
          <option value="">Selecione um usuário...</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase font-bold">Data/Hora (Partida)</label>
        <input required type="datetime-local" value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 [color-scheme:dark]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Origem (Sigla)</label>
          <input required type="text" value={formData.originCode} onChange={e => setFormData({...formData, originCode: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 uppercase" placeholder="GRU" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Origem (Cidade)</label>
          <input required type="text" value={formData.originCity} onChange={e => setFormData({...formData, originCity: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="São Paulo" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Destino (Sigla)</label>
          <input required type="text" value={formData.destinationCode} onChange={e => setFormData({...formData, destinationCode: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 uppercase" placeholder="LIS" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Destino (Cidade)</label>
          <input required type="text" value={formData.destinationCity} onChange={e => setFormData({...formData, destinationCity: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="Lisboa" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:col-span-2">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Voo (Nº)</label>
          <input required type="text" value={formData.flightNumber} onChange={e => setFormData({...formData, flightNumber: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Duração</label>
          <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-slate-400 uppercase font-bold">Assento</label>
          <input required type="text" value={formData.seat} onChange={e => setFormData({...formData, seat: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500 uppercase" />
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-white/10 pt-6">
        <button type="button" onClick={onComplete} className="px-6 py-3 rounded-xl font-bold bg-[#0a0a0c] text-slate-300 hover:text-white transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
          {loading ? 'Salvando...' : 'Adicionar Voo e Salvar'}
        </button>
      </div>
    </form>
  )
}

function PassportsManager({ users, passports }: { users: any[], passports: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingPassport, setEditingPassport] = useState<any>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este passaporte?')) {
      try {
        await deleteDoc(doc(db, 'passports', id));
      } catch(err) {
        alert('Erro ao excluir: ' + err);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Gerenciador de Passaportes</h2>
        <button onClick={() => { setEditingPassport(null); setShowForm(!showForm); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} /> Adicionar Passaporte
        </button>
      </div>

      {showForm && <PassportForm users={users} initialData={editingPassport} onComplete={() => setShowForm(false)} />}

      <div className="space-y-4">
         {passports.length === 0 ? (
           <div className="bg-[#111113] border border-white/10 rounded-2xl p-10 text-center text-slate-400">
             Nenhum passaporte cadastrado.
           </div>
         ) : (
           passports.map(p => {
             const userEmail = users.find(u => u.id === p.userId)?.email || 'Desconhecido';
             return (
               <div key={p.id} className="bg-[#111113] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <img src={p.photo} alt="Foto" className="w-16 h-16 rounded object-cover border border-white/10" referrerPolicy="no-referrer" />
                   <div>
                     <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 mb-2 inline-block">{userEmail}</span>
                     <h4 className="text-xl font-bold">{p.nome} {p.sobrenome}</h4>
                     <p className="text-sm text-slate-400">Passaporte: {p.numero} - Validade: {p.validoAte}</p>
                   </div>
                 </div>
                 
                 <div className="flex gap-2">
                    <button onClick={() => { setEditingPassport(p); setShowForm(true); }} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Editar"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Excluir"><Trash2 size={18} /></button>
                 </div>
               </div>
             )
           })
         )}
      </div>
    </div>
  )
}

function PassportForm({ users, initialData, onComplete }: { users: any[], initialData: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    userId: '',
    tipo: 'P',
    paisEmissor: 'BRA',
    numero: 'AA000000',
    sobrenome: 'FARIAS DOS SANTOS',
    nome: 'RODRIGO',
    nacionalidade: 'BRASILEIRO(A)',
    dataNascimento: '16 MAR/MAR 2004',
    identidade: 'B0123456789',
    sexo: 'M',
    naturalidade: 'BRASÍLIA/DF',
    filiacao1: 'MARCOS JOSÉ DOS SANTOS',
    filiacao2: 'AMANDA FARIAS DOS SANTOS',
    dataExpedicao: '01 ABR/APR 2015',
    autoridade: 'DPAS/DPF',
    validoAte: '31 MAR/MAR 2025',
    mrz1: 'P<BRAFARIAS<DOS<SANTOS<<RODRIGO<<<<<<<<<<<<<<',
    mrz2: 'AA000000<0BRA0403162M2503310<<<<<<<<<<<<<<<06',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) return alert("Selecione um usuário.");
    setLoading(true);
    
    try {
      if (initialData) {
        await updateDoc(doc(db, 'passports', initialData.id), {
          ...formData,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'passports'), {
          ...formData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      onComplete();
    } catch(err) {
      console.error(err);
      alert("Erro ao salvar passaporte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#111113] border border-white/10 rounded-2xl p-6 mb-8 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="md:col-span-2 lg:col-span-3 text-lg font-bold border-b border-white/10 pb-2 mb-2">{initialData ? 'Editar Passaporte' : 'Novo Passaporte'}</div>
      
      <div className="space-y-1 lg:col-span-3">
        <label className="text-xs text-slate-400 uppercase font-bold">Usuário (Dono do Passaporte)</label>
        <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500">
          <option value="">Selecione um usuário...</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
      </div>

      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Tipo / Type</label><input required type="text" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">País Emissor</label><input required type="text" value={formData.paisEmissor} onChange={e => setFormData({...formData, paisEmissor: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Passaporte Nº</label><input required type="text" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      
      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">Sobrenome</label><input required type="text" value={formData.sobrenome} onChange={e => setFormData({...formData, sobrenome: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 uppercase" /></div>
      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">Nome</label><input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 uppercase" /></div>

      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Nacionalidade</label><input required type="text" value={formData.nacionalidade} onChange={e => setFormData({...formData, nacionalidade: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Data Nasc.</label><input required type="text" value={formData.dataNascimento} onChange={e => setFormData({...formData, dataNascimento: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Identidade Nº</label><input required type="text" value={formData.identidade} onChange={e => setFormData({...formData, identidade: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>

      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Sexo (M/F)</label><input required type="text" value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1 lg:col-span-2"><label className="text-xs text-slate-400 uppercase font-bold">Naturalidade</label><input required type="text" value={formData.naturalidade} onChange={e => setFormData({...formData, naturalidade: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      
      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">Filiação 1</label><input required type="text" value={formData.filiacao1} onChange={e => setFormData({...formData, filiacao1: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 uppercase" /></div>
      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">Filiação 2</label><input required type="text" value={formData.filiacao2} onChange={e => setFormData({...formData, filiacao2: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 uppercase" /></div>

      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Data Expedição</label><input required type="text" value={formData.dataExpedicao} onChange={e => setFormData({...formData, dataExpedicao: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Autoridade</label><input required type="text" value={formData.autoridade} onChange={e => setFormData({...formData, autoridade: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>
      <div className="space-y-1"><label className="text-xs text-slate-400 uppercase font-bold">Válido Até</label><input required type="text" value={formData.validoAte} onChange={e => setFormData({...formData, validoAte: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5" /></div>

      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">URL da Foto</label><input required type="text" value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-blue-400 font-mono text-sm" /></div>
      
      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">MRZ Linha 1</label><input required type="text" value={formData.mrz1} onChange={e => setFormData({...formData, mrz1: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm uppercase text-slate-300" /></div>
      <div className="space-y-1 lg:col-span-3"><label className="text-xs text-slate-400 uppercase font-bold">MRZ Linha 2</label><input required type="text" value={formData.mrz2} onChange={e => setFormData({...formData, mrz2: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm uppercase text-slate-300" /></div>

      <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4 border-t border-white/10 pt-6">
        <button type="button" onClick={onComplete} className="px-6 py-3 rounded-xl font-bold bg-[#0a0a0c] text-slate-300 hover:text-white transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
          {loading ? 'Salvando...' : 'Salvar Passaporte'}
        </button>
      </div>
    </form>
  )
}

function UserManager({ users, onDelete }: { users: any[], onDelete: (id: string) => void }) {
  const [editingUser, setEditingUser] = useState<any>(null);

  return (
    <div>
       <h2 className="text-2xl font-bold mb-8 text-white">Gerenciar Usuários</h2>
       
       {editingUser && (
         <UserEditForm user={editingUser} onComplete={() => setEditingUser(null)} />
       )}

       <div className="space-y-4">
         {users.length === 0 ? (
           <div className="bg-[#111113] border border-white/10 rounded-2xl p-10 text-center text-slate-400">
             Nenhum usuário encontrado no sistema.
           </div>
         ) : (
           users.map(u => (
             <div key={u.id} className="bg-[#111113] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {u.photoUrl ? (
                    <img src={u.photoUrl} alt="Foto" className="w-12 h-12 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-[#0a0a0c] rounded-full border border-white/10 flex items-center justify-center">
                      <Users className="text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg">{u.name || 'Sem Nome'}</p>
                    <p className="text-sm text-slate-400">{u.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                  <button onClick={() => setEditingUser(u)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-blue-500/20">
                    <Edit2 size={18} /> Editar Perfil Visível
                  </button>
                  <button onClick={() => onDelete(u.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-red-500/20">
                     <UserMinus size={18} /> Excluir Todos os Dados
                  </button>
                </div>
             </div>
           ))
         )}
       </div>
    </div>
  )
}

function UserEditForm({ user, onComplete }: { user: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    cpf: user.cpf || '***.***.***-**',
    photoUrl: user.photoUrl || '',
    balance: user.balance || 'R$ 0,00'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateDoc(doc(db, 'users', user.id), {
        ...formData,
        updatedAt: Date.now()
      });
      onComplete();
    } catch(err) {
      console.error(err);
      alert("Erro ao salvar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1f] border border-blue-500/30 rounded-2xl p-6 mb-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2 text-lg font-bold border-b border-white/10 pb-2 mb-2 text-blue-400">Editando Perfil: {user.email}</div>
      
      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase font-bold">Nome Visível</label>
        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="Nome Completo" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase font-bold">E-mail Visível</label>
        <input required type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="usuario@email.com" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase font-bold">CPF</label>
        <input required type="text" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="***.***.***-**" />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400 uppercase font-bold">Saldo Total Visível</label>
        <input required type="text" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="R$ 3.250,00" />
      </div>

      <div className="space-y-1 md:col-span-2">
        <label className="text-xs text-slate-400 uppercase font-bold">URL da Foto do Perfil</label>
        <input required type="text" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500" placeholder="https://..." />
      </div>

      <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-white/10 pt-6">
        <button type="button" onClick={onComplete} className="px-6 py-3 rounded-xl font-bold bg-[#0a0a0c] text-slate-300 hover:text-white transition-colors">Cancelar</button>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
          {loading ? 'Salvando...' : 'Salvar Alterações do Usuário'}
        </button>
      </div>
    </form>
  )
}

