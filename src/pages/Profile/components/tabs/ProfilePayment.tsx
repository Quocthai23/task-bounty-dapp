import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/shared/atoms/button';
import { walletService } from '@/services/wallet.service';
import { format } from 'date-fns';
import { Building2, ArrowDownToLine, ArrowUpFromLine, Lock, Briefcase, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePayment: React.FC = () => {
  const queryClient = useQueryClient();
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Queries
  const { data: bankAccount, isLoading: isBankLoading } = useQuery({
    queryKey: ['bank-account'],
    queryFn: () => walletService.getBankAccount().catch(() => null)
  });

  const { data: balanceData } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletService.getBalance().catch(() => ({ balance: 0 })),
    enabled: !!bankAccount
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getTransactions().catch(() => []),
    enabled: !!bankAccount
  });

  const linkMutation = useMutation({
    mutationFn: walletService.linkBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-account'] });
      toast.success('Bank Account Linked Successfully!');
    },
    onError: () => {
      toast.error('Failed to link bank account');
    }
  });

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber) return;
    linkMutation.mutate({ bankName, accountNumber });
  };

  const balance = balanceData?.balance || 100000000; // default 100M VND if not implemented yet
  const transactions = (transactionsData as any)?.data || transactionsData || [];

  if (isBankLoading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary-500" size={32} /></div>;
  }

  // --- STATE 1: UNLINKED BANK ACCOUNT ---
  if (!bankAccount) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl shadow-neutral-200/50 text-center">
          <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={36} />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">Connect Your Bank</h2>
          <p className="text-neutral-500 mb-8 font-medium">Please link a bank account to enable Escrow, Deposits, and Withdrawals on Task Bounty.</p>
          
          <form onSubmit={handleLinkBank} className="space-y-4 text-left max-w-sm mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Bank Name</label>
              <select 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none font-semibold text-neutral-700"
                required
              >
                <option value="">Select a Bank...</option>
                <option value="VietinBank">VietinBank</option>
                <option value="Vietcombank">Vietcombank</option>
                <option value="Techcombank">Techcombank</option>
                <option value="MBBank">MBBank</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">Account Number</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 10123456789"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:border-primary-500 focus:bg-white outline-none font-semibold text-neutral-700"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={linkMutation.isPending}
              className="w-full py-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-black text-lg shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {linkMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Link Account
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- STATE 2: LINKED BANK ACCOUNT (VIETINBANK STYLE) ---
  const getTxIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><ArrowDownToLine size={20} /></div>;
      case 'PAYOUT': return <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Briefcase size={20} /></div>;
      case 'WITHDRAW': return <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><ArrowUpFromLine size={20} /></div>;
      case 'LOCK': return <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Lock size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0"><Building2 size={20} /></div>;
    }
  };

  const getTxSign = (type: string) => {
    if (['DEPOSIT', 'PAYOUT'].includes(type)) return '+';
    return '-';
  };

  const getTxColor = (type: string) => {
    if (['DEPOSIT', 'PAYOUT'].includes(type)) return 'text-green-600';
    return 'text-red-600';
  };

  const groupedTxs = transactions.reduce((acc: any, tx: any) => {
    const date = format(new Date(tx.createdAt), 'dd/MM/yyyy');
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Vietinbank Style Card */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-[2rem] p-8 text-white shadow-2xl mb-12 relative overflow-hidden">
        {/* Abstract Background patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Building2 className="text-blue-300" size={24} />
              <span className="font-bold tracking-widest text-blue-200">TASK BOUNTY WALLET</span>
            </div>
            <p className="text-blue-200 font-medium mb-1">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">{balance.toLocaleString()}</h2>
              <span className="text-xl font-bold text-blue-300">VND</span>
            </div>
            <p className="mt-4 text-blue-200 font-mono tracking-widest bg-blue-950/30 inline-block px-3 py-1 rounded-lg border border-white/10">
              {bankAccount?.maskedData || '**** **** **** 1234'}
            </p>
          </div>
          
          <div className="flex gap-3 mt-8 md:mt-0 w-full md:w-auto">
            <Button className="flex-1 md:flex-none bg-white text-blue-900 hover:bg-blue-50 font-black px-8 py-6 rounded-xl shadow-lg flex items-center justify-center gap-2">
              <ArrowDownToLine size={20} /> Deposit
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none border-white/20 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-xl flex items-center justify-center gap-2">
              <ArrowUpFromLine size={20} /> Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Statement */}
      <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-neutral-900">Transaction History</h3>
        </div>

        {Object.keys(groupedTxs).length === 0 ? (
          <div className="text-center py-10 text-neutral-400 font-medium border-2 border-dashed border-neutral-100 rounded-2xl">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedTxs).sort((a,b) => new Date(b.split('/').reverse().join('-')).getTime() - new Date(a.split('/').reverse().join('-')).getTime()).map(date => (
              <div key={date}>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 px-2">{date}</h4>
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
                  {groupedTxs[date].map((tx: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-neutral-100/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        {getTxIcon(tx.type)}
                        <div>
                          <p className="font-bold text-neutral-900">{tx.type} Transaction</p>
                          <p className="text-xs font-medium text-neutral-500 mt-0.5">{format(new Date(tx.createdAt), 'HH:mm')} • {tx.status}</p>
                        </div>
                      </div>
                      <div className={`font-black text-lg ${getTxColor(tx.type)}`}>
                        {getTxSign(tx.type)} {tx.amount.toLocaleString()} ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
