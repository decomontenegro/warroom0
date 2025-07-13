/**
 * Graph Optimizer Service
 * Otimiza a renderização de grafos grandes usando técnicas de virtualização e clustering
 */

export class GraphOptimizer {
  constructor() {
    this.clusterThreshold = 50 // Número de nós para começar a clusterizar
    this.renderBatchSize = 20 // Número de nós para renderizar por vez
    this.visibleNodeLimit = 100 // Limite de nós visíveis simultaneamente
  }

  /**
   * Otimiza dados do grafo para renderização eficiente
   */
  optimizeGraph(data, options = {}) {
    const { nodes, links } = data
    const nodeCount = nodes.length

    // Se o grafo é pequeno, retorna sem otimização
    if (nodeCount < this.clusterThreshold) {
      return {
        ...data,
        optimized: false,
        clusters: []
      }
    }

    // Aplica diferentes estratégias baseado no tamanho
    if (nodeCount < 200) {
      return this.applyBasicOptimization(data, options)
    } else if (nodeCount < 1000) {
      return this.applyClusteringOptimization(data, options)
    } else {
      return this.applyAggressiveOptimization(data, options)
    }
  }

  /**
   * Otimização básica para grafos médios
   */
  applyBasicOptimization(data, options) {
    const { nodes, links } = data
    const { zoomLevel = 1, viewport = {} } = options

    // Calcula importância dos nós
    const nodeImportance = this.calculateNodeImportance(nodes, links)

    // Marca nós para renderização baseado em importância e viewport
    const optimizedNodes = nodes.map(node => ({
      ...node,
      importance: nodeImportance[node.id] || 0,
      shouldRender: true,
      detailLevel: zoomLevel > 0.5 ? 'full' : 'simplified'
    }))

    return {
      nodes: optimizedNodes,
      links,
      optimized: true,
      strategy: 'basic',
      clusters: []
    }
  }

  /**
   * Clustering para grafos grandes
   */
  applyClusteringOptimization(data, options) {
    const { nodes, links } = data
    const clusters = this.detectClusters(nodes, links)
    
    // Cria meta-nós para clusters
    const clusterNodes = []
    const nodeToCluster = {}
    
    clusters.forEach((cluster, index) => {
      if (cluster.nodes.length > 5) {
        const clusterId = `cluster-${index}`
        clusterNodes.push({
          id: clusterId,
          type: 'cluster',
          label: `Cluster ${cluster.name || index + 1}`,
          nodeCount: cluster.nodes.length,
          expanded: false,
          nodes: cluster.nodes,
          x: cluster.center.x,
          y: cluster.center.y
        })
        
        cluster.nodes.forEach(nodeId => {
          nodeToCluster[nodeId] = clusterId
        })
      }
    })

    // Filtra nós e links baseado em clusters
    const visibleNodes = nodes.filter(node => !nodeToCluster[node.id])
    const optimizedNodes = [...visibleNodes, ...clusterNodes]
    
    // Ajusta links para clusters
    const optimizedLinks = this.adjustLinksForClusters(links, nodeToCluster)

    return {
      nodes: optimizedNodes,
      links: optimizedLinks,
      optimized: true,
      strategy: 'clustering',
      clusters,
      nodeToCluster
    }
  }

  /**
   * Otimização agressiva para grafos muito grandes
   */
  applyAggressiveOptimization(data, options) {
    const { nodes, links } = data
    const { focusNodeId, maxDistance = 2 } = options

    // Se há um nó em foco, mostra apenas vizinhança
    if (focusNodeId) {
      const neighborhood = this.getNeighborhood(focusNodeId, nodes, links, maxDistance)
      return {
        nodes: neighborhood.nodes,
        links: neighborhood.links,
        optimized: true,
        strategy: 'neighborhood',
        totalNodes: nodes.length,
        visibleNodes: neighborhood.nodes.length
      }
    }

    // Senão, mostra apenas os nós mais importantes
    const nodeImportance = this.calculateNodeImportance(nodes, links)
    const sortedNodes = [...nodes].sort((a, b) => 
      (nodeImportance[b.id] || 0) - (nodeImportance[a.id] || 0)
    )
    
    const topNodes = sortedNodes.slice(0, this.visibleNodeLimit)
    const topNodeIds = new Set(topNodes.map(n => n.id))
    
    const visibleLinks = links.filter(link => 
      topNodeIds.has(link.source) && topNodeIds.has(link.target)
    )

    return {
      nodes: topNodes,
      links: visibleLinks,
      optimized: true,
      strategy: 'top-nodes',
      totalNodes: nodes.length,
      visibleNodes: topNodes.length
    }
  }

  /**
   * Calcula importância dos nós baseado em conexões
   */
  calculateNodeImportance(nodes, links) {
    const importance = {}
    const inDegree = {}
    const outDegree = {}

    // Inicializa contadores
    nodes.forEach(node => {
      importance[node.id] = 0
      inDegree[node.id] = 0
      outDegree[node.id] = 0
    })

    // Conta conexões
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      
      outDegree[sourceId] = (outDegree[sourceId] || 0) + 1
      inDegree[targetId] = (inDegree[targetId] || 0) + 1
    })

    // Calcula importância baseado em PageRank simplificado
    nodes.forEach(node => {
      const id = node.id
      importance[id] = (inDegree[id] || 0) * 2 + (outDegree[id] || 0)
      
      // Bonus para tipos específicos
      if (node.type === 'file' || node.type === 'class') {
        importance[id] *= 1.5
      }
    })

    return importance
  }

  /**
   * Detecta clusters usando algoritmo de comunidades
   */
  detectClusters(nodes, links) {
    // Implementação simplificada de detecção de comunidades
    const adjacency = this.buildAdjacencyMap(nodes, links)
    const visited = new Set()
    const clusters = []

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const cluster = this.expandCluster(node.id, adjacency, visited)
        if (cluster.length > 1) {
          clusters.push({
            nodes: cluster,
            center: this.calculateClusterCenter(cluster, nodes)
          })
        }
      }
    })

    return clusters
  }

  /**
   * Constrói mapa de adjacência
   */
  buildAdjacencyMap(nodes, links) {
    const adjacency = {}
    
    nodes.forEach(node => {
      adjacency[node.id] = new Set()
    })

    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      
      adjacency[sourceId]?.add(targetId)
      adjacency[targetId]?.add(sourceId)
    })

    return adjacency
  }

  /**
   * Expande cluster a partir de um nó
   */
  expandCluster(nodeId, adjacency, visited, cluster = []) {
    if (visited.has(nodeId)) return cluster
    
    visited.add(nodeId)
    cluster.push(nodeId)

    // Limita tamanho do cluster
    if (cluster.length > 20) return cluster

    const neighbors = adjacency[nodeId] || new Set()
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        this.expandCluster(neighborId, adjacency, visited, cluster)
      }
    })

    return cluster
  }

  /**
   * Calcula centro de um cluster
   */
  calculateClusterCenter(clusterNodeIds, allNodes) {
    const clusterNodes = allNodes.filter(n => clusterNodeIds.includes(n.id))
    
    const center = clusterNodes.reduce((acc, node) => {
      return {
        x: acc.x + (node.x || 0),
        y: acc.y + (node.y || 0)
      }
    }, { x: 0, y: 0 })

    return {
      x: center.x / clusterNodes.length,
      y: center.y / clusterNodes.length
    }
  }

  /**
   * Ajusta links para trabalhar com clusters
   */
  adjustLinksForClusters(links, nodeToCluster) {
    const clusterLinks = new Map()
    const regularLinks = []

    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      
      const sourceCluster = nodeToCluster[sourceId]
      const targetCluster = nodeToCluster[targetId]

      if (sourceCluster && targetCluster && sourceCluster !== targetCluster) {
        // Link entre clusters
        const key = `${sourceCluster}-${targetCluster}`
        if (!clusterLinks.has(key)) {
          clusterLinks.set(key, {
            source: sourceCluster,
            target: targetCluster,
            type: 'cluster-link',
            count: 1
          })
        } else {
          clusterLinks.get(key).count++
        }
      } else if (!sourceCluster && !targetCluster) {
        // Link regular
        regularLinks.push(link)
      } else if (sourceCluster && !targetCluster) {
        // Link de cluster para nó
        regularLinks.push({
          ...link,
          source: sourceCluster
        })
      } else if (!sourceCluster && targetCluster) {
        // Link de nó para cluster
        regularLinks.push({
          ...link,
          target: targetCluster
        })
      }
    })

    return [...regularLinks, ...Array.from(clusterLinks.values())]
  }

  /**
   * Obtém vizinhança de um nó
   */
  getNeighborhood(nodeId, nodes, links, maxDistance = 2) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    const adjacency = this.buildAdjacencyMap(nodes, links)
    const neighborhood = new Set([nodeId])
    const queue = [[nodeId, 0]]
    const visited = new Set()

    while (queue.length > 0) {
      const [currentId, distance] = queue.shift()
      
      if (distance >= maxDistance) continue
      if (visited.has(currentId)) continue
      
      visited.add(currentId)
      const neighbors = adjacency[currentId] || new Set()
      
      neighbors.forEach(neighborId => {
        neighborhood.add(neighborId)
        if (!visited.has(neighborId)) {
          queue.push([neighborId, distance + 1])
        }
      })
    }

    const neighborhoodNodes = Array.from(neighborhood)
      .map(id => nodeMap.get(id))
      .filter(Boolean)

    const neighborhoodIds = new Set(neighborhood)
    const neighborhoodLinks = links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      return neighborhoodIds.has(sourceId) && neighborhoodIds.has(targetId)
    })

    return {
      nodes: neighborhoodNodes,
      links: neighborhoodLinks
    }
  }

  /**
   * Renderização incremental para smooth scrolling
   */
  *renderInBatches(nodes, batchSize = this.renderBatchSize) {
    for (let i = 0; i < nodes.length; i += batchSize) {
      yield nodes.slice(i, i + batchSize)
    }
  }
}

export default new GraphOptimizer()