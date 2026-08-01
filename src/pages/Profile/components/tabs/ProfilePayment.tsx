import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';
import { walletService } from '@/services/wallet.service';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { Building2, ArrowDownToLine, ArrowUpFromLine, Lock, Briefcase, Plus, Loader2, X, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export const ProfilePayment: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Deposit/Withdraw Modal State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [depositData, setDepositData] = useState<any>(null);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);

  // OTP State
  const [otpStep, setOtpStep] = useState<0 | 1 | 2>(0); // 0: amount, 1: otp, 2: success
  const [otp, setOtp] = useState('');
  const [activeContext, setActiveContext] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);

  // Queries
  const { data: bankAccount, isLoading: isBankLoading } = useQuery({
    queryKey: ['bank-account'],
    queryFn: () => walletService.getBankAccount().catch(() => null)
  });

  const { data: balanceData } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletService.getBalance().catch(() => ({ balance: 0 })),
    enabled: !!bankAccount,
    refetchInterval: depositData ? 3000 : false
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getTransactions().catch(() => []),
    enabled: !!bankAccount
  });

  const linkMutation = useMutation({
    mutationFn: (data: any) => walletService.updateBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-account'] });
      toast.success('Bank Account Linked Successfully!');
    },
    onError: () => {
      toast.error('Failed to link bank account');
    }
  });

  // OTP Mutations
  const sendOtpMutation = useMutation({
    mutationFn: (context: string) => authService.sendOtp({ email: user?.email || '', context }),
    onSuccess: () => {
      toast.success('OTP sent to your email!');
      setOtpStep(1);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: { code: string, context: string }) => authService.verifyOtp({ email: user?.email || '', otp: data.code, context: data.context }),
    onSuccess: (data) => {
      if (activeContext === 'DEPOSIT') {
        depositMutation.mutate({ amount: Number(amount), challengeToken: data.challenge_token });
      } else if (activeContext === 'WITHDRAW') {
        withdrawMutation.mutate({ amount: Number(amount), challengeToken: data.challenge_token });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  });

  const depositMutation = useMutation({
    mutationFn: (params: { amount: number, challengeToken: string }) => walletService.deposit(params.amount, params.challengeToken),
    onSuccess: (data) => {
      setDepositData(data.paymentInstructions);
      setOtpStep(2); // Success QR Code
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: (params: { amount: number, challengeToken: string }) => walletService.withdraw(params.amount, params.challengeToken),
    onSuccess: () => {
      toast.success('Withdrawal successful!');
      closeModals();
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  });

  const handleLinkBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber) return;
    linkMutation.mutate({ bankName, accountNumber });
  };

  const closeModals = () => {
    setIsDepositOpen(false);
    setIsWithdrawOpen(false);
    setOtpStep(0);
    setAmount('');
    setOtp('');
    setDepositData(null);
    setActiveContext(null);
  };

  const handleNextStep = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Invalid amount');
      return;
    }
    const ctx = isDepositOpen ? 'DEPOSIT' : 'WITHDRAW';
    setActiveContext(ctx);
    sendOtpMutation.mutate(ctx);
  };

  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    verifyOtpMutation.mutate({ code: otp, context: activeContext! });
  };

  const balance = balanceData?.balance ?? 0;
  
  useEffect(() => {
    if (depositData && previousBalance !== null && balance > previousBalance) {
      toast.success('Deposit received successfully!');
      closeModals();
    }
    if (balanceData) {
      setPreviousBalance(balance);
    }
  }, [balance, depositData, balanceData, previousBalance]);
  
  const transactions = (transactionsData as any)?.data || transactionsData || [];

  if (isBankLoading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div>;
  }

  // --- STATE 1: UNLINKED BANK ACCOUNT ---
  if (!bankAccount) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Bank</h2>
          <p className="text-slate-500 mb-8 font-medium">Please link a bank account to enable Escrow, Deposits, and Withdrawals on Task Bounty.</p>
          
          <form onSubmit={handleLinkBank} className="space-y-4 text-left max-w-sm mx-auto">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Bank Name</label>
              <select 
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-semibold text-slate-700"
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
              <label className="text-sm font-bold text-slate-700">Account Number</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 10123456789"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none font-semibold text-slate-700"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={linkMutation.isPending}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg flex items-center justify-center gap-2 mt-4"
            >
              {linkMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Link Account
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // --- STATE 2: LINKED BANK ACCOUNT (CLEAN LIGHT THEME) ---
  const getTxIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><ArrowDownToLine size={20} /></div>;
      case 'PAYOUT': return <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><Briefcase size={20} /></div>;
      case 'WITHDRAW': return <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><ArrowUpFromLine size={20} /></div>;
      case 'LOCK': return <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Lock size={20} /></div>;
      default: return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><Building2 size={20} /></div>;
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
      
      {/* Wallet Card - Clean Professional Look */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl mb-12 relative overflow-hidden">
        {/* Subtle decorative elements instead of chaotic glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Building2 className="text-blue-400" size={24} />
              <span className="font-bold tracking-widest text-slate-300">TASK BOUNTY WALLET</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-slate-300 font-medium">Available Balance</p>
              <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="text-slate-400 hover:text-white transition-colors">
                {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                {isBalanceVisible ? balance.toLocaleString() : '******'}
              </h2>
              <span className="text-xl font-bold text-blue-400">VND</span>
            </div>
            <p className="mt-4 text-slate-300 font-mono bg-white/10 inline-block px-3 py-1 rounded-lg">
              {bankAccount?.maskedData || '**** **** **** 1234'}
            </p>
          </div>
          
          <div className="flex gap-3 mt-8 md:mt-0 w-full md:w-auto">
            <Button 
              onClick={() => setIsDepositOpen(true)}
              className="flex-1 md:flex-none bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-4 rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowDownToLine size={20} /> Deposit
            </Button>
            <Button 
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 md:flex-none bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              <ArrowUpFromLine size={20} /> Withdraw
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Statement */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Transaction History</h3>
        </div>

        {Object.keys(groupedTxs).length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-2xl">
            No transactions found.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedTxs).sort((a,b) => new Date(b.split('/').reverse().join('-')).getTime() - new Date(a.split('/').reverse().join('-')).getTime()).map(date => (
              <div key={date}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">{date}</h4>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {groupedTxs[date].map((tx: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-100 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        {getTxIcon(tx.type)}
                        <div>
                          <p className="font-bold text-slate-900">{tx.type} Transaction</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{format(new Date(tx.createdAt), 'HH:mm')} • {tx.status}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-lg ${getTxColor(tx.type)}`}>
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

      {/* Deposit/Withdraw Modal */}
      {(isDepositOpen || isWithdrawOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeModals}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
            
            {otpStep === 0 && (
              <>
                <h3 className="text-2xl font-bold mb-6 text-slate-900">
                  {isDepositOpen ? 'Deposit Funds' : 'Withdraw Funds'}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Amount (VND)</label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 500000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="text-lg bg-white border-slate-200 focus:border-blue-500"
                    />
                  </div>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!amount || sendOtpMutation.isPending}
                    className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sendOtpMutation.isPending ? <Loader2 className="animate-spin mx-auto" /> : 'Next Step'}
                  </Button>
                </div>
              </>
            )}

            {otpStep === 1 && (
              <div className="flex flex-col h-full">
                <button 
                  onClick={() => setOtpStep(0)} 
                  className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 w-fit"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back
                </button>
                
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="text-blue-600 w-8 h-8" />
                  </div>
                  
                  <h2 className="mb-2 text-2xl font-bold text-slate-900 text-center">
                    Verify Email
                  </h2>
                  <p className="text-slate-500 text-center mb-8">
                    Enter the 6-digit verification code sent to your email to authorize this {isDepositOpen ? 'deposit' : 'withdrawal'}.
                  </p>

                  <form className="w-full flex flex-col gap-4" onSubmit={handleVerifyOtp}>
                    <div className="relative">
                      <Input
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="h-14 text-center text-2xl tracking-widest bg-slate-50 border-slate-200 focus:border-blue-500 rounded-xl transition-all font-bold"
                        required
                        maxLength={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="mt-4 h-12 w-full rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={verifyOtpMutation.isPending || depositMutation.isPending || withdrawMutation.isPending}
                    >
                      {(verifyOtpMutation.isPending || depositMutation.isPending || withdrawMutation.isPending) ? 'Verifying...' : 'Verify & Confirm'}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {otpStep === 2 && depositData && (
              <div className="flex flex-col items-center animate-in slide-in-from-right-4">
                <h3 className="text-2xl font-bold mb-2 text-center text-slate-900">Scan to Deposit</h3>
                <p className="text-sm text-slate-500 mb-6 text-center">Use your banking app to scan this QR code.</p>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex justify-center">
                  <QRCodeSVG 
                    value={depositData.qrCodeData || depositData.qrCodeUrl} 
                    size={200} 
                    level="M" 
                    includeMargin={false} 
                  />
                </div>
                
                <div className="w-full bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Bank</span>
                    <span className="font-bold text-slate-900">{depositData.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Account No.</span>
                    <span className="font-bold text-slate-900">{depositData.accountNumber}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Name</span>
                    <span className="font-bold text-slate-900">{depositData.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500 font-medium">Transfer Memo</span>
                    <span className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg tracking-widest">{depositData.transferMemo}</span>
                  </div>
                </div>
                <Button 
                  onClick={closeModals}
                  variant="outline" 
                  className="w-full mt-6"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
