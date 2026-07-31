import { api } from './api';

export const bountyService = {
  lockFund: async (data: any) => {
    const response = await api.post('/bounty/lock-fund', data);
    return response.data;
  },
  approvePayout: async (data: any) => {
    const response = await api.post('/bounty/approve-payout', data);
    return response.data;
  },
  syncBounty: async () => {
    const response = await api.post('/bounty/sync');
    return response.data;
  }
};
