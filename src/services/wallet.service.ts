import { api } from './api';

const generateNonce = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export interface BalanceBreakdown {
  onChain: number;
  systemCredit: number;
  lockedEscrow?: number;
  total?: number;
}

export interface BalanceResponse {
  balance: number;
  onChainBalance?: number;
  systemCredit?: number;
  lockedEscrow?: number;
  balances?: Record<string, number>;
  breakdown?: Record<string, BalanceBreakdown>;
  vaultAddress?: string;
  smartContractBalance?: number;
  internalDatabaseBalance?: number;
}

export interface ExchangeRatesResponse {
  base: string;
  timestamp: number;
  ratesToVND: Record<string, number>;
  ratesFromUSD: Record<string, number>;
  supportedCurrencies: string[];
}

export interface QuoteResponse {
  quoteId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  exchangeRate: number;
  expiresAt: string;
  ttlSeconds: number;
}

export interface TreasuryStatusResponse {
  totalUsdInflow: number;
  totalVndOutflow: number;
  netVndReserve: number;
  netUsdReserve: number;
  liquidityStatus: 'HEALTHY' | 'WARNING_LOW_LIQUIDITY' | 'CRITICAL';
  liquidityAlertThresholdVnd: number;
  rebalanceRecommended: boolean;
  statusMessage: string;
}

export const walletService = {
  updateBankAccount: async (data: { bankName: string; accountNumber: string }) => {
    const response = await api.put('/wallets/bank-account', data);
    return response.data;
  },

  getBankAccount: async () => {
    const response = await api.get('/wallets/bank-account');
    return response.data;
  },

  getBalance: async () => {
    const response = await api.get<BalanceResponse>('/wallets/balance');
    return response.data;
  },

  getExchangeRates: async () => {
    const response = await api.get<ExchangeRatesResponse>('/wallets/exchange-rates');
    return response.data;
  },

  createQuote: async (sourceCurrency: string, targetCurrency: string, amount: number) => {
    const response = await api.post<QuoteResponse>('/wallets/quote', {
      sourceCurrency,
      targetCurrency,
      amount,
    });
    return response.data;
  },

  getTreasuryStatus: async () => {
    const response = await api.get<TreasuryStatusResponse>('/wallets/treasury');
    return response.data;
  },

  deposit: async (amount: number, challengeToken: string = '', currency: string = 'VND') => {
    const headers: Record<string, string> = {};
    if (challengeToken) {
      headers['x-challenge-token'] = challengeToken;
    }
    const response = await api.post(
      '/wallets/deposit',
      { amount, currency, nonce: generateNonce() },
      { headers }
    );
    return response.data;
  },

  withdraw: async (
    amount: number, 
    challengeToken: string = '', 
    currency: string = 'VND', 
    method: 'BANK' | 'WALLET' = 'BANK',
    targetAddress?: string,
    quoteId?: string,
    sourceCurrency?: string,
    targetCurrency?: string
  ) => {
    const headers: Record<string, string> = {};
    if (challengeToken) {
      headers['x-challenge-token'] = challengeToken;
    }
    const payload: any = { 
      amount, 
      currency: sourceCurrency || currency, 
      method,
      bankAccountId: method === 'BANK' ? 'default' : undefined, 
      targetAddress: method === 'WALLET' ? targetAddress : undefined,
      quoteId: quoteId || undefined,
      sourceCurrency: sourceCurrency || currency,
      targetCurrency: targetCurrency || (method === 'BANK' ? 'VND' : (sourceCurrency || currency)),
      nonce: generateNonce() 
    };
    const response = await api.post('/wallets/withdraw', payload, { headers });
    return response.data;
  },

  swap: async (sourceCurrency: string, targetCurrency: string, amount: number, quoteId?: string) => {
    const response = await api.post('/wallets/swap', {
      sourceCurrency,
      targetCurrency,
      amount,
      quoteId: quoteId || undefined,
      nonce: generateNonce(),
    });
    return response.data;
  },

  getTransactions: async (params?: any) => {
    const response = await api.get('/wallets/transactions', { params });
    return response.data;
  }
};
