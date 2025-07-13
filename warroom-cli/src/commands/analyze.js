import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import open from 'open';
import { analyzeJavaScriptFile } from '../utils/codeAnalyzer.js';
import { generateDAGData } from '../utils/dagGenerator.js';

export async function analyzeCode(filePath, options) {
  const spinner = ora(`Analyzing ${filePath}...`).start();
  
  try {
    // Check if path exists
    const stats = await fs.stat(filePath);
    
    let results;
    if (stats.isDirectory()) {
      spinner.text = 'Analyzing directory...';
      results = await analyzeDirectory(filePath, options);
    } else {
      results = await analyzeSingleFile(filePath, options);
    }
    
    spinner.succeed(`Analysis complete!`);
    
    // Display results
    displayAnalysisResults(results);
    
    // Save to file if requested
    if (options.output) {
      await saveResults(results, options.output);
      console.log(chalk.green(`\n✓ Results saved to ${options.output}`));
    }
    
    // Open DAG visualization if requested
    if (options.visualize) {
      console.log(chalk.cyan('\n→ Generating DAG visualization...'));
      const dagData = generateDAGData(results);
      
      // Save DAG data temporarily
      const tempFile = path.join(process.cwd(), '.warroom-dag-temp.json');
      await fs.writeFile(tempFile, JSON.stringify(dagData, null, 2));
      
      // Open web interface with DAG view
      await open(`http://localhost:5173/dag?data=${encodeURIComponent(tempFile)}`);
      console.log(chalk.green('✓ DAG visualization opened in browser'));
    }
    
  } catch (error) {
    spinner.fail('Analysis failed');
    throw error;
  }
}

async function analyzeSingleFile(filePath, options) {
  const content = await fs.readFile(filePath, 'utf-8');
  const analysis = await analyzeJavaScriptFile(content, filePath);
  
  return {
    type: 'file',
    path: filePath,
    analysis,
    timestamp: new Date().toISOString()
  };
}

async function analyzeDirectory(dirPath, options) {
  const files = await getJavaScriptFiles(dirPath, parseInt(options.depth));
  const analyses = [];
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const analysis = await analyzeJavaScriptFile(content, file);
      analyses.push({
        path: file,
        analysis
      });
    } catch (error) {
      console.error(chalk.yellow(`Warning: Could not analyze ${file}: ${error.message}`));
    }
  }
  
  return {
    type: 'directory',
    path: dirPath,
    files: analyses,
    summary: generateSummary(analyses),
    timestamp: new Date().toISOString()
  };
}

async function getJavaScriptFiles(dirPath, maxDepth, currentDepth = 0) {
  if (currentDepth >= maxDepth) return [];
  
  const files = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      const subFiles = await getJavaScriptFiles(fullPath, maxDepth, currentDepth + 1);
      files.push(...subFiles);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function generateSummary(analyses) {
  const summary = {
    totalFiles: analyses.length,
    totalFunctions: 0,
    totalClasses: 0,
    totalImports: 0,
    totalExports: 0,
    dependencies: new Set(),
    complexityScore: 0
  };
  
  for (const { analysis } of analyses) {
    summary.totalFunctions += analysis.functions.length;
    summary.totalClasses += analysis.classes.length;
    summary.totalImports += analysis.imports.length;
    summary.totalExports += analysis.exports.length;
    summary.complexityScore += analysis.complexity || 0;
    
    analysis.imports.forEach(imp => {
      if (imp.source && !imp.source.startsWith('.')) {
        summary.dependencies.add(imp.source);
      }
    });
  }
  
  summary.dependencies = Array.from(summary.dependencies);
  summary.averageComplexity = summary.complexityScore / analyses.length;
  
  return summary;
}

function displayAnalysisResults(results) {
  console.log(chalk.green('\n📊 Analysis Results:'));
  
  if (results.type === 'file') {
    const { analysis } = results;
    console.log(chalk.gray('\nFile:'), results.path);
    console.log(chalk.gray('Functions:'), analysis.functions.length);
    console.log(chalk.gray('Classes:'), analysis.classes.length);
    console.log(chalk.gray('Imports:'), analysis.imports.length);
    console.log(chalk.gray('Exports:'), analysis.exports.length);
    
    if (analysis.functions.length > 0) {
      console.log(chalk.cyan('\n→ Functions:'));
      analysis.functions.forEach(func => {
        console.log(`  - ${func.name || '<anonymous>'} (${func.params.length} params)`);
      });
    }
    
    if (analysis.classes.length > 0) {
      console.log(chalk.cyan('\n→ Classes:'));
      analysis.classes.forEach(cls => {
        console.log(`  - ${cls.name} (${cls.methods.length} methods)`);
      });
    }
  } else {
    const { summary } = results;
    console.log(chalk.gray('\nDirectory:'), results.path);
    console.log(chalk.gray('Total Files:'), summary.totalFiles);
    console.log(chalk.gray('Total Functions:'), summary.totalFunctions);
    console.log(chalk.gray('Total Classes:'), summary.totalClasses);
    console.log(chalk.gray('Average Complexity:'), summary.averageComplexity.toFixed(2));
    
    if (summary.dependencies.length > 0) {
      console.log(chalk.cyan('\n→ External Dependencies:'));
      summary.dependencies.slice(0, 10).forEach(dep => {
        console.log(`  - ${dep}`);
      });
      if (summary.dependencies.length > 10) {
        console.log(chalk.gray(`  ... and ${summary.dependencies.length - 10} more`));
      }
    }
  }
}

async function saveResults(results, outputPath) {
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
}