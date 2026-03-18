import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, ClipboardCheck, FileText, 
  Download, AlertCircle, FileBadge, Trash2, Weight
} from 'lucide-react';

const App = () => {
  const [studentInfo, setStudentInfo] = useState({ identity: '', classe: '' });
  const [evaluations, setEvaluations] = useState({});
  const [globalComment, setGlobalComment] = useState('');
  
  // Coefficients globaux par catégorie (ajustables via l'interface)
  const [catCoeffs, setCatCoeffs] = useState({ 
    mobilisation: 6, 
    exploitation: 5, 
    raisonnement: 7, 
    redaction: 2 
  });

  // Poids internes (ajustables ici dans le code)
  const itemWeights = {
    // Mobilisation
    'mobilisation-Vocabulaire SES précis': 1,
    'mobilisation-Définitions concepts clés': 2,
    'mobilisation-Mécanismes théoriques': 2,
    // Exploitation
    'exploitation-Sélection infos utiles': 1,
    'exploitation-Lecture données (unités)': 1,
    'exploitation-Lien documents/cours': 2,
    // Raisonnement (Mise à jour suite à votre modification)
    'raisonnement-Intro [Accroche, Def, Ann Plan]': 1.5,
    'raisonnement-Réponse traitant le sujet': 3,
    'raisonnement-Arguments appuyés sur les documents': 3,
    'raisonnement-Paragraphes organisés et cohérents': 2,
    'raisonnement-Conclusion claire': 1,
    // Rédaction
    'redaction-Syntaxe et orthographe': 1,
    'redaction-Soin et lisibilité': 1,
  };

  const criteres = [
    { id: 'mobilisation', titre: '1. Connaissances', icon: <GraduationCap size={18} />, color: 'blue', items: ['Vocabulaire SES précis', 'Définitions concepts clés', 'Mécanismes théoriques'] },
    { id: 'exploitation', titre: '2. Documents', icon: <FileText size={18} />, color: 'purple', items: ['Sélection infos utiles', 'Lecture données (unités)', 'Lien documents/cours'] },
    { 
      id: 'raisonnement', 
      titre: '3. Raisonnement', 
      icon: <ClipboardCheck size={18} />, 
      color: 'emerald', 
      items: [
        'Intro [Accroche, Def, Ann Plan]', 
        'Réponse traitant le sujet', 
        'Arguments appuyés sur les documents', 
        'Paragraphes organisés et cohérents', 
        'Conclusion claire'
      ] 
    },
    { id: 'redaction', titre: '4. Rédaction', icon: <FileBadge size={18} />, color: 'orange', items: ['Syntaxe et orthographe', 'Soin et lisibilité'] }
  ];

  const options = [
    { label: '--', value: 0, color: 'bg-red-100 text-red-700' }, 
    { label: '-', value: 1, color: 'bg-orange-100 text-orange-700' }, 
    { label: '+', value: 2, color: 'bg-blue-100 text-blue-700' }, 
    { label: '++', value: 3, color: 'bg-green-100 text-green-700' }
  ];

  const handleEvalChange = (critereId, item, type, value) => {
    setEvaluations(prev => ({ ...prev, [`${critereId}-${item}`]: { ...prev[`${critereId}-${item}`], [type]: value } }));
  };

  const resetAll = () => { 
    if(window.confirm("Effacer les données pour un nouvel élève ?")) { 
      setStudentInfo({ identity: '', classe: '' }); 
      setEvaluations({}); 
      setGlobalComment(''); 
    }
  };

  const stats = useMemo(() => {
    let totalPointsObtenus = 0;
    let totalPointsMax = 0;
    const parCategorie = {};

    criteres.forEach(crit => {
      let catScorePondere = 0;
      let catWeightTotal = 0;

      crit.items.forEach(item => {
        const key = `${crit.id}-${item}`;
        const weight = itemWeights[key] || 1;
        const noteLabel = evaluations[key]?.note;
        const opt = options.find(o => o.label === noteLabel);
        
        const valScore = opt ? opt.value : 0;
        catScorePondere += (valScore * weight);
        catWeightTotal += (3 * weight);
      });

      parCategorie[crit.id] = catWeightTotal > 0 ? (catScorePondere / catWeightTotal) * 100 : 0;
      
      const catCoeff = parseFloat(catCoeffs[crit.id]) || 0;
      totalPointsObtenus += (catWeightTotal > 0 ? (catScorePondere / catWeightTotal) : 0) * catCoeff;
      totalPointsMax += catCoeff;
    });

    const noteBrute = totalPointsMax > 0 ? (totalPointsObtenus / totalPointsMax) * 20 : 0;
    return { 
      note: (Math.ceil(noteBrute * 2) / 2).toFixed(1), 
      details: parCategorie 
    };
  }, [evaluations, catCoeffs]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 print:p-0 print:bg-white text-[14px]">
      
      {/* --- INTERFACE DE SAISIE --- */}
      <main className="max-w-6xl mx-auto space-y-4 print:hidden">
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Élève</label>
            <input type="text" className="w-full text-base font-semibold border-b-2 border-slate-100 outline-none focus:border-indigo-500 bg-transparent" value={studentInfo.identity} onChange={e => setStudentInfo({...studentInfo, identity: e.target.value})} placeholder="Nom Prénom" />
          </div>
          <div className="w-24">
            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Classe</label>
            <input type="text" className="w-full text-base font-semibold border-b-2 border-slate-100 outline-none focus:border-indigo-500 bg-transparent" value={studentInfo.classe} onChange={e => setStudentInfo({...studentInfo, classe: e.target.value})} placeholder="1ère..." />
          </div>
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg ml-auto">
            <span className="text-xs font-bold uppercase opacity-70 italic tracking-wider">Note Finale :</span>
            <span className="text-2xl font-black">{stats.note}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg" title="Réinitialiser"><Trash2 size={20} /></button>
            <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"><Download size={18} /> Export PDF</button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteres.map((crit) => (
            <section key={crit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className={`px-4 py-3 border-b flex justify-between items-center bg-slate-50/80`}>
                <div className="flex items-center gap-2 font-black text-xs uppercase text-slate-700 tracking-tight">{crit.icon} {crit.titre}</div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200" title="Modifier le coefficient de cette catégorie">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Coeff.</span>
                    <input 
                        type="number" 
                        step="0.5"
                        value={catCoeffs[crit.id]} 
                        onChange={(e) => setCatCoeffs({...catCoeffs, [crit.id]: e.target.value})}
                        className="w-8 text-xs font-black text-center text-indigo-600 outline-none"
                    />
                </div>
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                {crit.items.map((item, idx) => {
                  const key = `${crit.id}-${item}`; 
                  const cur = evaluations[key] || { note: '', comment: '' };
                  const weight = itemWeights[key] || 1;
                  return (
                    <div key={idx} className="p-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex-1 pr-4">
                            <p className="text-sm font-bold text-slate-800 leading-tight">{item}</p>
                        </div>
                        <div className="flex gap-1">
                          {options.map(opt => (
                            <button 
                                key={opt.label} 
                                onClick={() => handleEvalChange(crit.id, item, 'note', opt.label)} 
                                className={`w-8 h-8 text-[11px] font-black rounded-md border transition-all ${cur.note === opt.label ? opt.color + ' border-current scale-110 shadow-sm' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'}`}
                            >
                                {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Observation rapide..." 
                        className="w-full text-[11px] text-slate-500 italic bg-slate-50/50 px-2 py-1.5 rounded border border-transparent focus:border-slate-100 outline-none" 
                        value={cur.comment} 
                        onChange={e => handleEvalChange(crit.id, item, 'comment', e.target.value)} 
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-black text-xs uppercase tracking-wider"><AlertCircle size={16} /> Appréciation générale</div>
          <textarea rows="3" className="w-full text-sm border border-slate-100 rounded-lg p-3 outline-none resize-none focus:border-indigo-500" placeholder="Conseils personnalisés pour l'élève..." value={globalComment} onChange={e => setGlobalComment(e.target.value)} />
        </section>
      </main>

      {/* --- VUE PDF --- */}
      <div className="hidden print:block max-w-[210mm] mx-auto p-8 text-slate-900 leading-tight">
        <div className="flex justify-between items-center border-b-4 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Grille d'Évaluation SES</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Épreuve Composée (EC3) - Classe de Première</p>
          </div>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-center min-w-[120px]">
            <div className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Note Finale</div>
            <div className="text-3xl font-black">{stats.note} <span className="text-sm opacity-40 italic">/ 20</span></div>
          </div>
        </div>

        <div className="flex gap-12 mb-8 text-xs font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-4">
          <div>Élève : <span className="text-indigo-600 ml-2">{studentInfo.identity || '___________________'}</span></div>
          <div>Classe : <span className="text-indigo-600 ml-2">{studentInfo.classe || '__________'}</span></div>
          <div className="ml-auto">Date : <span className="text-slate-400 font-normal">{new Date().toLocaleDateString('fr-FR')}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
          {criteres.map(crit => (
            <div key={crit.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    {crit.titre.split('. ')[1]} <span className="text-slate-300 ml-1 text-[8px]">(coeff. {catCoeffs[crit.id]})</span>
                </span>
                <span className="text-[10px] font-black text-indigo-600">{Math.round(stats.details[crit.id])}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: `${stats.details[crit.id]}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 mb-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center border-b border-slate-100 pb-2">Observations détaillées</h2>
          <div className="space-y-4">
            {criteres.map(crit => {
              const obs = crit.items.filter(i => evaluations[`${crit.id}-${i}`]?.note || evaluations[`${crit.id}-${i}`]?.comment);
              if (obs.length === 0) return null;
              return (
                <div key={crit.id} className="break-inside-avoid">
                  <h3 className="text-[10px] font-black uppercase text-indigo-600 mb-2 px-1 border-l-2 border-indigo-600 ml-1 italic">{crit.titre}</h3>
                  <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-3 space-y-2">
                    {obs.map(i => {
                      const e = evaluations[`${crit.id}-${i}`];
                      return (
                        <div key={i} className="text-[11px] leading-relaxed flex items-start">
                          <span className={`font-black mr-3 shrink-0 min-w-[32px] text-center rounded px-1 ${
                              e.note === '++' ? 'text-green-600 bg-green-100' : 
                              e.note === '+' ? 'text-blue-600 bg-blue-100' :
                              e.note === '-' ? 'text-orange-600 bg-orange-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {e.note || '?'}
                          </span>
                          <div className="flex-1">
                            <span className="text-slate-900 font-bold">{i}</span>
                            {e.comment && <p className="text-slate-500 italic mt-0.5">— {e.comment}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl break-inside-avoid shadow-sm">
          <h2 className="text-[10px] font-black uppercase mb-2 tracking-[0.2em] flex items-center gap-2">
            <AlertCircle size={14} /> Bilan & Conseils de progression
          </h2>
          <p className="text-[12px] leading-relaxed font-medium whitespace-pre-wrap italic opacity-90">
            {globalComment || "Observations à compléter pour guider l'élève."}
          </p>
        </div>

        <footer className="mt-12 pt-6 border-t border-slate-100 text-[8px] text-center text-slate-300 font-bold uppercase tracking-[0.6em]">
          Enseignement de Spécialité SES • Grille d'évaluation Lycée
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 10mm 15mm; }
          body { -webkit-print-color-adjust: exact; background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;