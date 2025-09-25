import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Helper functions
const round2 = (n: number): number => Math.round(n * 100) / 100;

const coteFromNote = (note: number): string => {
  if (note >= 18) return 'A+';
  if (note >= 16) return 'A';  
  if (note >= 15) return 'B+';
  if (note >= 14) return 'B';
  if (note >= 12) return 'C+';
  if (note >= 10) return 'C';
  return 'D';
};

const calculateMoyenneFinale = (note1: string | number, note2: string | number): number => {
  const n1 = Number(note1) || 0;
  const n2 = Number(note2) || 0;
  
  if (n1 > 0 && n2 > 0) {
    return round2((n1 + n2) / 2);
  } else if (n1 > 0) {
    return round2(n1);
  } else if (n2 > 0) {
    return round2(n2);
  }
  
  return 0;
};

// Shared grade entry row interface
export interface SubjectRow {
  matiere: string;
  enseignant: string;
  competence1: string;
  competence2: string;
  note1: string | number;
  note2: string | number;
  moyenneFinale: string | number;
  coef: number;
  totalPondere: number;
  cote: string;
  appreciation: string;
}

interface SharedReportEntryGridProps {
  rows: SubjectRow[];
  onUpdateRow: (index: number, updates: Partial<SubjectRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  availableSubjects?: Array<{ matiere: string; coef: number }>;
  getCoefficientForSubject?: (subjectName: string) => number;
  readOnly?: boolean;
  hideActions?: boolean;
  hideTeacherColumn?: boolean;
  hideSignature?: boolean; // For teacher mode - hide signature features
  hidePrintExport?: boolean; // For teacher mode - hide print/export features
  className?: string;
}

// Table helper components
const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <th className={`border border-gray-300 px-2 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-xs font-semibold text-center ${className}`}>
    {children}
  </th>
);

const Td: React.FC<{ children: React.ReactNode; className?: string; 'data-testid'?: string }> = ({ children, className = "", 'data-testid': testId }) => (
  <td className={`border border-gray-300 px-1 py-1 text-center align-middle ${className}`} data-testid={testId}>
    {children}
  </td>
);

export const SharedReportEntryGrid: React.FC<SharedReportEntryGridProps> = ({
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  availableSubjects = [],
  getCoefficientForSubject = () => 1,
  readOnly = false,
  hideActions = false,
  hideTeacherColumn = false,
  hideSignature = false,
  hidePrintExport = false,
  className = ""
}) => {
  const { language } = useLanguage();

  const updateRow = (index: number, updates: Partial<SubjectRow>) => {
    onUpdateRow(index, updates);
  };

  // Calculate totals
  const totalCoefficients = rows.reduce((sum, r) => sum + (Number(r.coef) || 0), 0);
  const totalPondere = rows.reduce((sum, r) => {
    const moyenneFinale = Number(r.moyenneFinale) || calculateMoyenneFinale(r.note1, r.note2);
    return sum + round2(moyenneFinale * (Number(r.coef) || 0));
  }, 0);
  const moyenneGenerale = totalCoefficients > 0 ? round2(totalPondere / totalCoefficients) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Subject datalist for autocomplete */}
      <datalist id="class-subjects-list">
        {availableSubjects.map((s, idx) => (
          <option key={idx} value={s.matiere} />
        ))}
      </datalist>

      {/* Grade Entry Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th className="w-36">{language === 'fr' ? 'Matière' : 'Subject'}</Th>
              {!hideTeacherColumn && (
                <Th className="w-32">{language === 'fr' ? 'Enseignant' : 'Teacher'}</Th>
              )}
              <Th className="w-24">{language === 'fr' ? 'N/20-M/20' : 'N/20-M/20'}</Th>
              <Th className="w-16">{language === 'fr' ? 'Coef' : 'Coef'}</Th>
              <Th className="w-20">{language === 'fr' ? 'M×coef' : 'M×coef'}</Th>
              <Th className="w-16">{language === 'fr' ? 'Note%' : 'Mark%'}</Th>
              <Th className="w-16">{language === 'fr' ? 'COTE' : 'GRADE'}</Th>
              <Th className="w-64">{language === 'fr' ? 'Compétences évaluées' : 'Assessed Competencies'}</Th>
              <Th className="w-64">{language === 'fr' ? 'Appréciation' : 'Comments'}</Th>
              {!hideActions && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const moyenneCalculee = calculateMoyenneFinale(r.note1, r.note2);
              const moyenneFinale = Number(r.moyenneFinale) || moyenneCalculee;
              const totalPondere = round2(moyenneFinale * (Number(r.coef) || 0));
              const cote = r.cote || coteFromNote(moyenneFinale);
              const notePercent = round2((moyenneFinale / 20) * 100);
              const competencesEvaluees = r.competence1 && r.competence2 ? `${r.competence1}; ${r.competence2}` : (r.competence1 || r.competence2 || '');
              
              return (
                <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/30"}>
                  {/* Subject */}
                  <Td data-testid={`cell-subject-${i}`}>
                    <input 
                      className="w-36 border rounded-lg px-2 py-1 text-sm" 
                      value={r.matiere} 
                      onChange={e => {
                        const newMatiere = e.target.value;
                        const autoCoef = getCoefficientForSubject(newMatiere);
                        updateRow(i, {
                          matiere: newMatiere,
                          coef: autoCoef
                        });
                      }}
                      list="class-subjects-list"
                      placeholder={language === 'fr' ? "Matière..." : "Subject..."}
                      data-testid={`input-subject-${i}`}
                      disabled={readOnly}
                    />
                  </Td>

                  {/* Teacher column */}
                  {!hideTeacherColumn && (
                    <Td data-testid={`cell-teacher-${i}`}>
                      <input 
                        className="w-32 border rounded-lg px-2 py-1 text-sm" 
                        value={r.enseignant} 
                        onChange={e => updateRow(i, { enseignant: e.target.value })}
                        placeholder={language === 'fr' ? "Enseignant..." : "Teacher..."}
                        data-testid={`input-teacher-${i}`}
                        disabled={readOnly}
                      />
                    </Td>
                  )}

                  {/* N/20-M/20 */}
                  <Td data-testid={`cell-nm20-${i}`}>
                    <div className="flex items-center gap-1 text-sm">
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="20" 
                        className="w-12 border rounded px-1 py-1 text-center text-xs" 
                        value={r.note1} 
                        onChange={e => {
                          const newNote1 = e.target.value;
                          const newMoyenne = calculateMoyenneFinale(newNote1, r.note2);
                          updateRow(i, {
                            note1: newNote1,
                            moyenneFinale: newMoyenne,
                            totalPondere: round2(newMoyenne * (Number(r.coef) || 0))
                          });
                        }}
                        placeholder="N"
                        data-testid={`input-note1-${i}`}
                        disabled={readOnly}
                      />
                      <span className="text-gray-500">-</span>
                      <span className="w-12 text-center text-xs font-bold bg-blue-50 px-1 py-1 rounded border">
                        {moyenneFinale || '0'}
                      </span>
                      <input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="20" 
                        className="w-12 border rounded px-1 py-1 text-center text-xs ml-1" 
                        value={r.note2} 
                        onChange={e => {
                          const newNote2 = e.target.value;
                          const newMoyenne = calculateMoyenneFinale(r.note1, newNote2);
                          updateRow(i, {
                            note2: newNote2,
                            moyenneFinale: newMoyenne,
                            totalPondere: round2(newMoyenne * (Number(r.coef) || 0))
                          });
                        }}
                        placeholder="N2"
                        data-testid={`input-note2-${i}`}
                        disabled={readOnly}
                      />
                    </div>
                  </Td>

                  {/* Coefficient */}
                  <Td data-testid={`cell-coef-${i}`}>
                    <input 
                      type="number" 
                      step="1" 
                      min="0" 
                      className="w-14 border rounded-lg px-2 py-1 text-center text-sm" 
                      value={r.coef} 
                      onChange={e => {
                        const newCoef = parseInt(e.target.value) || 0;
                        updateRow(i, {
                          coef: newCoef,
                          totalPondere: round2(moyenneFinale * newCoef)
                        });
                      }}
                      data-testid={`input-coef-${i}`}
                      disabled={readOnly}
                    />
                  </Td>

                  {/* M x coef */}
                  <Td data-testid={`cell-mxcoef-${i}`}>
                    <span className="px-2 py-1 inline-block bg-green-50 rounded-lg font-semibold text-green-800 text-sm">
                      {totalPondere}
                    </span>
                  </Td>

                  {/* Note % */}
                  <Td data-testid={`cell-percent-${i}`}>
                    <span className="px-2 py-1 inline-block bg-purple-50 rounded-lg font-semibold text-purple-800 text-sm">
                      {notePercent}%
                    </span>
                  </Td>

                  {/* COTE */}
                  <Td data-testid={`cell-cote-${i}`}>
                    <input 
                      className="w-12 border rounded-lg px-2 py-1 text-center font-bold text-sm" 
                      value={cote} 
                      onChange={e => updateRow(i, { cote: e.target.value })}
                      data-testid={`input-cote-${i}`}
                      disabled={readOnly}
                    />
                  </Td>

                  {/* Competencies */}
                  <Td data-testid={`cell-competences-${i}`}>
                    <textarea 
                      className="w-full border rounded-lg px-2 py-1 text-xs" 
                      rows={2} 
                      value={competencesEvaluees}
                      onChange={e => {
                        const newCompetences = e.target.value;
                        const parts = newCompetences.split(';');
                        updateRow(i, {
                          competence1: parts[0]?.trim() || '',
                          competence2: parts[1]?.trim() || ''
                        });
                      }}
                      placeholder={language === 'fr' ? "Compétences séparées par ;" : "Competencies separated by ;"}
                      data-testid={`input-competences-${i}`}
                      disabled={readOnly}
                    />
                  </Td>

                  {/* Comments */}
                  <Td data-testid={`cell-appreciation-${i}`}>
                    <textarea 
                      className="w-full border rounded-lg px-2 py-1 text-xs" 
                      rows={2} 
                      value={r.appreciation} 
                      onChange={e => updateRow(i, { appreciation: e.target.value })}
                      placeholder={language === 'fr' ? "Appréciation..." : "Comments..."}
                      data-testid={`input-appreciation-${i}`}
                      disabled={readOnly}
                    />
                  </Td>

                  {/* Actions */}
                  {!hideActions && (
                    <Td data-testid={`cell-actions-${i}`}>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRemoveRow(i)}
                          data-testid={`button-remove-${i}`}
                          disabled={readOnly}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Total Coefficients' : 'Total Coefficients'}</div>
            <div className="text-xl font-bold text-blue-600">{totalCoefficients}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Total Pondéré' : 'Weighted Total'}</div>
            <div className="text-xl font-bold text-green-600">{totalPondere}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">{language === 'fr' ? 'Moyenne Générale' : 'General Average'}</div>
            <div className="text-2xl font-bold text-purple-600">{moyenneGenerale}/20</div>
          </div>
        </div>
      </div>

      {/* Add row button */}
      {!readOnly && !hideActions && (
        <div className="flex justify-center">
          <Button
            onClick={onAddRow}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-add-row"
          >
            <Plus className="w-4 h-4" />
            {language === 'fr' ? 'Ajouter une matière' : 'Add Subject'}
          </Button>
        </div>
      )}
    </div>
  );
};