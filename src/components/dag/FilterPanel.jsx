import { useState, useEffect } from 'react'
import './FilterPanel.css'

function FilterPanel({ nodes, links, onFilterChange }) {
  const [filters, setFilters] = useState({
    nodeTypes: [],
    directories: [],
    complexity: { min: 0, max: 100 },
    dependencies: { min: 0, max: 50 },
    searchTerm: '',
    showIsolated: true,
    showClusters: true
  })

  const [stats, setStats] = useState({
    nodeTypes: {},
    directories: [],
    complexityRange: [0, 100],
    dependencyRange: [0, 50]
  })

  // Calcular estatísticas dos nós
  useEffect(() => {
    if (!nodes || nodes.length === 0) return

    // Tipos de nós
    const nodeTypes = {}
    const directories = new Set()
    let minComplexity = Infinity
    let maxComplexity = 0
    let minDeps = Infinity
    let maxDeps = 0

    // Contar dependências por nó
    const dependencyCount = {}
    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      
      dependencyCount[sourceId] = (dependencyCount[sourceId] || 0) + 1
      dependencyCount[targetId] = (dependencyCount[targetId] || 0) + 1
    })

    nodes.forEach(node => {
      // Tipos
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1
      
      // Diretórios
      if (node.relativePath) {
        const dir = node.relativePath.substring(0, node.relativePath.lastIndexOf('/'))
        if (dir) directories.add(dir)
      }
      
      // Complexidade
      const complexity = node.metrics?.complexity || 0
      minComplexity = Math.min(minComplexity, complexity)
      maxComplexity = Math.max(maxComplexity, complexity)
      
      // Dependências
      const deps = dependencyCount[node.id] || 0
      minDeps = Math.min(minDeps, deps)
      maxDeps = Math.max(maxDeps, deps)
    })

    setStats({
      nodeTypes,
      directories: Array.from(directories).sort(),
      complexityRange: [minComplexity, maxComplexity],
      dependencyRange: [minDeps, maxDeps]
    })
  }, [nodes, links])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters)
    }
  }, [filters, onFilterChange])

  const handleTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      nodeTypes: prev.nodeTypes.includes(type)
        ? prev.nodeTypes.filter(t => t !== type)
        : [...prev.nodeTypes, type]
    }))
  }

  const handleDirectoryToggle = (dir) => {
    setFilters(prev => ({
      ...prev,
      directories: prev.directories.includes(dir)
        ? prev.directories.filter(d => d !== dir)
        : [...prev.directories, dir]
    }))
  }

  const handleComplexityChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      complexity: {
        ...prev.complexity,
        [type]: parseInt(value)
      }
    }))
  }

  const handleDependencyChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      dependencies: {
        ...prev.dependencies,
        [type]: parseInt(value)
      }
    }))
  }

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value
    }))
  }

  const resetFilters = () => {
    setFilters({
      nodeTypes: [],
      directories: [],
      complexity: { min: stats.complexityRange[0], max: stats.complexityRange[1] },
      dependencies: { min: stats.dependencyRange[0], max: stats.dependencyRange[1] },
      searchTerm: '',
      showIsolated: true,
      showClusters: true
    })
  }

  const activeFilterCount = 
    filters.nodeTypes.length + 
    filters.directories.length + 
    (filters.searchTerm ? 1 : 0) +
    (filters.complexity.min > stats.complexityRange[0] ? 1 : 0) +
    (filters.complexity.max < stats.complexityRange[1] ? 1 : 0) +
    (filters.dependencies.min > stats.dependencyRange[0] ? 1 : 0) +
    (filters.dependencies.max < stats.dependencyRange[1] ? 1 : 0) +
    (!filters.showIsolated ? 1 : 0) +
    (!filters.showClusters ? 1 : 0)

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filtros Avançados</h3>
        {activeFilterCount > 0 && (
          <button className="reset-filters" onClick={resetFilters}>
            Limpar ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="filter-section">
        <label>Buscar</label>
        <input
          type="text"
          placeholder="Nome do arquivo ou função..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Tipos de nó */}
      <div className="filter-section">
        <label>Tipos de Nó</label>
        <div className="filter-chips">
          {Object.entries(stats.nodeTypes).map(([type, count]) => (
            <button
              key={type}
              className={`filter-chip ${filters.nodeTypes.includes(type) ? 'active' : ''}`}
              onClick={() => handleTypeToggle(type)}
            >
              {type} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Diretórios */}
      {stats.directories.length > 0 && (
        <div className="filter-section">
          <label>Diretórios</label>
          <div className="directory-list">
            {stats.directories.map(dir => (
              <label key={dir} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.directories.includes(dir)}
                  onChange={() => handleDirectoryToggle(dir)}
                />
                <span>{dir}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Complexidade */}
      {stats.complexityRange[1] > 0 && (
        <div className="filter-section">
          <label>Complexidade Ciclomática</label>
          <div className="range-inputs">
            <input
              type="range"
              min={stats.complexityRange[0]}
              max={stats.complexityRange[1]}
              value={filters.complexity.min}
              onChange={(e) => handleComplexityChange('min', e.target.value)}
            />
            <div className="range-values">
              <span>{filters.complexity.min}</span>
              <span>-</span>
              <span>{filters.complexity.max}</span>
            </div>
            <input
              type="range"
              min={stats.complexityRange[0]}
              max={stats.complexityRange[1]}
              value={filters.complexity.max}
              onChange={(e) => handleComplexityChange('max', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Dependências */}
      <div className="filter-section">
        <label>Número de Dependências</label>
        <div className="range-inputs">
          <input
            type="range"
            min={stats.dependencyRange[0]}
            max={stats.dependencyRange[1]}
            value={filters.dependencies.min}
            onChange={(e) => handleDependencyChange('min', e.target.value)}
          />
          <div className="range-values">
            <span>{filters.dependencies.min}</span>
            <span>-</span>
            <span>{filters.dependencies.max}</span>
          </div>
          <input
            type="range"
            min={stats.dependencyRange[0]}
            max={stats.dependencyRange[1]}
            value={filters.dependencies.max}
            onChange={(e) => handleDependencyChange('max', e.target.value)}
          />
        </div>
      </div>

      {/* Opções adicionais */}
      <div className="filter-section">
        <label>Opções</label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.showIsolated}
            onChange={(e) => setFilters(prev => ({ ...prev, showIsolated: e.target.checked }))}
          />
          <span>Mostrar nós isolados</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.showClusters}
            onChange={(e) => setFilters(prev => ({ ...prev, showClusters: e.target.checked }))}
          />
          <span>Mostrar clusters</span>
        </label>
      </div>

      {/* Estatísticas */}
      <div className="filter-stats">
        <h4>Estatísticas</h4>
        <div className="stat-item">
          <span>Total de nós:</span>
          <strong>{nodes?.length || 0}</strong>
        </div>
        <div className="stat-item">
          <span>Total de conexões:</span>
          <strong>{links?.length || 0}</strong>
        </div>
        <div className="stat-item">
          <span>Densidade do grafo:</span>
          <strong>
            {nodes && nodes.length > 0 
              ? (links.length / (nodes.length * (nodes.length - 1))).toFixed(3)
              : 0}
          </strong>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel