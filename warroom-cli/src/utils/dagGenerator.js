export function generateDAGData(analysisResult) {
  const nodes = [];
  const edges = [];
  let nodeId = 0;
  
  if (analysisResult.type === 'file') {
    const { analysis } = analysisResult;
    
    // Create file node
    const fileNode = {
      id: `node-${nodeId++}`,
      label: analysisResult.path.split('/').pop(),
      type: 'file',
      data: {
        path: analysisResult.path,
        lines: analysis.lines,
        complexity: analysis.complexity
      }
    };
    nodes.push(fileNode);
    
    // Add function nodes
    analysis.functions.forEach(func => {
      const funcNode = {
        id: `node-${nodeId++}`,
        label: func.name,
        type: 'function',
        data: {
          params: func.params,
          async: func.async,
          generator: func.generator,
          loc: func.loc
        }
      };
      nodes.push(funcNode);
      edges.push({
        source: fileNode.id,
        target: funcNode.id,
        type: 'contains'
      });
    });
    
    // Add class nodes
    analysis.classes.forEach(cls => {
      const classNode = {
        id: `node-${nodeId++}`,
        label: cls.name,
        type: 'class',
        data: {
          methods: cls.methods,
          loc: cls.loc
        }
      };
      nodes.push(classNode);
      edges.push({
        source: fileNode.id,
        target: classNode.id,
        type: 'contains'
      });
      
      // Add method nodes
      cls.methods.forEach(method => {
        const methodNode = {
          id: `node-${nodeId++}`,
          label: method.name,
          type: 'method',
          data: {
            kind: method.kind,
            static: method.static
          }
        };
        nodes.push(methodNode);
        edges.push({
          source: classNode.id,
          target: methodNode.id,
          type: 'has_method'
        });
      });
    });
    
    // Add import/export relationships
    analysis.imports.forEach(imp => {
      const importNode = {
        id: `node-${nodeId++}`,
        label: imp.source,
        type: 'import',
        data: {
          specifiers: imp.specifiers
        }
      };
      nodes.push(importNode);
      edges.push({
        source: fileNode.id,
        target: importNode.id,
        type: 'imports'
      });
    });
    
  } else if (analysisResult.type === 'directory') {
    // Handle directory analysis
    const dirNode = {
      id: `node-${nodeId++}`,
      label: analysisResult.path.split('/').pop(),
      type: 'directory',
      data: {
        path: analysisResult.path,
        fileCount: analysisResult.files.length
      }
    };
    nodes.push(dirNode);
    
    // Add file nodes
    analysisResult.files.forEach(file => {
      const fileNode = {
        id: `node-${nodeId++}`,
        label: file.path.split('/').pop(),
        type: 'file',
        data: {
          path: file.path,
          functions: file.analysis.functions.length,
          classes: file.analysis.classes.length
        }
      };
      nodes.push(fileNode);
      edges.push({
        source: dirNode.id,
        target: fileNode.id,
        type: 'contains'
      });
    });
  }
  
  return {
    nodes,
    edges,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      type: analysisResult.type
    }
  };
}

export function generateFolderDAG(folderData) {
  const nodes = [];
  const edges = [];
  let nodeId = 0;
  
  // Create hierarchical nodes from folder structure
  function processNode(node, parentId = null, path = '') {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const currentId = `node-${nodeId++}`;
    
    nodes.push({
      id: currentId,
      label: node.name,
      type: node.type,
      data: {
        path: currentPath,
        stats: node.stats,
        analysis: node.analysis
      }
    });
    
    if (parentId) {
      edges.push({
        source: parentId,
        target: currentId,
        type: 'contains'
      });
    }
    
    if (node.children) {
      Object.values(node.children).forEach(child => {
        processNode(child, currentId, currentPath);
      });
    }
    
    return currentId;
  }
  
  processNode(folderData.structure);
  
  // Add dependency edges
  if (folderData.dependencies) {
    folderData.dependencies.edges.forEach(dep => {
      // Find nodes by path
      const sourceNode = nodes.find(n => n.data.path.endsWith(dep.source));
      const targetNode = nodes.find(n => n.data.path.endsWith(dep.target));
      
      if (sourceNode && targetNode) {
        edges.push({
          source: sourceNode.id,
          target: targetNode.id,
          type: 'depends_on',
          data: dep
        });
      }
    });
  }
  
  return {
    nodes,
    edges,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0',
      type: 'folder',
      rootPath: folderData.structure.path
    },
    layout: {
      type: 'hierarchical',
      direction: 'TB',
      nodeSpacing: 150,
      levelSpacing: 100
    }
  };
}