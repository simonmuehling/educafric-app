#!/usr/bin/env node

/**
 * EDUCAFRIC - Script d'Élimination des Duplications
 * 
 * Ce script analyse et élimine les duplications à tous les niveaux :
 * - Composants React dupliqués
 * - Fonctions/utilitaires identiques
 * - Styles CSS redondants
 * - Imports/exports dupliqués
 * - Logique métier répétée
 * - Fichiers similaires
 * 
 * Usage: node scripts/eliminate-duplications.js [--dry-run] [--fix]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DuplicationEliminator {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.autoFix = options.fix || false;
    this.verbose = options.verbose || false;
    
    this.duplications = {
      components: [],
      functions: [],
      styles: [],
      imports: [],
      files: [],
      logic: []
    };
    
    this.stats = {
      filesScanned: 0,
      duplicationsFound: 0,
      duplicationsFixed: 0,
      spaceReclaimed: 0
    };
    
    this.projectRoot = process.cwd();
    this.ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.min.js',
      '.map',
      '.config',
      'tmp',
      'temp'
    ];
  }

  // Main execution method
  async run() {
    console.log('🔍 EDUCAFRIC - Détection et Élimination des Duplications\n');
    
    try {
      await this.scanProject();
      await this.analyzeComponents();
      await this.analyzeFunctions();
      await this.analyzeStyles();
      await this.analyzeImports();
      await this.analyzeLogic();
      
      this.generateReport();
      
      if (this.autoFix && !this.dryRun) {
        await this.fixDuplications();
      }
      
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error.message);
      process.exit(1);
    }
  }

  // Scan all project files
  async scanProject() {
    console.log('📁 Analyse des fichiers du projet...');
    
    const scanDir = (dir, files = []) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(this.projectRoot, fullPath);
        
        // Skip ignored patterns
        if (this.shouldIgnore(relativePath)) continue;
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath, files);
          } else if (this.isRelevantFile(fullPath)) {
            files.push({
              path: fullPath,
              relativePath,
              size: stat.size,
              content: fs.readFileSync(fullPath, 'utf8'),
              hash: this.getFileHash(fullPath)
            });
          }
        } catch (error) {
          // Skip files that can't be accessed (permissions, broken symlinks, etc.)
          if (this.verbose) {
            console.log(`Skipping ${relativePath}: ${error.message}`);
          }
        }
      }
      
      return files;
    };
    
    this.files = scanDir(this.projectRoot);
    this.stats.filesScanned = this.files.length;
    
    console.log(`✅ ${this.files.length} fichiers analysés\n`);
  }

  // Analyze React components for duplications
  async analyzeComponents() {
    console.log('🔍 Analyse des composants React...');
    
    const components = this.files.filter(file => 
      file.relativePath.endsWith('.tsx') || file.relativePath.endsWith('.jsx')
    );
    
    const componentMap = new Map();
    
    for (const file of components) {
      const componentInfo = this.extractComponentInfo(file);
      if (componentInfo) {
        const signature = this.getComponentSignature(componentInfo);
        
        if (componentMap.has(signature)) {
          this.duplications.components.push({
            type: 'component',
            signature,
            files: [componentMap.get(signature), file],
            similarity: this.calculateSimilarity(
              componentMap.get(signature).content,
              file.content
            )
          });
        } else {
          componentMap.set(signature, file);
        }
      }
    }
    
    console.log(`✅ ${this.duplications.components.length} duplications de composants détectées`);
  }

  // Analyze functions for duplications
  async analyzeFunctions() {
    console.log('🔍 Analyse des fonctions...');
    
    const functionMap = new Map();
    
    for (const file of this.files) {
      const functions = this.extractFunctions(file);
      
      for (const func of functions) {
        const signature = this.getFunctionSignature(func);
        
        if (functionMap.has(signature)) {
          this.duplications.functions.push({
            type: 'function',
            name: func.name,
            signature,
            files: [functionMap.get(signature).file, file],
            similarity: this.calculateSimilarity(
              functionMap.get(signature).code,
              func.code
            )
          });
        } else {
          functionMap.set(signature, { file, ...func });
        }
      }
    }
    
    console.log(`✅ ${this.duplications.functions.length} duplications de fonctions détectées`);
  }

  // Analyze CSS/styles for duplications
  async analyzeStyles() {
    console.log('🔍 Analyse des styles CSS...');
    
    const styleFiles = this.files.filter(file =>
      file.relativePath.endsWith('.css') ||
      file.relativePath.endsWith('.scss') ||
      file.relativePath.includes('styles')
    );
    
    const styleMap = new Map();
    
    for (const file of styleFiles) {
      const styles = this.extractStyles(file);
      
      for (const style of styles) {
        const signature = this.getStyleSignature(style);
        
        if (styleMap.has(signature)) {
          this.duplications.styles.push({
            type: 'style',
            selector: style.selector,
            signature,
            files: [styleMap.get(signature).file, file],
            similarity: this.calculateSimilarity(
              styleMap.get(signature).code,
              style.code
            )
          });
        } else {
          styleMap.set(signature, { file, ...style });
        }
      }
    }
    
    console.log(`✅ ${this.duplications.styles.length} duplications de styles détectées`);
  }

  // Analyze imports for duplications
  async analyzeImports() {
    console.log('🔍 Analyse des imports...');
    
    const importMap = new Map();
    
    for (const file of this.files) {
      const imports = this.extractImports(file);
      
      for (const imp of imports) {
        const key = `${imp.source}-${imp.specifiers.join(',')}`;
        
        if (importMap.has(key)) {
          importMap.get(key).push(file);
        } else {
          importMap.set(key, [file]);
        }
      }
    }
    
    // Find redundant imports
    for (const [key, files] of importMap) {
      if (files.length > 1) {
        this.duplications.imports.push({
          type: 'import',
          key,
          files,
          count: files.length
        });
      }
    }
    
    console.log(`✅ ${this.duplications.imports.length} imports redondants détectés`);
  }

  // Analyze business logic for duplications
  async analyzeLogic() {
    console.log('🔍 Analyse de la logique métier...');
    
    const logicPatterns = [
      /const.*=.*useState\(.*\)/g,
      /useEffect\(\(\) => {[^}]*}/g,
      /const.*=.*async.*=>/g,
      /if.*{[^}]*}/g,
      /switch.*{[^}]*}/g
    ];
    
    const logicMap = new Map();
    
    for (const file of this.files) {
      for (const pattern of logicPatterns) {
        const matches = file.content.match(pattern);
        if (matches) {
          for (const match of matches) {
            const normalized = this.normalizeCode(match);
            
            if (logicMap.has(normalized)) {
              logicMap.get(normalized).push({ file, code: match });
            } else {
              logicMap.set(normalized, [{ file, code: match }]);
            }
          }
        }
      }
    }
    
    // Find duplicated logic
    for (const [normalized, instances] of logicMap) {
      if (instances.length > 1) {
        this.duplications.logic.push({
          type: 'logic',
          pattern: normalized,
          instances,
          count: instances.length
        });
      }
    }
    
    console.log(`✅ ${this.duplications.logic.length} duplications de logique détectées`);
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 RAPPORT DE DUPLICATIONS\n');
    
    const totalDuplications = Object.values(this.duplications)
      .reduce((sum, arr) => sum + arr.length, 0);
    
    this.stats.duplicationsFound = totalDuplications;
    
    console.log('📈 Statistiques globales:');
    console.log(`   Fichiers analysés: ${this.stats.filesScanned}`);
    console.log(`   Duplications trouvées: ${totalDuplications}`);
    console.log('');
    
    // Components report
    if (this.duplications.components.length > 0) {
      console.log('🧩 COMPOSANTS DUPLIQUÉS:');
      this.duplications.components.forEach((dup, i) => {
        console.log(`   ${i + 1}. Similarité ${dup.similarity}%`);
        dup.files.forEach(file => {
          console.log(`      📄 ${file.relativePath}`);
        });
      });
      console.log('');
    }
    
    // Functions report
    if (this.duplications.functions.length > 0) {
      console.log('⚡ FONCTIONS DUPLIQUÉES:');
      this.duplications.functions.forEach((dup, i) => {
        console.log(`   ${i + 1}. ${dup.name} - Similarité ${dup.similarity}%`);
        dup.files.forEach(file => {
          console.log(`      📄 ${file.relativePath}`);
        });
      });
      console.log('');
    }
    
    // Styles report
    if (this.duplications.styles.length > 0) {
      console.log('🎨 STYLES DUPLIQUÉS:');
      this.duplications.styles.forEach((dup, i) => {
        console.log(`   ${i + 1}. ${dup.selector} - Similarité ${dup.similarity}%`);
        dup.files.forEach(file => {
          console.log(`      📄 ${file.relativePath}`);
        });
      });
      console.log('');
    }
    
    // Imports report
    if (this.duplications.imports.length > 0) {
      console.log('📦 IMPORTS REDONDANTS:');
      this.duplications.imports.forEach((dup, i) => {
        console.log(`   ${i + 1}. ${dup.key} (${dup.count} fichiers)`);
        dup.files.slice(0, 3).forEach(file => {
          console.log(`      📄 ${file.relativePath}`);
        });
        if (dup.files.length > 3) {
          console.log(`      ... et ${dup.files.length - 3} autres`);
        }
      });
      console.log('');
    }
    
    // Logic report
    if (this.duplications.logic.length > 0) {
      console.log('🧠 LOGIQUE DUPLIQUÉE:');
      this.duplications.logic.slice(0, 5).forEach((dup, i) => {
        console.log(`   ${i + 1}. Pattern répété ${dup.count} fois`);
        console.log(`      Code: ${dup.pattern.substring(0, 50)}...`);
      });
      console.log('');
    }
  }

  // Fix duplications automatically
  async fixDuplications() {
    console.log('🔧 Correction automatique des duplications...\n');
    
    let fixed = 0;
    
    // Fix component duplications
    for (const dup of this.duplications.components) {
      if (dup.similarity > 85) {
        await this.consolidateComponents(dup);
        fixed++;
      }
    }
    
    // Fix function duplications
    for (const dup of this.duplications.functions) {
      if (dup.similarity > 90) {
        await this.consolidateFunctions(dup);
        fixed++;
      }
    }
    
    // Fix style duplications
    for (const dup of this.duplications.styles) {
      if (dup.similarity > 95) {
        await this.consolidateStyles(dup);
        fixed++;
      }
    }
    
    this.stats.duplicationsFixed = fixed;
    console.log(`✅ ${fixed} duplications corrigées automatiquement`);
  }

  // Consolidate duplicate components
  async consolidateComponents(duplication) {
    const [primary, secondary] = duplication.files;
    
    // Create consolidated component
    const consolidatedPath = path.join(
      path.dirname(primary.path),
      'consolidated',
      path.basename(primary.path)
    );
    
    const consolidatedContent = this.mergeComponents(primary.content, secondary.content);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(consolidatedPath), { recursive: true });
    
    // Write consolidated component
    fs.writeFileSync(consolidatedPath, consolidatedContent);
    
    // Update imports in other files
    await this.updateComponentImports(primary.path, secondary.path, consolidatedPath);
    
    // Remove duplicate file
    fs.unlinkSync(secondary.path);
    
    console.log(`✅ Composants consolidés: ${path.relative(this.projectRoot, consolidatedPath)}`);
  }

  // Consolidate duplicate functions
  async consolidateFunctions(duplication) {
    const utilsPath = path.join(this.projectRoot, 'client/src/utils/consolidated.ts');
    
    // Ensure utils directory exists
    fs.mkdirSync(path.dirname(utilsPath), { recursive: true });
    
    // Read or create utils file
    let utilsContent = '';
    if (fs.existsSync(utilsPath)) {
      utilsContent = fs.readFileSync(utilsPath, 'utf8');
    } else {
      utilsContent = '// Consolidated utility functions\n\n';
    }
    
    // Add consolidated function
    const functionCode = this.getFunctionCode(duplication);
    utilsContent += `export ${functionCode}\n\n`;
    
    // Write utils file
    fs.writeFileSync(utilsPath, utilsContent);
    
    // Update function imports
    await this.updateFunctionImports(duplication, utilsPath);
    
    console.log(`✅ Fonction consolidée: ${duplication.name}`);
  }

  // Consolidate duplicate styles
  async consolidateStyles(duplication) {
    const stylesPath = path.join(this.projectRoot, 'client/src/styles/consolidated.css');
    
    // Ensure styles directory exists
    fs.mkdirSync(path.dirname(stylesPath), { recursive: true });
    
    // Read or create styles file
    let stylesContent = '';
    if (fs.existsSync(stylesPath)) {
      stylesContent = fs.readFileSync(stylesPath, 'utf8');
    } else {
      stylesContent = '/* Consolidated styles */\n\n';
    }
    
    // Add consolidated style
    const styleCode = this.getStyleCode(duplication);
    stylesContent += `${styleCode}\n\n`;
    
    // Write styles file
    fs.writeFileSync(stylesPath, stylesContent);
    
    // Update style imports
    await this.updateStyleImports(duplication, stylesPath);
    
    console.log(`✅ Style consolidé: ${duplication.selector}`);
  }

  // Helper methods
  shouldIgnore(filePath) {
    return this.ignorePatterns.some(pattern => {
      if (pattern.startsWith('.')) {
        return filePath.endsWith(pattern);
      }
      return filePath.includes(pattern);
    });
  }

  isRelevantFile(filePath) {
    const ext = path.extname(filePath);
    return ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'].includes(ext);
  }

  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return 'error_' + Math.random().toString(36).substring(7);
    }
  }

  extractComponentInfo(file) {
    const match = file.content.match(/(?:function|const)\s+(\w+).*(?:=>|{)/);
    return match ? { name: match[1], content: file.content } : null;
  }

  getComponentSignature(componentInfo) {
    // Normalize component structure for comparison
    const normalized = componentInfo.content
      .replace(/\s+/g, ' ')
      .replace(/const\s+\w+\s*=/, 'const COMPONENT =')
      .replace(/function\s+\w+/, 'function COMPONENT');
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  extractFunctions(file) {
    const functions = [];
    const regex = /(?:function\s+(\w+)|const\s+(\w+)\s*=.*(?:=>|function))\s*[\s\S]*?(?=\n(?:function|const|export|$))/g;
    
    let match;
    while ((match = regex.exec(file.content)) !== null) {
      functions.push({
        name: match[1] || match[2],
        code: match[0]
      });
    }
    
    return functions;
  }

  getFunctionSignature(func) {
    const normalized = func.code
      .replace(/\s+/g, ' ')
      .replace(/function\s+\w+/, 'function FUNC')
      .replace(/const\s+\w+/, 'const FUNC');
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  extractStyles(file) {
    const styles = [];
    const regex = /([.#][\w-]+|\w+)\s*{[^}]*}/g;
    
    let match;
    while ((match = regex.exec(file.content)) !== null) {
      styles.push({
        selector: match[1],
        code: match[0]
      });
    }
    
    return styles;
  }

  getStyleSignature(style) {
    const normalized = style.code
      .replace(/\s+/g, ' ')
      .replace(/[.#][\w-]+/, '.selector');
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  extractImports(file) {
    const imports = [];
    const regex = /import\s+(?:{([^}]*)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]*)['"]/g;
    
    let match;
    while ((match = regex.exec(file.content)) !== null) {
      imports.push({
        specifiers: match[1] ? match[1].split(',').map(s => s.trim()) : [match[2] || match[3]],
        source: match[4]
      });
    }
    
    return imports;
  }

  normalizeCode(code) {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\w+/g, 'VAR')
      .trim();
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 100;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return Math.round(((longer.length - distance) / longer.length) * 100);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  mergeComponents(content1, content2) {
    // Simple merge - take the more comprehensive version
    return content1.length > content2.length ? content1 : content2;
  }

  getFunctionCode(duplication) {
    return duplication.files[0].content.match(
      new RegExp(`(?:function\\s+${duplication.name}|const\\s+${duplication.name}\\s*=)[\\s\\S]*?(?=\\n(?:function|const|export|$))`)
    )?.[0] || '';
  }

  getStyleCode(duplication) {
    return duplication.instances[0].code;
  }

  async updateComponentImports(primaryPath, secondaryPath, consolidatedPath) {
    // Update imports in all files that reference the duplicated components
    for (const file of this.files) {
      let content = file.content;
      const relativeOld = path.relative(path.dirname(file.path), secondaryPath);
      const relativeNew = path.relative(path.dirname(file.path), consolidatedPath);
      
      if (content.includes(relativeOld)) {
        content = content.replace(
          new RegExp(relativeOld.replace(/\./g, '\\.'), 'g'),
          relativeNew
        );
        fs.writeFileSync(file.path, content);
      }
    }
  }

  async updateFunctionImports(duplication, utilsPath) {
    // Update function imports in affected files
    for (const file of duplication.files) {
      let content = file.content;
      const relativePath = path.relative(path.dirname(file.path), utilsPath);
      
      // Remove function definition and add import
      content = content.replace(
        new RegExp(`(?:function\\s+${duplication.name}|const\\s+${duplication.name}\\s*=)[\\s\\S]*?(?=\\n(?:function|const|export|$))`),
        ''
      );
      
      // Add import at the top
      const importStatement = `import { ${duplication.name} } from '${relativePath}';\n`;
      content = importStatement + content;
      
      fs.writeFileSync(file.path, content);
    }
  }

  async updateStyleImports(duplication, stylesPath) {
    // Update style imports in affected files
    for (const file of duplication.files) {
      let content = file.content;
      const relativePath = path.relative(path.dirname(file.path), stylesPath);
      
      // Add import if not already present
      if (!content.includes(relativePath)) {
        const importStatement = `import '${relativePath}';\n`;
        content = importStatement + content;
        fs.writeFileSync(file.path, content);
      }
    }
  }

  showSummary() {
    console.log('\n📋 RÉSUMÉ DE L\'ANALYSE\n');
    console.log(`✅ Fichiers analysés: ${this.stats.filesScanned}`);
    console.log(`🔍 Duplications détectées: ${this.stats.duplicationsFound}`);
    
    if (this.autoFix && !this.dryRun) {
      console.log(`🔧 Duplications corrigées: ${this.stats.duplicationsFixed}`);
      console.log(`💾 Espace récupéré: ${this.formatBytes(this.stats.spaceReclaimed)}`);
    } else if (this.dryRun) {
      console.log('🔍 Mode aperçu - Aucune modification effectuée');
    }
    
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('   • Créer des composants réutilisables pour les éléments dupliqués');
    console.log('   • Centraliser les utilitaires dans des modules dédiés');
    console.log('   • Utiliser des variables CSS pour les styles répétés');
    console.log('   • Implémenter des hooks personnalisés pour la logique partagée');
    console.log('   • Configurer ESLint pour détecter les duplications futures');
    
    if (this.stats.duplicationsFound > 0) {
      console.log('\n🚀 Pour corriger automatiquement:');
      console.log('   node scripts/eliminate-duplications.js --fix');
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };
  
  const eliminator = new DuplicationEliminator(options);
  eliminator.run().catch(console.error);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DuplicationEliminator;