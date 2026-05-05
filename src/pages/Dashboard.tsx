import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Plane, CreditCard, User, Bell, Settings, LogOut, 
  ChevronRight, ScanFace, Plus, ArrowUp, ArrowDown, 
  MoreHorizontal, Eye, MapPin, CheckCircle, AlertCircle, 
  PlaneTakeoff, QrCode, X, Camera, Globe, Lock, PenTool, WifiOff, Languages
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'tickets' | 'bank' | 'profile'>('home');
  const [showVerify, setShowVerify] = useState(false);
  const [tick, setTick] = useState(0);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans flex flex-col relative pb-24 overflow-x-hidden selection:bg-blue-500/30">
      
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <InicioTab onVerify={() => setShowVerify(true)} tick={tick} />}
        {activeTab === 'tickets' && <PassagensTab />}
        {activeTab === 'bank' && <BancoTab />}
        {activeTab === 'profile' && <PerfilTab />}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 px-6 flex justify-between items-center z-40">
        <NavItem active={activeTab === 'home'} icon={<Home size={24} />} label="Início" onClick={() => setActiveTab('home')} />
        <NavItem active={activeTab === 'tickets'} icon={<Plane size={24} />} label="Passagens" onClick={() => setActiveTab('tickets')} />
        <NavItem active={activeTab === 'bank'} icon={<CreditCard size={24} />} label="Banco" onClick={() => setActiveTab('bank')} />
        <NavItem active={activeTab === 'profile'} icon={<User size={24} />} label="Perfil" onClick={() => setActiveTab('profile')} />
      </div>

      {showVerify && <VerifyOverlay onClose={() => { setShowVerify(false); setTick(t => t + 1); }} />}
    </div>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-colors ${active ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function InicioTab({ onVerify, tick }: { onVerify: () => void, tick: number }) {
  const [status, setStatus] = useState<string | null>(null);
  const [passport, setPassport] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'verifications', auth.currentUser.uid), (doc) => {
      if(doc.exists()) setStatus(doc.data().status);
    });

    const q = query(collection(db, 'passports'), where('userId', '==', auth.currentUser.uid));
    const unsubPassport = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPassport({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setPassport(null);
      }
    });

    return () => { unsub(); unsubPassport(); };
  }, [tick]);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center mt-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">Olá! 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">Bem-vindo ao sistema de embarque.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onVerify} className="p-2 bg-[#111113] rounded-xl border border-white/5 relative hover:bg-white/10 transition-colors">
            <ScanFace size={20} className="text-blue-400" />
            {status === 'approved' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full"></span>}
            {status === 'pending' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-black rounded-full animate-pulse"></span>}
          </button>
        </div>
      </header>

      {/* Passport Card */}
      {passport ? (
        <div className="bg-[#f0f4eb] border border-[#a2bba1] rounded-[1rem] p-5 relative overflow-hidden shadow-2xl text-[#1d2a3a]">
           {/* Decorative background guilloche / noises to look like physical passport */}
           <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-600 via-[#f0f4eb] to-[#f0f4eb] pointer-events-none"></div>
           
           <div className="relative z-10">
             <div className="text-center mb-5 flex justify-center items-center gap-4">
               <div>
                 <h3 className="text-[#0038a8] font-bold uppercase text-[12px] tracking-[0.1em]">República Federativa do Brasil</h3>
                 <div className="flex justify-between px-8 text-[#0038a8] font-bold uppercase text-[9px] tracking-widest mt-0.5">
                   <span>Passaporte</span>
                   <span>Passport</span>
                 </div>
               </div>
             </div>
             
             <div className="flex gap-4">
                <div className="w-[100px] shrink-0 flex flex-col items-center">
                  <div className="w-[90px] h-[120px] bg-slate-200 rounded-[2px] overflow-hidden border border-[#d1d5db]">
                    <img src={passport.photo} className="w-full h-full object-cover" alt="Photo" />
                  </div>
                  <div className="mt-3 text-center border-t border-black/20 w-full pt-1">
                     <p className="text-[5px] text-black">ASSINATURA DO TITULAR / HOLDER'S SIGNATURE</p>
                  </div>
                </div>
                
                <div className="flex-1 text-[7px] leading-[1.1] flex flex-col gap-2 uppercase font-semibold text-black">
                   <div className="flex gap-2">
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">TIPO / TYPE</p>{passport.tipo}</div>
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">PAÍS EMISSOR / ISSUING COUNTRY</p>{passport.paisEmissor}</div>
                     <div className="flex-[1.5] text-right"><p className="text-[6px] text-[#0038a8] font-bold">PASSAPORTE Nº / PASSPORT No</p><span className="text-[12px] font-black">{passport.numero}</span></div>
                   </div>
                   <div><p className="text-[6px] text-[#0038a8] font-bold">SOBRENOME / SURNAME</p><span className="font-bold text-[10px]">{passport.sobrenome}</span></div>
                   <div><p className="text-[6px] text-[#0038a8] font-bold">NOME / GIVEN NAMES</p><span className="font-bold text-[10px]">{passport.nome}</span></div>
                   <div className="flex gap-2">
                     <div className="flex-[1.5]"><p className="text-[6px] text-[#0038a8] font-bold">NACIONALIDADE / NATIONALITY</p><span className="font-bold text-[9px]">{passport.nacionalidade}</span></div>
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">DATA DE NASCIMENTO</p><span className="font-bold text-[9px]">{passport.dataNascimento}</span></div>
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">IDENTIDADE Nº</p><span className="font-bold text-[9px]">{passport.identidade}</span></div>
                   </div>
                   <div className="flex gap-2">
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">SEXO</p><span className="font-bold text-[9px]">{passport.sexo}</span></div>
                     <div className="flex-[2]"><p className="text-[6px] text-[#0038a8] font-bold">NATURALIDADE</p><span className="font-bold text-[9px]">{passport.naturalidade}</span></div>
                   </div>
                   <div><p className="text-[6px] text-[#0038a8] font-bold">FILIAÇÃO</p><span className="font-bold text-[8px] leading-[1.2] inline-block">{passport.filiacao1}<br/>{passport.filiacao2}</span></div>
                   <div className="flex gap-2">
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">DATA DE EXPEDIÇÃO</p><span className="font-bold text-[8px]">{passport.dataExpedicao}</span></div>
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">VÁLIDO ATÉ</p><span className="font-bold text-[8px]">{passport.validoAte}</span></div>
                     <div className="flex-1"><p className="text-[6px] text-[#0038a8] font-bold">AUTORIDADE</p><span className="font-bold text-[8px]">{passport.autoridade}</span></div>
                   </div>
                </div>
             </div>
             
             <div className="mt-4 font-mono text-[9px] sm:text-[11px] tracking-[0.16em] leading-tight break-all space-y-1 text-black bg-white/50 p-2 rounded-lg">
                <div>{passport.mrz1}</div>
                <div>{passport.mrz2}</div>
             </div>
           </div>
        </div>
      ) : (
        <div className="bg-[#111113] border border-white/5 rounded-[2rem] p-8 text-center text-slate-400">
           Seu passaporte digital será emitido em breve. <br/><span className="text-xs text-slate-500 mt-2 block">O administrador está processando seus dados.</span>
        </div>
      )}

      {/* Próxima viagem */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg">Próxima viagem</h3>
          <button className="text-blue-500 text-sm font-medium hover:text-blue-400">Ver todas</button>
        </div>
        
        <div className="bg-[#111113] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
          <img src="https://images.unsplash.com/photo-1558582823-7fa364cd05ce?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700" alt="Lisbon" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/80 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-4xl font-black tracking-tight text-white drop-shadow-md">GRU</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">São Paulo</p>
              </div>
              <div className="flex-1 flex items-center justify-center relative px-4">
                <div className="h-[1px] w-full bg-slate-600 absolute"></div>
                <Plane size={24} className="relative z-10 text-white bg-[#111113] px-1 transform rotate-90" />
              </div>
              <div className="text-right">
                <h4 className="text-4xl font-black tracking-tight text-white drop-shadow-md">LIS</h4>
                <p className="text-xs text-slate-400 mt-1 font-medium">Lisboa</p>
              </div>
            </div>
            
            <div className="flex justify-between items-end pt-2">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                 <p className="text-sm font-medium text-slate-200">15 Nov 2026 • 10:30</p>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                <QrCode size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassagensTab() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', auth.currentUser.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a: any, b: any) => b.createdAt - a.createdAt);
      setTickets(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas viagens</h1>
        <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Plus size={24} />
        </button>
      </header>

      <div className="flex gap-4 mb-6">
         <button className="bg-[#1a1a1e] border border-blue-500/30 text-blue-400 px-6 py-2.5 rounded-full text-sm font-medium">Próximas</button>
         <button className="text-slate-400 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#111113] transition-colors">Anteriores</button>
      </div>

      <div className="space-y-4">
        {tickets.length === 0 && (
          <div className="bg-[#111113] border border-white/5 rounded-[2rem] p-8 text-center text-slate-400">
            Você ainda não possui viagens marcadas.
          </div>
        )}

        {tickets.map((ticket, i) => (
          <div key={ticket.id} className={`bg-[#111113] border border-white/5 rounded-[2rem] p-6 relative flex justify-between ${ticket.status === 'cancelled' ? 'opacity-50' : ''}`}>
             <div className="space-y-4 flex-1">
               <div className="flex items-center gap-3">
                 <div>
                   <h4 className="text-2xl font-bold">{ticket.originCode}</h4>
                   <p className="text-[10px] text-slate-400">{ticket.originCity}</p>
                 </div>
                 <Plane size={16} className="text-slate-500 transform rotate-45" />
                 <div>
                   <h4 className="text-2xl font-bold">{ticket.destinationCode}</h4>
                   <p className="text-[10px] text-slate-400">{ticket.destinationCity}</p>
                 </div>
               </div>
               
               <div>
                 <p className="text-sm font-bold text-slate-200">{new Date(ticket.departureTime).toLocaleString()}</p>
                 <p className="text-xs text-slate-500 mt-1">Voo {ticket.flightNumber} • Duração {ticket.duration}</p>
               </div>
               
               <div>
                 <p className="text-[10px] text-slate-500 mb-1">Assento</p>
                 <span className="bg-[#1a1a1e] border border-white/10 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-bold">{ticket.seat}</span>
               </div>
             </div>
             
             <div className="flex flex-col items-end justify-between ml-4">
                {ticket.status === 'confirmed' && <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Confirmada</span>}
                {ticket.status === 'pending' && <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Pendente</span>}
                {ticket.status === 'cancelled' && <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Cancelada</span>}

                <img src={ticket.image || "https://images.unsplash.com/photo-1558582823-7fa364cd05ce?q=80&w=200&h=300&auto=format&fit=crop"} className="w-20 h-28 object-cover rounded-2xl" alt="Destination" />
             </div>
          </div>
        ))}
      </div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 mt-4">
        <Plus size={20} /> Comprar passagem
      </button>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 hide-scrollbar">
         <div className="bg-[#111113] border border-white/5 rounded-[1.5rem] p-5 shrink-0 w-64 flex gap-4 items-center">
            <div className="bg-blue-600/20 p-3 rounded-full text-blue-500 border border-blue-500/20">
               <Plane size={24} />
            </div>
            <div>
               <p className="font-bold text-sm">Modo offline</p>
               <p className="text-xs text-slate-400 mt-0.5 leading-tight">Seu passaporte disponível sem internet</p>
            </div>
         </div>
         <div className="bg-[#111113] border border-white/5 rounded-[1.5rem] p-5 shrink-0 w-64 flex gap-4 items-center">
            <div className="bg-blue-600/20 p-3 rounded-full text-blue-500 border border-blue-500/20">
               <Languages size={24} />
            </div>
            <div>
               <p className="font-bold text-sm">Tradutor PRO</p>
               <p className="text-xs text-slate-400 mt-0.5 leading-tight">Se comunique em mais de 50 idiomas</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function BancoTab() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carteira</h1>
        <div className="flex gap-4">
          <Eye size={24} className="text-slate-300" />
          <Bell size={24} className="text-slate-300" />
        </div>
      </header>

      <div className="bg-gradient-to-br from-[#1d1e44] to-[#01092e] rounded-[2rem] p-6 relative overflow-hidden shadow-2xl">
        {/* Wavy background decoration */}
        <div className="absolute bottom-0 inset-x-0 h-32 opacity-30 select-none pointer-events-none">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
             <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" fill="none" stroke="#4F46E5" strokeWidth="2"></path>
             <path d="M0,60 Q30,30 60,60 T100,60 L100,100 L0,100 Z" fill="none" stroke="#818CF8" strokeWidth="1"></path>
           </svg>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <p className="text-sm font-medium text-slate-300">Saldo total</p>
          <ScanFace size={24} className="text-blue-300" />
        </div>
        <h2 className="text-4xl font-bold text-white mt-2 relative z-10">R$ 3.250,00</h2>
        
        <div className="mt-8 flex justify-end relative z-10">
          <button className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
             <QrCode size={20} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex justify-between px-4 py-4">
         <div className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"><Plus size={24} /></button>
            <span className="text-[11px] font-medium text-slate-300">Adicionar</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"><ArrowUp size={24} /></button>
            <span className="text-[11px] font-medium text-slate-300">Enviar</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"><ArrowDown size={24} /></button>
            <span className="text-[11px] font-medium text-slate-300">Receber</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <button className="w-14 h-14 bg-[#111113] border border-white/10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"><MoreHorizontal size={24} /></button>
            <span className="text-[11px] font-medium text-slate-300">Mais</span>
         </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-lg">Últimas transações</h3>
          <button className="text-blue-500 text-sm font-medium">Ver todas</button>
        </div>
        
        <div className="bg-[#111113] rounded-3xl overflow-hidden border border-white/5">
          <TransactionItem title="Uber" date="Hoje, 08:45" amount="- R$ 25,00" icon="U" bg="bg-black text-white" />
          <TransactionItem title="Passagem LATAM" date="Ontem, 14:30" amount="- R$ 1.200,00" icon={<Plane size={16} />} bg="bg-[#1a1130] text-purple-400" />
          <TransactionItem title="Hotel Lisboa" date="12 Mai, 09:15" amount="- R$ 800,00" icon={<Home size={16} />} bg="bg-[#2a1a11] text-amber-500" />
          <TransactionItem title="Restaurante" date="11 Mai, 20:10" amount="- R$ 120,00" icon={<CreditCard size={16} />} bg="bg-[#201813] text-orange-400" border={false} />
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ title, date, amount, icon, bg, border = true }: any) {
  return (
    <div className={`p-4 flex justify-between items-center ${border ? 'border-b border-white/5' : ''}`}>
      <div className="flex items-center gap-4">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${bg}`}>
           {icon}
         </div>
         <div>
           <p className="font-bold text-slate-200">{title}</p>
           <p className="text-xs text-slate-500 mt-0.5">{date}</p>
         </div>
      </div>
      <p className="font-bold text-white">{amount}</p>
    </div>
  );
}

function PerfilTab() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch(err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10">
      <header className="flex justify-between items-center mb-8">
        <div className="w-6"></div> {/* spacer */}
        <h1 className="text-xl font-bold">Perfil</h1>
        <button className="text-slate-300"><Settings size={24} /></button>
      </header>

      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop" className="w-32 h-32 rounded-full border-4 border-[#111113] object-cover shadow-2xl" alt="Profile" />
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-[#050505] shadow-lg">
            <PenTool size={16} />
          </button>
        </div>
        <h2 className="text-3xl font-bold">Marcos Furtado</h2>
        <p className="text-slate-400 text-sm mt-1 mb-2">marcosfurtado@email.com</p>
        <p className="text-slate-500 text-sm font-mono tracking-widest">CPF: ***.***.***-**</p>
      </div>

      <div className="space-y-3">
        <ProfileMenuItem icon={<User size={20} />} label="Informações pessoais" bg="bg-blue-600" />
        <ProfileMenuItem icon={<Settings size={20} />} label="Configurações" bg="bg-slate-700" />
        <ProfileMenuItem icon={<Lock size={20} />} label="Segurança" bg="bg-emerald-500" />
        <ProfileMenuItem icon={<Globe size={20} />} label="Idioma" value="Português" bg="bg-purple-600" />
        <button onClick={handleLogout} className="w-full flex items-center justify-between bg-[#111113] hover:bg-[#1a1a1e] transition-colors p-4 rounded-2xl border border-white/5 pt-5 pb-5">
           <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-red-600 bg-opacity-20`}>
                 <LogOut size={20} className="text-red-500" />
              </div>
              <span className="font-bold text-red-500">Sair da conta</span>
           </div>
        </button>
      </div>
    </div>
  );
}

function ProfileMenuItem({ icon, label, value, bg }: any) {
  return (
    <button className="w-full flex items-center justify-between bg-[#111113] hover:bg-[#1a1a1e] transition-colors p-4 rounded-2xl border border-white/5">
      <div className="flex items-center gap-4">
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${bg}`}>
            {icon}
         </div>
         <span className="font-bold text-slate-200">{label}</span>
      </div>
      <div className="flex items-center gap-2">
         {value && <span className="text-sm text-slate-500">{value}</span>}
         <ChevronRight size={20} className="text-slate-600" />
      </div>
    </button>
  );
}


/* -- OVERLAY FOR CAMERA AND GPS VERIFICATION -- */
function VerifyOverlay({ onClose }: { onClose: () => void }) {
  const [stream, setStream] = useState<MediaStream|null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photo, setPhoto] = useState<string|null>(null);
  const [location, setLocation] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // try to get status first
    const checkExisting = async () => {
      if(!auth.currentUser) return;
      try {
         const docSnap = await getDoc(doc(db, 'verifications', auth.currentUser.uid));
         if (docSnap.exists()) {
            setPhoto(docSnap.data().photo);
            setLocation(docSnap.data().location);
         }
      } catch (err) {
        console.error(err);
      }
    };
    checkExisting();
  }, []);

  const startVerification = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}),
        (err) => console.error(err)
      );
    } catch(err) { alert("Permissão de câmera negada ou dispositivo sem câmera."); }
  }

  const takePhoto = async () => {
    if (!videoRef.current || !auth.currentUser) return;
    setSubmitting(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    
    const userLocation = location || { lat: -23.5505, lng: -46.6333 }; // fallback to Sp if denied
    
    try {
      await setDoc(doc(db, 'verifications', auth.currentUser.uid), {
        userId: auth.currentUser.uid,
        photo: dataUrl,
        location: userLocation,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setPhoto(dataUrl);
      setStream(null);
    } catch(err) {
      console.error(err);
      alert("Erro ao salvar dados!");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    return () => {
      if (stream) { stream.getTracks().forEach(track => track.stop()); }
    };
  }, [stream]);


  return (
    <div className="fixed inset-0 z-50 bg-[#050505] animate-in slide-in-from-bottom-full duration-300 flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-white/10">
         <h2 className="text-xl font-bold text-white">Verificação Biométrica</h2>
         <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X size={20} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {!stream && !photo && (
          <div className="w-full flex flex-col items-center text-center">
             <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-700 flex flex-col items-center justify-center mb-8 bg-[#111113]">
               <ScanFace size={64} className="text-slate-500 mb-2"/>
             </div>
             <h3 className="text-2xl font-bold mb-4">Autenticação de Segurança</h3>
             <p className="text-slate-400 mb-8 max-w-sm">Para liberar transações internacionais e acesso aduaneiro, precisamos validar seu rosto e localização atual.</p>
             <button onClick={startVerification} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/20 text-lg">
                <Camera size={24} /> Iniciar Verificação
             </button>
          </div>
        )}

        {stream && (
           <div className="w-full flex flex-col items-center text-center">
             <div className="w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden mb-6 relative border border-white/10">
               <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
               {location && (
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center border border-white/10">
                   <MapPin size={14} className="inline mr-2 text-emerald-400"/> GPS Capturado
                 </div>
               )}
               <div className="absolute inset-0 border-4 border-blue-500/30 rounded-3xl pointer-events-none">
                 <div className="absolute top-1/4 bottom-1/4 left-1/4 right-1/4 border-2 border-dashed border-white/50 rounded-full animate-pulse"></div>
               </div>
             </div>
             <button onClick={takePhoto} disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-blue-500/20 text-lg">
                {submitting ? 'Analisando...' : 'Girar rosto e Escanear'}
             </button>
           </div>
        )}

        {photo && (
           <div className="w-full flex flex-col items-center text-center">
             <div className="w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-emerald-500 relative shadow-xl shadow-emerald-500/20">
               <img src={photo} className="w-full h-full object-cover transform -scale-x-100" alt="Verification selfie" />
             </div>
             <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-3xl w-full mb-6">
                <CheckCircle size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Biometria Submetida</h3>
                <p className="text-sm opacity-90 leading-relaxed">Sua foto e localização GPS foram enviadas para avaliação do administrador. Acompanhe o status pelo ícone do passaporte.</p>
             </div>
             <button onClick={onClose} className="w-full bg-[#111113] hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-colors">
                Voltar à Carteira
             </button>
           </div>
        )}
      </div>
    </div>
  );
}
