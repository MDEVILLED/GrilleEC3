import React, { useState, useMemo, useRef } from 'react';
import { 
  GraduationCap, ClipboardCheck, FileText, 
  Download, AlertCircle, FileBadge, Trash2, Save, Upload, FileJson
} from 'lucide-react';

const App = () => {
  // --- ÉTAT INITIAL ---
  const [studentInfo, setStudentInfo] = useState({ identity: '', classe: '' });
  const [evaluations, setEvaluations] = useState({});
  const [globalComment, setGlobalComment] = useState('');
  const [catCoeffs, setCatCoeffs] = useState({ 
    mobilisation: 6, exploitation: 5, raisonnement: 7, redaction: 2 
  });

  const fileInputRef = useRef(null);

  // --- FONCTIONS DE SAUVEGARDE MANUELLE (FICHIER) ---
  
  // Exporter vers un fichier JSON
  const exportToJson = () => {
    const data = {
      studentInfo,
      evaluations,
      globalComment,
      catCoeffs,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `Eval_SES_${studentInfo.identity.replace(/\s+/g, '_') || 'SansNom'}_${new Date().toLocaleDateString('fr-CA')}.json`;
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importer depuis un fichier JSON
  const importFromJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.evaluations) {
          setStudentInfo(parsed.studentInfo || { identity: '', classe: '' });
          setEvaluations(parsed.evaluations || {});
          setGlobalComment(parsed.globalComment || '');
          if (parsed.catCoeffs) setCatCoeffs(parsed.catCoeffs);
          // Message de succès discret
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier. Assurez-vous qu'il s'agit d'un fichier de sauvegarde valide.");
      }
    };
    reader.readAsText(file);
    // Reset l'input pour pouvoir ré-importer le même fichier si besoin
    event.target.value = null;
  };

  // --- CONFIGURATION ---
  const itemWeights = {
    'mobilisation-Vocabulaire SES précis': 1,
    'mobilisation-Définitions concepts clés': 2,
    'mobilisation-Mécanismes théoriques': 2,
    'exploitation-Sélection infos utiles': 1,
    'exploitation-Lecture données (unités)': 1,
    'exploitation-Lien documents/cours': 2,
    'raisonnement-Intro [Accroche, Def, Ann Plan]': 1.5,
    'raisonnement-Réponse traitant le sujet': 3,
    'raisonnement-Arguments appuyés sur les documents': 3,
    'raisonnement-Paragraphes organisés et cohérents': 2,
    'raisonnement-Conclusion claire': 1,
    'redaction-Syntaxe et orthographe': 1,
    'redaction-Soin et lisibilité': 1,
  };

  const criteres = [
    { id: 'mobilisation', titre: '1. Connaissances', icon: <GraduationCap size={18} />, items: ['Vocabulaire SES précis', 'Définitions concepts clés', 'Mécanismes théoriques'] },
    { id: 'exploitation', titre: '2. Documents', icon: <FileText size={18} />, items: ['Sélection infos utiles', 'Lecture données (unités)', 'Lien documents/cours'] },
    { id: 'raisonnement', titre: '3. Raisonnement', icon: <ClipboardCheck size={18} />, items: ['Intro [Accroche, Def, Ann Plan]', 'Réponse traitant le sujet', 'Arguments appuyés sur les documents', 'Paragraphes organisés et cohérents', 'Conclusion claire'] },
    { id: 'redaction', titre: '4. Rédaction', icon: <FileBadge size={18} />, items: ['Syntaxe et orthographe', 'Soin et lisibilité'] }
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
    if(window.confirm("Tout effacer pour un nouvel élève ? (Pensez à sauvegarder si besoin)")) { 
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
        const opt = options.find(o => o.label === evaluations[key]?.note);
        catScorePondere += ((opt ? opt.value : 0) * weight);
        catWeightTotal += (3 * weight);
      });
      parCategorie[crit.id] = catWeightTotal > 0 ? (catScorePondere / catWeightTotal) * 100 : 0;
      const catCoeff = parseFloat(catCoeffs[crit.id]) || 0;
      totalPointsObtenus += (catWeightTotal > 0 ? (catScorePondere / catWeightTotal) : 0) * catCoeff;
      totalPointsMax += catCoeff;
    });

    const noteBrute = totalPointsMax > 0 ? (totalPointsObtenus / totalPointsMax) * 20 : 0;
    return { note: (Math.ceil(noteBrute * 2) / 2).toFixed(1), details: parCategorie };
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
          
          {/* Actions de fichiers */}
          <div className="flex gap-2 ml-auto">
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
              title="Charger une sauvegarde .json"
            >
              <Upload size={16} /> Charger
            </button>
            <input type="file" ref={fileInputRef} onChange={importFromJson} accept=".json" className="hidden" />
            
            <button 
              onClick={exportToJson}
              className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Télécharger la sauvegarde sur mon PC"
            >
              <Save size={16} /> Sauvegarder .json
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg">
            <span className="text-xs font-bold uppercase opacity-70 italic">Note :</span>
            <span className="text-2xl font-black">{stats.note}</span>
          </div>
          
          <div className="flex gap-2">
            <button onClick={resetAll} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-lg" title="Effacer tout"><Trash2 size={20} /></button>
            <button onClick={() => window.print()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"><Download size={18} /> Export PDF</button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteres.map((crit) => (
            <section key={crit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="px-4 py-3 border-b flex justify-between items-center bg-slate-50/80">
                <div className="flex items-center gap-2 font-black text-xs uppercase text-slate-700">{crit.icon} {crit.titre}</div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Coeff.</span>
                    <input type="number" step="0.5" value={catCoeffs[crit.id]} onChange={(e) => setCatCoeffs({...catCoeffs, [crit.id]: e.target.value})} className="w-8 text-xs font-black text-center text-indigo-600 outline-none" />
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {crit.items.map((item, idx) => {
                  const key = `${crit.id}-${item}`; 
                  const cur = evaluations[key] || { note: '', comment: '' };
                  return (
                    <div key={idx} className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-slate-800 flex-1 pr-2">{item}</p>
                        <div className="flex gap-1">
                          {options.map(opt => (
                            <button key={opt.label} onClick={() => handleEvalChange(crit.id, item, 'note', opt.label)} className={`w-8 h-8 text-[11px] font-black rounded-md border transition-all ${cur.note === opt.label ? opt.color + ' border-current' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'}`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      <input type="text" placeholder="Observation..." className="w-full text-[11px] text-slate-500 italic bg-slate-50/50 px-2 py-1.5 rounded outline-none" value={cur.comment} onChange={e => handleEvalChange(crit.id, item, 'comment', e.target.value)} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-slate-700 font-black text-xs uppercase tracking-wider"><AlertCircle size={16} /> Appréciation générale</div>
          <textarea rows="3" className="w-full text-sm border border-slate-100 rounded-lg p-3 outline-none resize-none focus:border-indigo-500" placeholder="Conseils personnalisés..." value={globalComment} onChange={e => setGlobalComment(e.target.value)} />
        </section>
      </main>

      {/* --- VUE PDF (Grille 2x2 optimisée) --- */}
      <div className="hidden print:block max-w-[210mm] mx-auto p-6 text-slate-900 leading-tight">
        <header className="flex justify-between items-center border-b-4 border-slate-900 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-black uppercase italic">Grille d'Évaluation SES</h1>
            <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.2em]">Spécialité SES - Première</p>
          </div>
          <div className="bg-slate-900 text-white px-5 py-2 rounded-xl text-center">
            <div className="text-[9px] font-black uppercase opacity-60">Note Finale</div>
            <div className="text-2xl font-black">{stats.note} <span className="text-xs opacity-40">/ 20</span></div>
          </div>
        </header>

        <div className="flex gap-8 mb-4 text-[11px] font-bold uppercase text-slate-700 border-b border-slate-100 pb-2">
          <span>Élève : <span className="text-indigo-600">{studentInfo.identity || '___________________'}</span></span>
          <span>Classe : <span className="text-indigo-600">{studentInfo.classe || '__________'}</span></span>
                  </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {criteres.map(crit => (
            <div key={crit.id} className="space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase">
                <span>{crit.titre.split('. ')[1]}</span>
                <span>{Math.round(stats.details[crit.id])}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-slate-900 rounded-full" style={{ width: `${stats.details[crit.id]}%` }} /></div>
            </div>
          ))}
        </div>

        {/* Grille 2 par 2 pour les observations */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {criteres.map(crit => {
            const obs = crit.items.filter(i => evaluations[`${crit.id}-${i}`]?.note || evaluations[`${crit.id}-${i}`]?.comment);
            return (
              <div key={crit.id} className="border border-slate-100 rounded-lg p-2 bg-slate-50/30 break-inside-avoid">
                <h3 className="text-[9px] font-black uppercase text-indigo-600 mb-2 border-b border-indigo-100 pb-1 flex justify-between">
                  {crit.titre} <span className="text-slate-400 opacity-50">Coeff. {catCoeffs[crit.id]}</span>
                </h3>
                <div className="space-y-2">
                  {obs.length > 0 ? obs.map(i => {
                    const e = evaluations[`${crit.id}-${i}`];
                    return (
                      <div key={i} className="text-[10px] leading-tight">
                        <div className="flex gap-2">
                          <span className="font-black text-indigo-600 min-w-[18px]">{e.note || '-'}</span>
                          <span className="font-bold text-slate-800">{i}</span>
                        </div>
                        {e.comment && <p className="text-slate-500 italic ml-6 mt-0.5">— {e.comment}</p>}
                      </div>
                    );
                  }) : <p className="text-[9px] text-slate-300 italic text-center py-2">Aucune évaluation</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl break-inside-avoid">
          <h2 className="text-[9px] font-black uppercase mb-1 tracking-widest flex items-center gap-2">
            <AlertCircle size={12} /> Bilan & Conseils de progression
          </h2>
          <p className="text-[11px] leading-relaxed italic opacity-90 whitespace-pre-wrap">
            {globalComment || "Observations à compléter."}
          </p>
        </div>

        <footer className="mt-4 pt-4 border-t border-slate-100 text-[8px] text-center text-slate-300 font-bold uppercase tracking-[0.4em]">
          Enseignement de Spécialité SES • Document de suivi pédagogique
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 8mm 12mm; }
          body { -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default App;