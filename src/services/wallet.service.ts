import { api } from './api';

export const walletService = {
  updateBankAccount: async (data: any) => {
    const response = await api.put('/wallets/bank-account', data);
    return response.data;
  },
  getBankAccount: async () => {
    const response = await api.get('/wallets/bank-account');
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/wallets/balance');
    return response.data;
  },
  deposit: async (amount: number, challengeToken: string) => {
    const response = await api.post('/wallets/deposit', { amount }, {
      headers: { 'x-challenge-token': challengeToken }
    });
    return response.data;
  },
  withdraw: async (amount: number, challengeToken: string) => {
    const response = await api.post('/wallets/withdraw', { amount }, {
      headers: { 'x-challenge-token': challengeToken }
    });
    return response.data;
  },
  getTransactions: async (params?: any) => {
    const response = await api.get('/wallets/transactions', { params });
    return response.data;
  }
};
