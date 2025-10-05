import re

# Lire le fichier
with open('storage.ts', 'r') as f:
    content = f.read()

# Définir les méthodes dupliquées et leurs lignes approximatives à supprimer
duplicates = [
    # Pattern: nom de méthode et ligne approximative de début du duplicata
    ('getStudentHomework', 2748),  # Garder ligne 1163
    ('getStudentAttendance', 2791),  # Garder ligne 1300
    ('getTeacherClasses', 2834),  # Garder ligne 1371
    ('getFreelancerStudents', 3139),  # Garder ligne 1254
    ('getDirectorClasses', 4447),  # Garder ligne 4004 
    ('approveBulletin', 6023),  # Garder ligne 5358
]

lines = content.split('\n')

# Pour chaque méthode dupliquée, trouver et supprimer la seconde occurrence
for method_name, approx_line in duplicates:
    print(f"Chercher duplicata de {method_name} autour de la ligne {approx_line}")
    
    # Chercher la ligne exacte où commence le duplicata
    start_line = None
    for i, line in enumerate(lines):
        if i > approx_line - 10 and i < approx_line + 10:  # Chercher dans une fenêtre
            if f'async {method_name}(' in line:
                start_line = i
                print(f"Trouvé duplicata de {method_name} à la ligne {i+1}")
                break
    
    if start_line is not None:
        # Trouver la fin de la méthode (ligne avec '}' au niveau racine)
        end_line = None
        brace_count = 0
        method_started = False
        
        for i in range(start_line, len(lines)):
            line = lines[i].strip()
            
            if '{' in line:
                brace_count += line.count('{')
                method_started = True
            if '}' in line:
                brace_count -= line.count('}')
                
            if method_started and brace_count == 0 and '}' in line:
                end_line = i
                print(f"Fin du duplicata de {method_name} à la ligne {i+1}")
                break
        
        if end_line is not None:
            # Supprimer les lignes du duplicata (et ligne vide suivante si présente)
            del lines[start_line:end_line+2]  # +2 pour inclure la ligne vide
            print(f"Supprimé duplicata de {method_name} (lignes {start_line+1} à {end_line+2})")

# Réécrire le fichier
with open('storage.ts', 'w') as f:
    f.write('\n'.join(lines))

print("Nettoyage des duplicatas terminé !")
