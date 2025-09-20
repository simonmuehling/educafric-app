import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ManualBulletinFormProps {
  studentId?: string;
  trimestre?: string;
  classId?: string;
  academicYear?: string;
}

/**************************** HELPERS ****************************/
const performanceGrid = [
  { min: 18, max: 20.0001, grade: "A+", label: "CTBA", remark: "Compétences très bien acquises" },
  { min: 16, max: 18, grade: "A", label: "CTBA", remark: "Compétences très bien acquises" },
  { min: 15, max: 16, grade: "B+", label: "CBA", remark: "Compétences bien acquises" },
  { min: 14, max: 15, grade: "B", label: "CBA", remark: "Compétences bien acquises" },
  { min: 12, max: 14, grade: "C+", label: "CA", remark: "Compétences acquises" },
  { min: 10, max: 12, grade: "C", label: "CMA", remark: "Compétences moyennement acquises" },
  { min: 0, max: 10, grade: "D", label: "CNA", remark: "Compétences non acquises" },
];

function coteFromNote(note20: string | number): string {
  if (note20 == null || isNaN(Number(note20))) return "";
  const n = Number(note20);
  const r = performanceGrid.find(g => n >= g.min && n < g.max);
  return r ? r.grade : "";
}

function appreciationFromNote(note20: string | number): string {
  if (note20 == null || isNaN(Number(note20))) return "";
  const n = Number(note20);
  const r = performanceGrid.find(g => n >= g.min && n < g.max);
  return r ? r.remark : "";
}

function round2(x: number): number { 
  return Math.round((Number(x) + Number.EPSILON) * 100) / 100; 
}

/**************************** DONNÉES ****************************/
const defaultSubjects = [
  { matiere: "ANGLAIS", coef: 3 },
  { matiere: "INFORMATIQUE", coef: 2 },
  { matiere: "CULTURES NATIONALES", coef: 1 },
  { matiere: "ÉDUCATION ARTISTIQUE ET CULTURELLE", coef: 1 },
  { matiere: "FRANÇAIS", coef: 6 },
  { matiere: "LANGUES NATIONALES", coef: 1 },
  { matiere: "LETTRES CLASSIQUES (LATIN)", coef: 2 },
  { matiere: "ÉDUCATION À LA CITOYENNETÉ ET À LA MORALE", coef: 2 },
  { matiere: "GÉOGRAPHIE", coef: 2 },
  { matiere: "HISTOIRE", coef: 2 },
  { matiere: "MATHÉMATIQUES", coef: 4 },
  { matiere: "SCIENCES", coef: 2 },
  { matiere: "ÉCONOMIE SOCIALE ET FAMILIALE (ESF)", coef: 1 },
  { matiere: "ÉDUCATION PHYSIQUE ET SPORTIVE (EPS)", coef: 2 },
  { matiere: "TRAVAIL MANUEL (TM)", coef: 1 },
];

const defaultCompetences: Record<string, string> = {
  "ANGLAIS": "Use appropriate language skills…",
  "INFORMATIQUE": "Identifier les éléments matériels / logiciels…",
};

interface SubjectRow {
  matiere: string;
  enseignant: string;
  competences: string;
  n20: string | number;
  m20: string | number;
  coef: number;
  cote: string;
  appreciation: string;
}

/**************************** COMPOSANT PRINCIPAL ****************************/
export default function ManualBulletinForm({ 
  studentId = "demo-001", 
  trimestre = "Premier",
  classId = "1",
  academicYear = "2025/2026" 
}: ManualBulletinFormProps) {
  const [loading, setLoading] = useState(true);
  const [eleve, setEleve] = useState<any>(null);
  const [rows, setRows] = useState<SubjectRow[]>(() => 
    defaultSubjects.map(s => ({
      matiere: s.matiere,
      enseignant: "",
      competences: defaultCompetences[s.matiere] || "",
      n20: "",
      m20: "",
      coef: s.coef,
      cote: "",
      appreciation: "",
    }))
  );

  const [meta, setMeta] = useState({
    annee: academicYear,
    trimestre: trimestre || "Premier",
    avertissements: 0,
    blames: 0,
    absJust: 0,
    absNonJust: 0,
    retards: 0,
    exclusions: 0,
    consignes: 0,
    appEleve: "",
    visaParent: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer le profil étudiant via notre API
  const { data: studentProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/students', studentId],
    enabled: !!studentId && studentId !== "demo-001"
  });

  // Données d'exemple pour démo si pas d'ID spécifique
  useEffect(() => {
    if (studentId === "demo-001" || !studentId) {
      setEleve({
        id: "demo-001",
        nom: "NDAH John",
        sexe: "M",
        identifiantUnique: "STU-6E-00045",
        redoublant: false,
        dateNaissance: "2013-04-21",
        lieuNaissance: "Douala",
        classe: "6ème",
        effectif: 58,
        professeurPrincipal: "Mme NGONO",
        parents: { noms: "M. & Mme NDONGO", contacts: "+237 6xx xx xx xx" },
        photoUrl: "",
        etablissement: { nom: "LYCÉE DE MENDONG", immatriculation: "LDM-2025-001" },
      });
      setLoading(false);
    } else if (studentProfile) {
      // Adapter les données de notre API au format attendu
      setEleve({
        id: studentProfile.id,
        nom: `${studentProfile.firstName} ${studentProfile.lastName}`,
        sexe: "M", // TODO: récupérer depuis l'API
        identifiantUnique: studentProfile.matricule,
        redoublant: false,
        dateNaissance: "2013-04-21", // TODO: récupérer depuis l'API
        lieuNaissance: "Douala", // TODO: récupérer depuis l'API
        classe: studentProfile.className,
        effectif: 58, // TODO: récupérer depuis l'API
        professeurPrincipal: "Mme NGONO", // TODO: récupérer depuis l'API
        parents: { noms: "M. & Mme Parent", contacts: "+237 6xx xx xx xx" },
        photoUrl: "",
        etablissement: { nom: "Institut Educafric", immatriculation: "EDU-2025-001" },
      });
      setLoading(false);
    }
  }, [studentId, studentProfile]);

  // Calculs automatiques
  const totals = useMemo(() => {
    const withMx = rows.map(r => ({
      ...r,
      m20Num: Number(r.m20) || 0,
      coefNum: Number(r.coef) || 0,
    }));
    const totalCoef = withMx.reduce((s, r) => s + r.coefNum, 0);
    const totalMxCoef = withMx.reduce((s, r) => s + r.m20Num * r.coefNum, 0);
    const moyenne = totalCoef > 0 ? round2(totalMxCoef / totalCoef) : 0;
    const cote = coteFromNote(moyenne);
    return { totalCoef, totalMxCoef: round2(totalMxCoef), moyenne, cote };
  }, [rows]);

  function updateRow(idx: number, patch: Partial<SubjectRow>) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  function addRow() {
    setRows(prev => ([...prev, { 
      matiere: "", 
      enseignant: "", 
      competences: "", 
      n20: "", 
      m20: "", 
      coef: 1, 
      cote: "", 
      appreciation: "" 
    }]));
  }

  function removeRow(i: number) { 
    setRows(prev => prev.filter((_, idx) => idx !== i)); 
  }

  // Sauvegarde via notre API comprehensive bulletins
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (studentId === "demo-001") {
        console.log("[DEMO] Bulletin à sauvegarder:", payload);
        return { ok: true };
      }
      
      return apiRequest('/api/comprehensive-bulletins/teacher-submission', {
        method: 'POST',
        body: JSON.stringify({
          studentId: parseInt(studentId || "0"),
          classId: parseInt(classId || "0"),
          term: trimestre,
          academicYear,
          manualData: {
            subjectGrades: payload.lignes.map((ligne: any) => ({
              subjectName: ligne.matiere,
              teacherName: ligne.enseignant,
              competencies: ligne.competences,
              grade1: ligne.n20,
              grade2: null, // N'utilise que M/20
              termAverage: ligne.m20,
              coefficient: ligne.coef,
              maxGrade: 20,
              cote: ligne.cote,
              comment: ligne.appreciation
            })),
            discipline: payload.discipline,
            generalAppreciation: payload.appEleve,
            parentVisa: payload.visaParent
          },
          generationOptions: {
            includeComments: true,
            includeRankings: true,
            includeStatistics: true,
            includeUnjustifiedAbsences: true,
            includeJustifiedAbsences: true,
            includeLateness: true,
            includeDetentions: true,
            includeCoef: true,
            includeCTBA: true,
            includeCBA: true,
            includeCA: true,
            includeCMA: true,
            includeCOTE: true,
            includeWorkAppreciation: true,
            includeClassCouncilDecisions: true,
            generationFormat: 'pdf' as const
          }
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Bulletin sauvegardé",
        description: "Les données ont été transmises pour traitement par le directeur"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/comprehensive-bulletins'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder le bulletin",
        variant: "destructive"
      });
    }
  });

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      eleve,
      meta,
      trimestre: meta.trimestre,
      annee: meta.annee,
      lignes: rows.map(r => ({
        matiere: r.matiere,
        enseignant: r.enseignant,
        competences: r.competences,
        n20: Number(r.n20) || null,
        m20: Number(r.m20) || null,
        coef: Number(r.coef) || 0,
        mxcoef: Number(r.m20 || 0) * Number(r.coef || 0),
        cote: r.cote || coteFromNote(r.m20),
        appreciation: r.appreciation || appreciationFromNote(r.m20),
      })),
      totaux: totals,
      discipline: {
        avertissements: Number(meta.avertissements)||0,
        blames: Number(meta.blames)||0,
        absJust: Number(meta.absJust)||0,
        absNonJust: Number(meta.absNonJust)||0,
        retards: Number(meta.retards)||0,
        exclusions: Number(meta.exclusions)||0,
        consignes: Number(meta.consignes)||0,
      },
      appEleve: meta.appEleve,
      visaParent: meta.visaParent,
      date: new Date().toISOString(),
    };
    
    saveMutation.mutate(payload);
  }

  if (loading || profileLoading) {
    return (
      <div className="p-6 text-sm flex items-center justify-center" data-testid="loading-state">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Chargement du profil élève…</span>
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="p-6 text-sm text-red-600" data-testid="error-state">
        Erreur: Impossible de charger le profil de l'élève
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6" data-testid="manual-bulletin-form">
      {/* En-tête */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">BULLETIN SCOLAIRE – {meta.trimestre?.toUpperCase()} TRIMESTRE</h1>
              <p className="text-sm text-gray-500">Année scolaire : {meta.annee}</p>
            </div>
            <div>
              {/* Logo/Immatriculation */}
              <div className="text-right text-xs text-gray-500">
                <div>{eleve?.etablissement?.nom}</div>
                <div>{eleve?.etablissement?.immatriculation}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Info label="Nom & Prénoms" value={eleve.nom} />
            <Info label="Classe" value={eleve.classe} />
            <Info label="Date & Lieu de naissance" value={`${eleve.dateNaissance} à ${eleve.lieuNaissance}`} />
            <Info label="Genre" value={eleve.sexe} />
            <Info label="Identifiant Unique" value={eleve.identifiantUnique} />
            <Info label="Redoublant" value={eleve.redoublant ? "Oui" : "Non"} />
            <Info label="Effectif" value={String(eleve.effectif)} />
            <Info label="Professeur principal" value={eleve.professeurPrincipal} />
            <Info label="Parents / Tuteurs" value={`${eleve.parents.noms} – ${eleve.parents.contacts}`} className="sm:col-span-2" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold mb-2">Paramètres</h2>
          <div className="space-y-2 text-sm">
            <LabeledInput 
              label="Année scolaire" 
              value={meta.annee} 
              onChange={v => setMeta(m => ({...m, annee:v}))} 
              data-testid="input-academic-year"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Trimestre</label>
              <select 
                className="w-full border rounded-xl px-3 py-2" 
                value={meta.trimestre} 
                onChange={e=>setMeta(m=>({...m,trimestre:e.target.value}))}
                data-testid="select-trimester"
              >
                <option value="Premier">Premier</option>
                <option value="Deuxième">Deuxième</option>
                <option value="Troisième">Troisième</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table de saisie */}
      <form onSubmit={onSave} className="mt-6 bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <Th>MATIÈRE</Th>
                <Th>Enseignant</Th>
                <Th className="w-80">Compétences évaluées</Th>
                <Th>N/20</Th>
                <Th>M/20</Th>
                <Th>Coef</Th>
                <Th>M x coef</Th>
                <Th>COTE</Th>
                <Th className="w-64">Appréciations (visa enseignant)</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const mx = round2((Number(r.m20)||0) * (Number(r.coef)||0));
                const cote = r.cote || coteFromNote(r.m20);
                return (
                  <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/30"}>
                    <Td>
                      <input 
                        className="w-44 border rounded-lg px-2 py-1" 
                        value={r.matiere} 
                        onChange={e=>updateRow(i,{matiere:e.target.value})} 
                        list="matieres-list"
                        data-testid={`input-subject-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        className="w-44 border rounded-lg px-2 py-1" 
                        value={r.enseignant} 
                        onChange={e=>updateRow(i,{enseignant:e.target.value})} 
                        placeholder="M/Mme…"
                        data-testid={`input-teacher-${i}`}
                      />
                    </Td>
                    <Td>
                      <textarea 
                        className="w-full border rounded-lg px-2 py-1" 
                        rows={2} 
                        value={r.competences} 
                        onChange={e=>updateRow(i,{competences:e.target.value})}
                        data-testid={`textarea-competencies-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="20" 
                        className="w-20 border rounded-lg px-2 py-1" 
                        value={r.n20} 
                        onChange={e=>updateRow(i,{n20:e.target.value})}
                        data-testid={`input-n20-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="20" 
                        className="w-20 border rounded-lg px-2 py-1" 
                        value={r.m20} 
                        onChange={e=>updateRow(i,{m20:e.target.value})}
                        data-testid={`input-m20-${i}`}
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="1" 
                        min="0" 
                        className="w-16 border rounded-lg px-2 py-1" 
                        value={r.coef} 
                        onChange={e=>updateRow(i,{coef:parseInt(e.target.value) || 0})}
                        data-testid={`input-coef-${i}`}
                      />
                    </Td>
                    <Td>
                      <span className="px-2 py-1 inline-block bg-gray-100 rounded-lg">{mx}</span>
                    </Td>
                    <Td>
                      <input 
                        className="w-16 border rounded-lg px-2 py-1" 
                        value={cote} 
                        onChange={e=>updateRow(i,{cote:e.target.value})}
                        data-testid={`input-cote-${i}`}
                      />
                    </Td>
                    <Td>
                      <textarea 
                        className="w-full border rounded-lg px-2 py-1" 
                        rows={2} 
                        value={r.appreciation} 
                        onChange={e=>updateRow(i,{appreciation:e.target.value})} 
                        placeholder={appreciationFromNote(r.m20)}
                        data-testid={`textarea-appreciation-${i}`}
                      />
                    </Td>
                    <Td>
                      <button 
                        type="button" 
                        onClick={()=>removeRow(i)} 
                        className="text-red-600 hover:underline"
                        data-testid={`button-remove-${i}`}
                      >
                        Suppr.
                      </button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <Td colSpan={5}>TOTAL</Td>
                <Td>{totals.totalCoef}</Td>
                <Td>{totals.totalMxCoef}</Td>
                <Td>{totals.cote}</Td>
                <Td colSpan={2}></Td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between">
          <button 
            type="button" 
            onClick={addRow} 
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
            data-testid="button-add-subject"
          >
            + Ajouter une matière
          </button>
          <div className="text-sm">
            Moyenne générale : <span className="font-semibold" data-testid="text-average">{totals.moyenne}/20</span>
          </div>
        </div>

        <hr/>

        {/* Discipline / Profil classe */}
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Discipline</h3>
            <div className="grid grid-cols-2 gap-2">
              <NumberField 
                label="Absences justifiées (h)" 
                value={meta.absJust} 
                onChange={v=>setMeta(m=>({...m,absJust:v}))}
                data-testid="input-justified-absences"
              />
              <NumberField 
                label="Absences non justifiées (h)" 
                value={meta.absNonJust} 
                onChange={v=>setMeta(m=>({...m,absNonJust:v}))}
                data-testid="input-unjustified-absences"
              />
              <NumberField 
                label="Retards (fois)" 
                value={meta.retards} 
                onChange={v=>setMeta(m=>({...m,retards:v}))}
                data-testid="input-lateness"
              />
              <NumberField 
                label="Avertissements" 
                value={meta.avertissements} 
                onChange={v=>setMeta(m=>({...m,avertissements:v}))}
                data-testid="input-warnings"
              />
              <NumberField 
                label="Blâmes" 
                value={meta.blames} 
                onChange={v=>setMeta(m=>({...m,blames:v}))}
                data-testid="input-blames"
              />
              <NumberField 
                label="Exclusions (jours)" 
                value={meta.exclusions} 
                onChange={v=>setMeta(m=>({...m,exclusions:v}))}
                data-testid="input-exclusions"
              />
              <NumberField 
                label="Consignes (heures)" 
                value={meta.consignes} 
                onChange={v=>setMeta(m=>({...m,consignes:v}))}
                data-testid="input-detentions"
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold mb-2">Appréciations générales</h3>
            <div className="grid gap-2">
              <LabeledTextArea 
                label="Appréciation du travail de l'élève (points forts / à améliorer)" 
                value={meta.appEleve} 
                onChange={v=>setMeta(m=>({...m,appEleve:v}))} 
                rows={4}
                data-testid="textarea-general-appreciation"
              />
              <LabeledInput 
                label="Visa du parent / Tuteur" 
                value={meta.visaParent} 
                onChange={v=>setMeta(m=>({...m,visaParent:v}))}
                data-testid="input-parent-visa"
              />
            </div>
          </div>
        </div>

        <div className="p-4 flex gap-3 justify-end">
          <button 
            type="button" 
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200" 
            onClick={()=>window.print?.()}
            data-testid="button-print"
          >
            Imprimer
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            {saveMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <datalist id="matieres-list">
        {defaultSubjects.map((s, i) => (
          <option key={i} value={s.matiere} />
        ))}
      </datalist>
    </div>
  );
}

/**************************** SOUS-COMPOSANTS ****************************/
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-[11px] sm:text-xs text-gray-600 ${className}`}>{children}</th>;
}

function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-3 py-2 align-top ${className}`}>{children}</td>;
}

function Info({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`grid grid-cols-3 ${className}`}>
      <div className="col-span-1 text-gray-500">{label}</div>
      <div className="col-span-2 font-medium">{value || "—"}</div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text", "data-testid": dataTestId }: { 
  label: string; 
  value: string | number; 
  onChange: (value: string) => void; 
  type?: string;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input 
        type={type} 
        className="w-full border rounded-xl px-3 py-2" 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        data-testid={dataTestId}
      />
    </div>
  );
}

function LabeledTextArea({ label, value, onChange, rows = 3, "data-testid": dataTestId }: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void; 
  rows?: number;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <textarea 
        rows={rows} 
        className="w-full border rounded-xl px-3 py-2" 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        data-testid={dataTestId}
      />
    </div>
  );
}

function NumberField({ label, value, onChange, "data-testid": dataTestId }: { 
  label: string; 
  value: string | number; 
  onChange: (value: string) => void;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input 
        type="number" 
        className="w-full border rounded-xl px-3 py-2" 
        value={value} 
        onChange={e=>onChange(e.target.value)}
        data-testid={dataTestId}
      />
    </div>
  );
}