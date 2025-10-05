import re

# Lire le fichier
with open('storage.ts', 'r') as f:
    content = f.read()

lines = content.split('\n')

# Méthodes restantes à nettoyer
methods_to_clean = [
    'rejectBulletin',
    'grantSchoolAdminRights',
    'getAvailableTeachers',
    'revokeSchoolAdminRights',
    'getSchoolAdministrators',
    'getSchoolAdminPermissions'
]

for method_name in methods_to_clean:
    print(f"\n=== Traitement de {method_name} ===")
    
    # Trouver toutes les occurrences
    occurrences = []
    for i, line in enumerate(lines):
        if f'async {method_name}(' in line:
            occurrences.append(i)
            print(f"Trouvé {method_name} à la ligne {i+1}")
    
    # Si plus d'une occurrence, supprimer toutes sauf la première
    if len(occurrences) > 1:
        print(f"Suppression de {len(occurrences)-1} duplicata(s)")
        
        # Supprimer de la fin vers le début pour éviter les décalages d'index
        for start_line in reversed(occurrences[1:]):
            # Trouver la fin de la méthode
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
                    break
            
            if end_line is not None:
                print(f"Suppression lignes {start_line+1} à {end_line+1}")
                del_end = end_line + 1
                if del_end < len(lines) and lines[del_end].strip() == '':
                    del_end += 1
                del lines[start_line:del_end]

# Réécrire le fichier
with open('storage.ts', 'w') as f:
    f.write('\n'.join(lines))

print("\n=== Nettoyage final terminé ! ===")
