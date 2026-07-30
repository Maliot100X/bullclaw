import axios from 'axios';

const CLAWPUMP_API_KEY = process.env.CLAWPUMP_API_KEY;
const CLAWPUMP_BASE_URL = 'https://clawpump.vercel.app';

const client = axios.create({
  baseURL: CLAWPUMP_BASE_URL,
  headers: {
    'Authorization': `Bearer ${CLAWPUMP_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface ClawPumpAgent {
  id: string;
  name: string;
  walletAddress: string;
  createdAt: string;
  status: string;
  totalPnL: number;
  earnings: number;
}

export interface CreateAgentParams {
  name: string;
  persona: string;
  model: string;
  skillsJson: string;
  template?: string;
}

export async function createAgent(params: CreateAgentParams): Promise<ClawPumpAgent> {
  try {
    const response = await client.post('/agents', params);
    return response.data;
  } catch (error) {
    console.error('Error creating ClawPump agent:', error);
    throw error;
  }
}

export async function listAgents(): Promise<ClawPumpAgent[]> {
  try {
    const response = await client.get('/agents');
    return response.data.agents || [];
  } catch (error) {
    console.error('Error listing ClawPump agents:', error);
    throw error;
  }
}

export async function getAgentDashboardUrls(agentId: string) {
  try {
    const response = await client.get(`/agents/${agentId}/dashboard-urls`);
    return response.data;
  } catch (error) {
    console.error('Error getting agent dashboard URLs:', error);
    throw error;
  }
}

export async function getAgentEarnings(agentId: string) {
  try {
    const response = await client.get(`/agents/${agentId}/earnings`);
    return response.data;
  } catch (error) {
    console.error('Error getting agent earnings:', error);
    throw error;
  }
}
