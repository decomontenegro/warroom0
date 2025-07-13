import axios from 'axios';
import { getAvailableAgents } from './agents.js';

const API_BASE = 'http://localhost:3001/api';

export async function createWarRoomSession(options) {
  const { task, agents, timestamp } = options;
  
  // Select agents based on task or use provided agents
  const selectedAgents = agents || selectAgentsForTask(task);
  
  const session = {
    id: generateSessionId(),
    task,
    agents: selectedAgents,
    status: 'initializing',
    startTime: timestamp || new Date().toISOString(),
    log: [{
      time: new Date().toLocaleTimeString(),
      message: `Session created for: ${task}`
    }]
  };
  
  try {
    // Try to register with server if available
    const response = await axios.post(`${API_BASE}/warroom/sessions`, session, {
      timeout: 2000
    });
    
    if (response.data.id) {
      session.id = response.data.id;
      session.serverConnected = true;
    }
  } catch (error) {
    // Server not available, continue offline
    session.serverConnected = false;
    session.log.push({
      time: new Date().toLocaleTimeString(),
      message: 'Running in offline mode'
    });
  }
  
  // Initialize agents
  session.agents = initializeAgents(selectedAgents, task);
  session.status = 'active';
  
  return session;
}

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function selectAgentsForTask(task) {
  const taskLower = task.toLowerCase();
  const allAgents = getAvailableAgents();
  
  // Simple keyword-based agent selection
  const selectedAgentNames = [];
  
  // Always include orchestrator
  selectedAgentNames.push('SessionOrchestrator');
  
  // Select based on task keywords
  if (taskLower.includes('code') || taskLower.includes('implement') || taskLower.includes('function')) {
    selectedAgentNames.push('CodeAnalyzer');
  }
  
  if (taskLower.includes('test') || taskLower.includes('testing')) {
    selectedAgentNames.push('TestGenerator');
  }
  
  if (taskLower.includes('requirement') || taskLower.includes('spec')) {
    selectedAgentNames.push('RequirementsAnalyzer');
  }
  
  if (taskLower.includes('validate') || taskLower.includes('check')) {
    selectedAgentNames.push('ValidationPipeline');
  }
  
  // Add moderator for complex tasks
  if (selectedAgentNames.length > 3 || taskLower.includes('complex') || taskLower.includes('discuss')) {
    selectedAgentNames.push('AIDialogModerator');
  }
  
  return selectedAgentNames;
}

function initializeAgents(agentNames, task) {
  const allAgents = getAvailableAgents();
  
  return agentNames.map(name => {
    const agentDef = allAgents.find(a => a.name === name || a.id === name);
    if (!agentDef) {
      return {
        name,
        status: 'unknown',
        capability: 'Unknown agent'
      };
    }
    
    return {
      ...agentDef,
      status: 'active',
      context: {
        task,
        startTime: new Date().toISOString()
      }
    };
  });
}

export async function endSession(sessionId) {
  try {
    await axios.post(`${API_BASE}/warroom/sessions/${sessionId}/end`);
  } catch (error) {
    // Ignore if server not available
  }
}

export async function getSessionStatus(sessionId) {
  try {
    const response = await axios.get(`${API_BASE}/warroom/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    return null;
  }
}