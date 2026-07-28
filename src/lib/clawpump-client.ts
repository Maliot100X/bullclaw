import axios, { AxiosInstance } from 'axios';

const CLAWPUMP_BASE_URL = 'https://api.clawpump.tech';
const CLAWPUMP_API_KEY = process.env.CLAWPUMP_API_KEY;

class ClawPumpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: CLAWPUMP_BASE_URL,
      headers: {
        'Authorization': `Bearer ${CLAWPUMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async createAgent(params: {
    name: string;
    persona: string;
    model: string;
    skillsJson: string;
    template?: string;
  }) {
    try {
      const response = await this.client.post('/agents', {
        name: params.name,
        persona: params.persona,
        model: params.model,
        skills: JSON.parse(params.skillsJson),
        template: params.template || 'custom',
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create ClawPump agent: ${error}`);
    }
  }

  async listAgents(userId?: string) {
    try {
      const params = userId ? { userId } : {};
      const response = await this.client.get('/agents', { params });
      return response.data.agents || [];
    } catch (error) {
      throw new Error(`Failed to list agents: ${error}`);
    }
  }

  async getAgent(agentId: string) {
    try {
      const response = await this.client.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get agent: ${error}`);
    }
  }

  async updateAgent(agentId: string, updates: Record<string, any>) {
    try {
      const response = await this.client.put(`/agents/${agentId}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update agent: ${error}`);
    }
  }

  async getDashboardUrls(agentId: string) {
    try {
      const response = await this.client.get(`/agents/${agentId}/dashboard-urls`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get dashboard URLs: ${error}`);
    }
  }

  async getEarnings(agentId: string) {
    try {
      const response = await this.client.get(`/agents/${agentId}/earnings`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get earnings: ${error}`);
    }
  }

  async getWalletInfo(agentId: string) {
    try {
      const response = await this.client.get(`/agents/${agentId}/wallet`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get wallet info: ${error}`);
    }
  }

  async getTrades(agentId: string, limit: number = 100) {
    try {
      const response = await this.client.get(`/agents/${agentId}/trades`, {
        params: { limit },
      });
      return response.data.trades || [];
    } catch (error) {
      throw new Error(`Failed to get trades: ${error}`);
    }
  }

  async launchToken(agentId: string, params: {
    symbol: string;
    name: string;
    description: string;
    image?: string;
  }) {
    try {
      const response = await this.client.post(`/agents/${agentId}/launch`, params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to launch token: ${error}`);
    }
  }

  async executeSwap(agentId: string, params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippage?: number;
  }) {
    try {
      const response = await this.client.post(`/agents/${agentId}/swap`, params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to execute swap: ${error}`);
    }
  }

  async openPerpPosition(agentId: string, params: {
    market: string;
    side: 'long' | 'short';
    size: number;
    leverage: number;
  }) {
    try {
      const response = await this.client.post(`/agents/${agentId}/perp/open`, params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to open perp position: ${error}`);
    }
  }

  async closePerpPosition(agentId: string, params: {
    market: string;
    positionId: string;
  }) {
    try {
      const response = await this.client.post(`/agents/${agentId}/perp/close`, params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to close perp position: ${error}`);
    }
  }

  async getMarketplace() {
    try {
      const response = await this.client.get('/marketplace/agents');
      return response.data.agents || [];
    } catch (error) {
      throw new Error(`Failed to get marketplace: ${error}`);
    }
  }

  async listAgentForSale(agentId: string, price: number) {
    try {
      const response = await this.client.post(`/agents/${agentId}/marketplace/list`, {
        price,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list agent: ${error}`);
    }
  }

  async getAgentChat(agentId: string) {
    try {
      const response = await this.client.get(`/agents/${agentId}/chat`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get agent chat: ${error}`);
    }
  }

  async sendChatMessage(agentId: string, message: string) {
    try {
      const response = await this.client.post(`/agents/${agentId}/chat`, {
        message,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to send chat message: ${error}`);
    }
  }

  async getStatus() {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get ClawPump status: ${error}`);
    }
  }
}

export const clawpumpClient = new ClawPumpClient();
