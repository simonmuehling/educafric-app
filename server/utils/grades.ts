// ===== UTILITAIRES DE CALCUL DES MOYENNES =====
// Système propre pour calculer les moyennes T1/T2/T3 et annuelles
// Plus de génération aléatoire - que des vraies données

export type SubjectRow = {
  name: string;
  coef: number;
  t1: number | null;
  t2: number | null;
  t3: number | null;
  teacher?: string | null;
  remark?: string | null;
};

/**
 * Calcule la moyenne annuelle d'une matière (T1 + T2 + T3) / 3
 * Retourne null si une des notes manque
 */
export function computeAnnualAvgPerSubject(s: SubjectRow): number | null {
  if (s.t1 == null || s.t2 == null || s.t3 == null) return null;
  return Number(((s.t1 + s.t2 + s.t3) / 3).toFixed(2));
}

/**
 * Calcule la moyenne pondérée selon le mode demandé
 * @param subjects Liste des matières avec notes et coefficients
 * @param mode T1 | T2 | T3 | ANNUAL
 */
export function computeWeightedAverage(subjects: SubjectRow[], mode: 'T1' | 'T2' | 'T3' | 'ANNUAL'): number | null {
  let sum = 0;
  let weight = 0;
  
  for (const s of subjects) {
    let val: number | null = null;
    
    if (mode === 'T1') val = s.t1 ?? null;
    else if (mode === 'T2') val = s.t2 ?? null;
    else if (mode === 'T3') val = s.t3 ?? null;
    else if (mode === 'ANNUAL') val = computeAnnualAvgPerSubject(s);

    if (val != null && s.coef > 0) {
      sum += val * s.coef;
      weight += s.coef;
    }
  }
  
  if (weight === 0) return null;
  return Number((sum / weight).toFixed(2));
}

/**
 * Calcule le rang dans la classe pour une moyenne donnée
 * @param studentAverage Moyenne de l'élève
 * @param classAverages Tableau des moyennes de la classe (trié desc)
 */
export function computeClassRank(studentAverage: number | null, classAverages: number[]): number | null {
  if (studentAverage == null || classAverages.length === 0) return null;
  
  const sortedAverages = [...classAverages].sort((a, b) => b - a);
  const rank = sortedAverages.findIndex(avg => avg <= studentAverage) + 1;
  
  return rank || null;
}

/**
 * Valide qu'un trimestre a les notes requises
 * @param subjects Liste des matières
 * @param term T1 | T2 | T3
 */
export function validateTermRequirements(subjects: SubjectRow[], term: 'T1' | 'T2' | 'T3'): { valid: boolean; missingSubjects: string[] } {
  const missingSubjects: string[] = [];
  
  for (const subject of subjects) {
    if (term === 'T1' && subject.t1 == null) {
      missingSubjects.push(subject.name);
    } else if (term === 'T2' && (subject.t1 == null || subject.t2 == null)) {
      missingSubjects.push(subject.name);
    } else if (term === 'T3' && (subject.t1 == null || subject.t2 == null || subject.t3 == null)) {
      missingSubjects.push(subject.name);
    }
  }
  
  return {
    valid: missingSubjects.length === 0,
    missingSubjects
  };
}

/**
 * Génère les statistiques de classe
 * @param allAverages Moyennes de tous les élèves de la classe
 */
export function computeClassStatistics(allAverages: number[]) {
  if (allAverages.length === 0) {
    return {
      classAverage: null,
      highestAverage: null,
      lowestAverage: null,
      totalStudents: 0
    };
  }
  
  const sorted = [...allAverages].sort((a, b) => b - a);
  const sum = allAverages.reduce((acc, avg) => acc + avg, 0);
  
  return {
    classAverage: Number((sum / allAverages.length).toFixed(2)),
    highestAverage: sorted[0],
    lowestAverage: sorted[sorted.length - 1],
    totalStudents: allAverages.length
  };
}

/**
 * Détermine la décision du conseil de classe basée sur la moyenne annuelle
 * @param annualAverage Moyenne annuelle de l'élève
 */
export function determineCouncilDecision(annualAverage: number | null): {
  council: 'Promoted' | 'Repeat' | 'Pending';
  mention: 'Excellent' | 'Good' | 'Satisfactory' | 'Pass' | 'None';
  appreciation: string;
} {
  if (annualAverage == null) {
    return {
      council: 'Pending',
      mention: 'None',
      appreciation: 'Notes incomplètes'
    };
  }
  
  // Système camerounais standard
  if (annualAverage >= 10) {
    let mention: 'Excellent' | 'Good' | 'Satisfactory' | 'Pass' = 'Pass';
    let appreciation = 'Passage autorisé';
    
    if (annualAverage >= 18) {
      mention = 'Excellent';
      appreciation = 'Félicitations du conseil';
    } else if (annualAverage >= 15) {
      mention = 'Good';
      appreciation = 'Encouragements du conseil';
    } else if (annualAverage >= 12) {
      mention = 'Satisfactory';
      appreciation = 'Satisfaisant';
    }
    
    return {
      council: 'Promoted',
      mention,
      appreciation
    };
  } else {
    return {
      council: 'Repeat',
      mention: 'None',
      appreciation: 'Redoublement conseillé'
    };
  }
}