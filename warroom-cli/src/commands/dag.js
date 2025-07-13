import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import open from 'open';
import { analyzeJavaScriptFile } from '../utils/codeAnalyzer.js';
import { generateDAGData } from '../utils/dagGenerator.js';

export async function openDAG(file, options) {
  const spinner = ora('Opening DAG visualizer...').start();
  
  try {
    let dagData = null;
    
    // If a file is provided, analyze it first
    if (file) {
      if (options.analyze) {
        spinner.text = `Analyzing ${file}...`;
        
        const content = await fs.readFile(file, 'utf-8');
        const analysis = await analyzeJavaScriptFile(content, file);
        
        dagData = generateDAGData({
          type: 'file',
          path: file,
          analysis,
          timestamp: new Date().toISOString()
        });
        
        // Save the DAG data
        const tempFile = path.join(process.cwd(), '.warroom-dag-temp.json');
        await fs.writeFile(tempFile, JSON.stringify(dagData, null, 2));
        
        spinner.succeed('Analysis complete!');
        console.log(chalk.gray('→ Opening DAG visualization with analysis data...'));
        
        // Open with the analyzed data
        await open(`http://localhost:${options.port}/dag?data=${encodeURIComponent(tempFile)}`);
      } else {
        // Just open the DAG with the file path
        await open(`http://localhost:${options.port}/dag?file=${encodeURIComponent(file)}`);
      }
    } else {
      // Open DAG without any specific file
      await open(`http://localhost:${options.port}/dag`);
    }
    
    spinner.succeed('DAG visualizer opened!');
    
    console.log(chalk.green('\n✓ DAG Visualizer Features:'));
    console.log(chalk.gray('  • Real-time code structure visualization'));
    console.log(chalk.gray('  • Interactive node exploration'));
    console.log(chalk.gray('  • Dependency tracking'));
    console.log(chalk.gray('  • Code complexity analysis'));
    console.log(chalk.gray('  • Export to various formats'));
    
    console.log(chalk.cyan('\n→ Tips:'));
    console.log(chalk.gray('  • Click nodes to see details'));
    console.log(chalk.gray('  • Drag to pan, scroll to zoom'));
    console.log(chalk.gray('  • Use the controls to change layout'));
    console.log(chalk.gray('  • Upload files directly in the interface'));
    
  } catch (error) {
    spinner.fail('Failed to open DAG visualizer');
    
    if (error.code === 'ENOENT') {
      console.error(chalk.red('\n✗ File not found:'), file);
      console.log(chalk.gray('Make sure the file path is correct.'));
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error(chalk.red('\n✗ Could not connect to the web server'));
      console.log(chalk.gray('Make sure the server is running:'));
      console.log(chalk.cyan('  npm run dev'));
    } else {
      throw error;
    }
  }
}

// Additional DAG utilities
export async function exportDAG(dagData, format, outputPath) {
  switch (format) {
    case 'json':
      await fs.writeFile(outputPath, JSON.stringify(dagData, null, 2));
      break;
      
    case 'dot':
      const dotContent = convertToGraphviz(dagData);
      await fs.writeFile(outputPath, dotContent);
      break;
      
    case 'svg':
      // This would require graphviz to be installed
      console.log(chalk.yellow('SVG export requires graphviz. Saving as DOT format instead.'));
      const svgDotContent = convertToGraphviz(dagData);
      await fs.writeFile(outputPath.replace('.svg', '.dot'), svgDotContent);
      break;
      
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function convertToGraphviz(dagData) {
  let dot = 'digraph CodeDAG {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=rounded];\n\n';
  
  // Add nodes
  dagData.nodes.forEach(node => {
    const label = node.label.replace(/"/g, '\\"');
    const color = getNodeColor(node.type);
    dot += `  "${node.id}" [label="${label}", fillcolor="${color}", style="filled,rounded"];\n`;
  });
  
  dot += '\n';
  
  // Add edges
  dagData.edges.forEach(edge => {
    const label = edge.label ? ` [label="${edge.label}"]` : '';
    dot += `  "${edge.source}" -> "${edge.target}"${label};\n`;
  });
  
  dot += '}\n';
  return dot;
}

function getNodeColor(type) {
  const colors = {
    'function': '#a8d5ba',
    'class': '#f4a261',
    'variable': '#e9c46a',
    'import': '#264653',
    'export': '#2a9d8f',
    'file': '#e76f51'
  };
  return colors[type] || '#cccccc';
}