import { getHookSignature } from '../client/src/utils/consolidated.ts';
import { getFunctionSignature } from '../client/src/utils/consolidated.ts';
/**
 * EDUCAFRIC - Règles ESLint Personnalisées pour la Détection des Duplications
 * 
 * Ces règles ESLint détectent automatiquement les duplications courantes
 * et suggèrent des améliorations lors du développement.
 */

export default {
  rules: {
    // Détecte les composants React similaires
    'educafric/no-duplicate-components': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Détecte les composants React dupliqués ou très similaires',
          category: 'Best Practices'
        },
        fixable: 'code',
        messages: {
          duplicateComponent: 'Composant potentiellement dupliqué détecté. Considérez la consolidation.',
          similarComponent: 'Composant similaire trouvé dans {{file}}. Similarité: {{similarity}}%'
        }
      },
      create(context) {
        const componentCache = new Map();
        
        return {
          'FunctionDeclaration, VariableDeclarator': function(node) {
            if (isReactComponent(node)) {
              const signature = getComponentSignature(node);
              const existing = componentCache.get(signature);
              
              if (existing) {
                context.report({
                  node,
                  messageId: 'duplicateComponent',
                  data: {
                    file: existing.filename,
                    similarity: calculateSimilarity(existing.code, getNodeCode(node))
                  }
                });
              } else {
                componentCache.set(signature, {
                  filename: context.getFilename(),
                  code: getNodeCode(node)
                });
              }
            }
          }
        };
      }
    },

    // Détecte les hooks personnalisés dupliqués
    'educafric/no-duplicate-hooks': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Détecte les hooks personnalisés dupliqués',
          category: 'Best Practices'
        },
        messages: {
          duplicateHook: 'Hook personnalisé dupliqué: {{hookName}}'
        }
      },
      create(context) {
        const hooksCache = new Map();
        
        return {
          'FunctionDeclaration, VariableDeclarator': function(node) {
            if (isCustomHook(node)) {
              const hookName = getHookName(node);
              const signature = getHookSignature(node);
              
              if (hooksCache.has(signature)) {
                context.report({
                  node,
                  messageId: 'duplicateHook',
                  data: { hookName }
                });
              } else {
                hooksCache.set(signature, node);
              }
            }
          }
        };
      }
    },

    // Détecte les utilitaires dupliqués
    'educafric/no-duplicate-utilities': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Détecte les fonctions utilitaires dupliquées',
          category: 'Best Practices'
        },
        fixable: 'code',
        messages: {
          duplicateUtility: 'Fonction utilitaire dupliquée: {{functionName}}',
          suggestConsolidation: 'Considérez déplacer cette fonction vers utils/{{category}}.ts'
        }
      },
      create(context) {
        const utilitiesCache = new Map();
        
        return {
          'FunctionDeclaration, VariableDeclarator': function(node) {
            if (isUtilityFunction(node)) {
              const functionName = getFunctionName(node);
              const signature = getFunctionSignature(node);
              
              if (utilitiesCache.has(signature)) {
                context.report({
                  node,
                  messageId: 'duplicateUtility',
                  data: { functionName },
                  fix(fixer) {
                    return fixer.replaceText(node, `// TODO: Consolidate with existing ${functionName}`);
                  }
                });
              } else {
                utilitiesCache.set(signature, node);
              }
            }
          }
        };
      }
    },

    // Détecte les styles inline dupliqués
    'educafric/no-duplicate-styles': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Détecte les styles inline dupliqués',
          category: 'Best Practices'
        },
        messages: {
          duplicateStyle: 'Style inline dupliqué détecté. Considérez créer une classe CSS.',
          frequentStyle: 'Ce style apparaît {{count}} fois. Créez une variable CSS.'
        }
      },
      create(context) {
        const stylesCache = new Map();
        
        return {
          'JSXAttribute[name.name="style"]': function(node) {
            if (node.value && node.value.type === 'JSXExpressionContainer') {
              const styleValue = getStyleValue(node.value);
              const styleKey = JSON.stringify(styleValue);
              
              if (stylesCache.has(styleKey)) {
                const count = stylesCache.get(styleKey) + 1;
                stylesCache.set(styleKey, count);
                
                if (count > 2) {
                  context.report({
                    node,
                    messageId: 'frequentStyle',
                    data: { count }
                  });
                }
              } else {
                stylesCache.set(styleKey, 1);
              }
            }
          },
          
          'Property[key.name="className"]': function(node) {
            if (node.value && node.value.type === 'Literal') {
              const classes = node.value.value.split(' ');
              detectDuplicateClasses(context, node, classes);
            }
          }
        };
      }
    },

    // Détecte la logique métier dupliquée
    'educafric/no-duplicate-business-logic': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Détecte la logique métier dupliquée',
          category: 'Best Practices'
        },
        messages: {
          duplicateLogic: 'Logique métier potentiellement dupliquée',
          suggestAbstraction: 'Considérez créer une abstraction pour cette logique'
        }
      },
      create(context) {
        const logicPatterns = new Map();
        
        return {
          'IfStatement, SwitchStatement, ConditionalExpression': function(node) {
            const pattern = getLogicPattern(node);
            
            if (logicPatterns.has(pattern)) {
              logicPatterns.set(pattern, logicPatterns.get(pattern) + 1);
              
              if (logicPatterns.get(pattern) > 2) {
                context.report({
                  node,
                  messageId: 'duplicateLogic'
                });
              }
            } else {
              logicPatterns.set(pattern, 1);
            }
          }
        };
      }
    }
  },

  configs: {
    recommended: {
      plugins: ['educafric'],
      rules: {
        'educafric/no-duplicate-components': 'warn',
        'educafric/no-duplicate-hooks': 'error',
        'educafric/no-duplicate-utilities': 'warn',
        'educafric/no-duplicate-styles': 'warn',
        'educafric/no-duplicate-business-logic': 'warn'
      }
    }
  }
};

// Helper functions
function isReactComponent(node) {
  if (node.type === 'FunctionDeclaration') {
    return /^[A-Z]/.test(node.id.name);
  }
  
  if (node.type === 'VariableDeclarator' && node.id.name) {
    return /^[A-Z]/.test(node.id.name) && 
           (node.init && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression'));
  }
  
  return false;
}

function isCustomHook(node) {
  const name = getFunctionName(node);
  return name && name.startsWith('use') && /^use[A-Z]/.test(name);
}

function isUtilityFunction(node) {
  const name = getFunctionName(node);
  return name && !isReactComponent(node) && !isCustomHook(node);
}

function getFunctionName(node) {
  if (node.type === 'FunctionDeclaration') {
    return node.id ? node.id.name : null;
  }
  
  if (node.type === 'VariableDeclarator') {
    return node.id.name;
  }
  
  return null;
}

function getComponentSignature(node) {
  const code = getNodeCode(node);
  return normalizeCode(code);
}


function getNodeCode(node) {
  // Simplified - in real implementation, use source code
  return JSON.stringify(node, null, 2);
}

function normalizeCode(code) {
  return code
    .replace(/\s+/g, ' ')
    .replace(/\w+/g, 'VAR')
    .trim();
}

function calculateSimilarity(str1, str2) {
  // Simplified similarity calculation
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer[i] === shorter[i]) matches++;
  }
  
  return Math.round((matches / longer.length) * 100);
}

function getStyleValue(expressionContainer) {
  // Extract style object from JSX expression
  try {
    if (expressionContainer.expression.type === 'ObjectExpression') {
      const styleObj = {};
      expressionContainer.expression.properties.forEach(prop => {
        if (prop.key && prop.value) {
          styleObj[prop.key.name] = prop.value.value;
        }
      });
      return styleObj;
    }
  } catch (error) {
    return {};
  }
  return {};
}

function detectDuplicateClasses(context, node, classes) {
  // Detect frequently used class combinations
  const combinations = getCombinations(classes);
  // Implementation would track combinations across files
}

function getCombinations(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      result.push([arr[i], arr[j]]);
    }
  }
  return result;
}

function getLogicPattern(node) {
  // Extract pattern from control structures
  return node.type + '_' + (node.test ? 'conditional' : 'statement');
}

function getHookName(node) {
  return getFunctionName(node);
}