import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, ClipboardCheck, FileText, 
  Download, AlertCircle, FileBadge, Settings2, User, Calendar, Trash2
} from 'lucide-react';

const App = () => {
  const [studentInfo, setStudentInfo] = useState({ identity: '', classe: '' });
  const [evaluations, setEvaluations] = useState({});
  const [globalComment, setGlobalComment] = useState('');
  const [coeffs, setCoeffs] = useState({ mobilisation: 4, exploitation: 6, raisonnement: 8, redaction: 2 });

  const criteres = [
    { id: 'mobilisation', titre: '1. Connaissances', icon: <GraduationCap size={18} />, color: 'blue', items: ['Vocabulaire SES précis', 'Définitions concepts clés', 'Mécanismes théoriques'] },
    { id: 'exploitation', titre: '2. Documents', icon: <FileText size={18} />, color: 'purple', items: ['Sélection infos utiles', 'Lecture données (unités)', 'Lien documents/cours'] },
    { id: 'raisonnement', titre: '3. Raisonnement', icon: <ClipboardCheck size={18} />, color: 'emerald', items: ['Intro (Accroche/Pb/Plan)', 'Méthode AEI respectée', 'Transitions logiques', 'Conclusion claire'] },
    { id: 'redaction', titre: '4. Rédaction', icon: <FileBadge size={18} />, color: 'orange', items: ['Syntaxe et orthographe', 'Soin et lisibilité'] }
  ];

  const options = [{ label: '--', value: 0, color: 'bg-red-100 text-red-700' }, { label: '-', value: 1, color: 'bg-orange-100 text-orange-700' }, { label: '+', value: 2, color: 'bg-blue-100 text-blue-700' }, { label: '++', value: 3, color: 'bg-green-100 text-green-700' }];

  const handleEvalChange = (critereId, item, type, value) => {
    setEvaluations(prev => ({ ...prev, [`${critereId}-${item}`]: { ...prev[`${critereId}-${item}`], [type]: value } }));
  };

  const resetAll = () => { if(window.confirm("Effacer les données pour un nouvel élève ?")) { setStudentInfo({ identity: '', classe: '' }); setEvaluations({}); setGlobalComment(''); }};

  const stats = useMemo(() => {
    let totalObtenu = 0, totalMax = 0;
    const parCategorie = {};
    criteres.forEach(crit => {
      let catObtenu = 0, catMax = 0;
      crit.items.forEach(item => {
        const note = evaluations[`${crit.id}-${item}`]?.note;
        const opt = options.find(o => o.label === note);
        if (opt) catObtenu += (opt.value * coeffs[crit.id]) / crit.items.length;
        catMax += (3 * coeffs[crit.id]) / crit.items.length;
      });
      parCategorie[crit.id] = catMax > 0 ? (catObtenu / catMax) * 100 : 0;
      totalObtenu += catObtenu; totalMax += catMax;
    });
    const noteBrute = totalMax > 0 ? (totalObtenu / totalMax) * 20 : 0;
    return { note: (Math.ceil(noteBrute * 2) / 2).toFixed(1), details: parCategorie };
  }, [evaluations, coeffs]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 print:p-0 print:bg-white">
      
      {/* --- INTERFACE DE SAISIE --- */}
      <main className="max-w-6xl mx-auto space-y-4 print:hidden">
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Élève</label>
            <input type="text" className="w-full text-base font-semibold border-b-2 border-slate-100 outline-none focus:border-indigo-500 bg-transparent" value={studentInfo.identity} onChange={e => setStudentInfo({...studentInfo, identity: e.target.value})} />
          </div>
          <div className="w-24">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Classe</label>
            <input type="text" className="w-full text-base font-semibold border-b-2 border-slate-100 outline-none focus:border-indigo-500 bg-transparent" value={studentInfo.classe} onChange={e => setStudentInfo({...studentInfo, classe: e.target.value})} />
          </div>
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg ml-auto">
            <span className="text-xs font-bold uppercase opacity-70 italic">Note :</span>
            <span className="text-2xl font-black">{stats.note}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm" title="Réinitialiser"><Trash2 size={20} /></button>
            <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"><Download size={18} /> Export PDF</button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteres.map((crit) => (
            <section key={crit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`px-4 py-3 border-b flex justify-between items-center bg-${crit.color}-50/30`}>
                <div className="flex items-center gap-2 font-black text-sm uppercase text-slate-700 tracking-tight">{crit.icon} {crit.titre}</div>
                <div className="flex items-center gap-1 opacity-50"><Settings2 size={12} /><input type="number" className="w-8 text-xs font-bold text-center bg-transparent" value={coeffs[crit.id]} onChange={e => setCoeffs({...coeffs, [crit.id]: e.target.value})} /></div>
              </div>
              <div className="divide-y divide-slate-100">
                {crit.items.map((item, idx) => {
                  const key = `${crit.id}-${item}`; const cur = evaluations[key] || { note: '', comment: '' };
                  return (
                    <div key={idx} className="p-3 hover:bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2"><p className="text-sm font-semibold text-slate-700 leading-snug flex-1 pr-4">{item}</p>
                        <div className="flex gap-1">{options.map(opt => (<button key={opt.label} onClick={() => handleEvalChange(crit.id, item, 'note', opt.label)} className={`w-8 h-8 text-xs font-black rounded-md border transition-all ${cur.note === opt.label ? opt.color + ' border-current scale-110 shadow-sm' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'}`}>{opt.label}</button>))}</div>
                      </div>
                      <input type="text" placeholder="Commentaire..." className="w-full text-xs text-slate-500 italic bg-slate-50 px-2 py-1.5 rounded-md outline-none" value={cur.comment} onChange={e => handleEvalChange(crit.id, item, 'comment', e.target.value)} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-black text-xs uppercase tracking-wider"><AlertCircle size={16} /> Appréciation générale</div>
          <textarea rows="3" className="w-full text-sm border border-slate-100 rounded-lg p-3 outline-none resize-none focus:border-indigo-500" placeholder="Conseils pour l'élève..." value={globalComment} onChange={e => setGlobalComment(e.target.value)} />
        </section>
      </main>

      {/* --- VUE PDF (Ajustée pour 1 page) --- */}
      <div className="hidden print:block max-w-[210mm] mx-auto p-8 text-slate-900 leading-tight">
        {/* Header Compacté */}
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Grille Evaluation Première</h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Épreuve Composée (EC3)</p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-center min-w-[100px]">
            <div className="text-[8px] font-black uppercase opacity-60">Note Finale</div>
            <div className="text-2xl font-black leading-none">{stats.note} <span className="text-sm opacity-40">/ 20</span></div>
          </div>
        </div>

        {/* Infos PDF */}
        <div className="flex gap-10 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-50 pb-3">
          <div>Élève : <span className="text-slate-900">{studentInfo.identity || '___________________'}</span></div>
          <div>Classe : <span className="text-slate-900">{studentInfo.classe || '___'}</span></div>
            </div>

        {/* Maîtrise PDF */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-4 mb-8">
          {criteres.map(crit => (
            <div key={crit.id} className="space-y-1.5">
              <div className="flex justify-between items-end"><span className="text-[9px] font-black uppercase text-slate-700 tracking-tight">{crit.titre.split('.')[1]}</span><span className="text-[9px] font-bold text-slate-400">{Math.round(stats.details[crit.id])}%</span></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-slate-900 rounded-full" style={{ width: `${stats.details[crit.id]}%` }} /></div>
            </div>
          ))}
        </div>

        {/* Observations PDF */}
        <div className="space-y-4 mb-6">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Observations détaillées</h2>
          <div className="space-y-3">
            {criteres.map(crit => {
              const obs = crit.items.filter(i => evaluations[`${crit.id}-${i}`]?.note || evaluations[`${crit.id}-${i}`]?.comment);
              if (obs.length === 0) return null;
              return (
                <div key={crit.id} className="bg-slate-50/50 px-3 py-2.5 rounded-lg border border-slate-100 break-inside-avoid">
                  <h3 className="text-[9px] font-black uppercase text-indigo-600 mb-1.5 flex items-center gap-1.5 underline underline-offset-2">{crit.titre}</h3>
                  <div className="space-y-1.5">
                    {obs.map(i => {
                      const e = evaluations[`${crit.id}-${i}`];
                      return (
                        <div key={i} className="text-[11px] leading-tight flex items-start">
                          <span className="font-black text-indigo-600 mr-2 shrink-0">[{e.note || '?'}]</span>
                          <span className="text-slate-700 font-semibold italic">{i} : {e.comment || "Validé."}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Appréciation Finale PDF */}
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-r-xl break-inside-avoid shadow-sm">
          <h2 className="text-[9px] font-black uppercase text-indigo-600 mb-1.5 tracking-widest">Appréciation globale & Conseils</h2>
          <p className="text-[12px] text-indigo-900 leading-snug font-medium whitespace-pre-wrap italic">
            {globalComment || "Excellent travail. Veillez à bien maintenir cette rigueur dans l'organisation des paragraphes AEI."}
          </p>
        </div>

        <footer className="mt-8 pt-4 border-t border-slate-100 text-[8px] text-center text-slate-300 font-bold uppercase tracking-[0.5em]">
          SES PREMIERE • FICHE NOTES
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 8mm 12mm; }
          body { -webkit-print-color-adjust: exact; background: white; font-family: sans-serif; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;