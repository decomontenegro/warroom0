import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import open from 'open';
import { analyzeJavaScriptFile } from '../utils/codeAnalyzer.js';
import { generateFolderDAG } from '../utils/dagGenerator.js';

export async function analyzeFolder(folderPath, options) {
  const spinner = ora('Analyzing folder structure...').start();
  
  try {
    // Verify folder exists
    const stats = await fs.stat(folderPath);
    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory');
    }
    
    // Get all files matching patterns
    spinner.text = 'Scanning for files...';
    const files = await scanFolder(folderPath, options);
    
    if (files.length === 0) {
      spinner.warn('No files found to analyze');
      return;
    }
    
    spinner.text = `Analyzing ${files.length} files...`;
    
    // Analyze each file
    const analyses = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      spinner.text = `Analyzing (${i + 1}/${files.length}): ${path.basename(file)}`;
      
      try {
        const content = await fs.readFile(file, 'utf-8');
        const analysis = await analyzeJavaScriptFile(content, file);
        analyses.push({
          path: file,
          relativePath: path.relative(folderPath, file),
          analysis
        });
      } catch (error) {
        errors.push({ file, error: error.message });
      }
    }
    
    // Build folder structure
    const folderStructure = buildFolderStructure(analyses, folderPath);
    
    // Generate dependency graph
    const dependencyGraph = buildDependencyGraph(analyses);
    
    spinner.succeed(`Analysis complete! Analyzed ${analyses.length} files`);
    
    // Display results
    displayFolderResults(folderStructure, dependencyGraph, errors);
    
    // Open DAG visualization if requested
    if (options.visualize) {
      console.log(chalk.cyan('\n→ Generating folder DAG visualization...'));
      
      const dagData = generateFolderDAG({
        structure: folderStructure,
        dependencies: dependencyGraph,
        analyses
      });
      
      // Save DAG data and open visualizer
      const tempFile = path.join(process.cwd(), '.warroom-folder-dag.json');
      await fs.writeFile(tempFile, JSON.stringify(dagData, null, 2));
      
      await open(`http://localhost:5173/dag?mode=folder&data=${encodeURIComponent(tempFile)}`);
      console.log(chalk.green('✓ Folder DAG visualization opened in browser'));
    }
    
    return {
      folderPath,
      structure: folderStructure,
      dependencies: dependencyGraph,
      analyses,
      errors
    };
    
  } catch (error) {
    spinner.fail('Folder analysis failed');
    throw error;
  }
}

async function scanFolder(folderPath, options) {
  const patterns = [
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    '**/*.mjs',
    '**/*.cjs'
  ];
  
  const ignorePatterns = options.ignore || ['node_modules', '.git', 'dist', 'build'];
  
  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: folderPath,
      ignore: ignorePatterns,
      absolute: true,
      maxDepth: parseInt(options.depth) || 5
    });
    files.push(...matches);
  }
  
  return [...new Set(files)]; // Remove duplicates
}

function buildFolderStructure(analyses, rootPath) {
  const structure = {
    name: path.basename(rootPath),
    path: rootPath,
    type: 'directory',
    children: {},
    stats: {
      files: 0,
      functions: 0,
      classes: 0,
      lines: 0
    }
  };
  
  for (const { relativePath, analysis } of analyses) {
    const parts = relativePath.split(path.sep);
    let current = structure;
    
    // Navigate/create folder structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: 'directory',
          children: {},
          stats: {
            files: 0,
            functions: 0,
            classes: 0,
            lines: 0
          }
        };
      }
      current = current.children[part];
    }
    
    // Add file
    const fileName = parts[parts.length - 1];
    current.children[fileName] = {
      name: fileName,
      type: 'file',
      analysis,
      stats: {
        functions: analysis.functions.length,
        classes: analysis.classes.length,
        lines: analysis.lines || 0
      }
    };
    
    // Update stats up the tree
    let statsNode = current;
    while (statsNode) {
      statsNode.stats.files++;
      statsNode.stats.functions += analysis.functions.length;
      statsNode.stats.classes += analysis.classes.length;
      statsNode.stats.lines += analysis.lines || 0;
      statsNode = statsNode.parent;
    }
  }
  
  return structure;
}

function buildDependencyGraph(analyses) {
  const graph = {
    nodes: [],
    edges: []
  };
  
  // Create nodes for each file
  analyses.forEach(({ relativePath, analysis }) => {
    graph.nodes.push({
      id: relativePath,
      label: path.basename(relativePath),
      type: 'file',
      functions: analysis.functions.length,
      classes: analysis.classes.length,
      imports: analysis.imports.length,
      exports: analysis.exports.length
    });
  });
  
  // Create edges based on imports
  analyses.forEach(({ relativePath, analysis }) => {
    analysis.imports.forEach(imp => {
      if (imp.source && imp.source.startsWith('.')) {
        // Resolve relative import
        const sourcePath = path.join(path.dirname(relativePath), imp.source);
        const resolvedPath = resolveImportPath(sourcePath, analyses);
        
        if (resolvedPath) {
          graph.edges.push({
            source: relativePath,
            target: resolvedPath,
            type: 'import',
            imported: imp.specifiers
          });
        }
      }
    });
  });
  
  return graph;
}

function resolveImportPath(importPath, analyses) {
  // Try different extensions
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
  
  for (const ext of extensions) {
    const testPath = importPath + ext;
    const normalized = path.normalize(testPath);
    
    if (analyses.find(a => a.relativePath === normalized)) {
      return normalized;
    }
  }
  
  return null;
}

function displayFolderResults(structure, dependencyGraph, errors) {
  console.log(chalk.green('\n📁 Folder Analysis Results:'));
  console.log(chalk.gray('Root:'), structure.path);
  console.log(chalk.gray('Total Files:'), structure.stats.files);
  console.log(chalk.gray('Total Functions:'), structure.stats.functions);
  console.log(chalk.gray('Total Classes:'), structure.stats.classes);
  console.log(chalk.gray('Total Lines:'), structure.stats.lines);
  
  // Display tree structure
  console.log(chalk.cyan('\n→ Folder Structure:'));
  displayTree(structure, '', true);
  
  // Display dependency info
  console.log(chalk.cyan('\n→ Dependency Graph:'));
  console.log(chalk.gray('Files:'), dependencyGraph.nodes.length);
  console.log(chalk.gray('Dependencies:'), dependencyGraph.edges.length);
  
  // Find most connected files
  const connectionCounts = {};
  dependencyGraph.edges.forEach(edge => {
    connectionCounts[edge.source] = (connectionCounts[edge.source] || 0) + 1;
    connectionCounts[edge.target] = (connectionCounts[edge.target] || 0) + 1;
  });
  
  const mostConnected = Object.entries(connectionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (mostConnected.length > 0) {
    console.log(chalk.yellow('\n→ Most Connected Files:'));
    mostConnected.forEach(([file, count]) => {
      console.log(`  - ${file} (${count} connections)`);
    });
  }
  
  // Display errors if any
  if (errors.length > 0) {
    console.log(chalk.red(`\n⚠ Errors (${errors.length} files):`));
    errors.slice(0, 5).forEach(({ file, error }) => {
      console.log(`  - ${path.basename(file)}: ${error}`);
    });
    if (errors.length > 5) {
      console.log(chalk.gray(`  ... and ${errors.length - 5} more`));
    }
  }
}

function displayTree(node, prefix = '', isLast = true) {
  const connector = isLast ? '└── ' : '├── ';
  const extension = isLast ? '    ' : '│   ';
  
  if (node.name) {
    const stats = node.type === 'file' 
      ? chalk.gray(` (${node.stats.functions}f, ${node.stats.classes}c)`)
      : chalk.gray(` (${node.stats.files} files)`);
    
    console.log(prefix + connector + node.name + stats);
  }
  
  if (node.children) {
    const children = Object.values(node.children);
    children.forEach((child, index) => {
      const isLastChild = index === children.length - 1;
      displayTree(child, prefix + (node.name ? extension : ''), isLastChild);
    });
  }
}