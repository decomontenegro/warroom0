import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export async function analyzeJavaScriptFile(content, filePath) {
  const analysis = {
    functions: [],
    classes: [],
    imports: [],
    exports: [],
    variables: [],
    complexity: 0,
    lines: content.split('\n').length,
    dependencies: []
  };
  
  try {
    const ast = acorn.parse(content, {
      sourceType: 'module',
      ecmaVersion: 'latest',
      locations: true
    });
    
    walk.simple(ast, {
      FunctionDeclaration(node) {
        analysis.functions.push({
          name: node.id?.name || '<anonymous>',
          params: node.params.map(p => p.name || '<param>'),
          loc: node.loc,
          async: node.async,
          generator: node.generator
        });
        analysis.complexity += calculateComplexity(node);
      },
      
      FunctionExpression(node) {
        analysis.functions.push({
          name: node.id?.name || '<anonymous>',
          params: node.params.map(p => p.name || '<param>'),
          loc: node.loc,
          async: node.async,
          generator: node.generator
        });
        analysis.complexity += calculateComplexity(node);
      },
      
      ArrowFunctionExpression(node) {
        analysis.functions.push({
          name: '<arrow>',
          params: node.params.map(p => p.name || '<param>'),
          loc: node.loc,
          async: node.async
        });
        analysis.complexity += calculateComplexity(node);
      },
      
      ClassDeclaration(node) {
        const methods = [];
        walk.simple(node, {
          MethodDefinition(method) {
            methods.push({
              name: method.key.name,
              kind: method.kind,
              static: method.static
            });
          }
        });
        
        analysis.classes.push({
          name: node.id?.name || '<anonymous>',
          methods,
          loc: node.loc
        });
      },
      
      ImportDeclaration(node) {
        const specifiers = node.specifiers.map(spec => ({
          type: spec.type,
          local: spec.local.name,
          imported: spec.imported?.name
        }));
        
        analysis.imports.push({
          source: node.source.value,
          specifiers,
          loc: node.loc
        });
        
        if (!node.source.value.startsWith('.')) {
          analysis.dependencies.push(node.source.value);
        }
      },
      
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          analysis.exports.push({
            type: 'named',
            name: node.declaration.id?.name || '<export>',
            loc: node.loc
          });
        }
      },
      
      ExportDefaultDeclaration(node) {
        analysis.exports.push({
          type: 'default',
          name: 'default',
          loc: node.loc
        });
      },
      
      VariableDeclaration(node) {
        node.declarations.forEach(decl => {
          if (decl.id.type === 'Identifier') {
            analysis.variables.push({
              name: decl.id.name,
              kind: node.kind,
              loc: decl.loc
            });
          }
        });
      }
    });
    
    // Remove duplicate dependencies
    analysis.dependencies = [...new Set(analysis.dependencies)];
    
  } catch (error) {
    // If parsing fails, return partial analysis
    analysis.error = error.message;
  }
  
  return analysis;
}

function calculateComplexity(node) {
  let complexity = 1; // Base complexity
  
  walk.simple(node, {
    IfStatement() { complexity++; },
    ConditionalExpression() { complexity++; },
    LogicalExpression(node) {
      if (node.operator === '&&' || node.operator === '||') {
        complexity++;
      }
    },
    ForStatement() { complexity++; },
    ForInStatement() { complexity++; },
    ForOfStatement() { complexity++; },
    WhileStatement() { complexity++; },
    DoWhileStatement() { complexity++; },
    CatchClause() { complexity++; },
    SwitchCase() { complexity++; }
  });
  
  return complexity;
}