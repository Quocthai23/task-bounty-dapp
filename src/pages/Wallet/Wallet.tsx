import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/wallet.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/atoms/card';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export const Wallet: React.FC = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [depositData, setDepositData] = useState<any>(null);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletService.getBalance,
    refetchInterval: depositData ? 3000 : false // Poll every 3s when waiting for deposit
  });

  const balance = (balanceData as any)?.balance || 0;

  useEffect(() => {
    if (depositData && previousBalance !== null && balance > previousBalance) {
      toast.success('Deposit received successfully!');
      setDepositData(null);
    }
    if (balanceData) {
      setPreviousBalance(balance);
    }
  }, [balance, depositData, balanceData, previousBalance]);

  const depositMutation = useMutation({
    mutationFn: (amount: number) => walletService.deposit(amount),
    onSuccess: (data) => {
      setDepositData(data.paymentInstructions);
      setAmount('');
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => walletService.withdraw(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      setAmount('');
    }
  });

  const handleDeposit = () => {
    if (amount) depositMutation.mutate(Number(amount));
  };

  const handleWithdraw = () => {
    if (amount) withdrawMutation.mutate(Number(amount));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold gradient-text">Wallet</h1>
      <Card className="glass-panel max-w-md">
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary-500 mb-6">
            ${isLoading ? '...' : balance.toFixed(2)}
          </p>

          <div className="flex gap-2 mb-4">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="primary-contained"
              onClick={handleDeposit}
              disabled={depositMutation.isPending || !amount}
            >
              Deposit
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending || !amount}
            >
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {depositData && (
        <Card className="glass-panel max-w-md mt-6 animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader>
            <CardTitle>Scan to Deposit</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-4">
              <QRCodeSVG 
                value={depositData.qrCodeData || depositData.qrCodeUrl} 
                size={220} 
                level="M" 
                includeMargin={false} 
              />
            </div>
            <div className="text-center space-y-2 text-sm text-neutral-600 bg-neutral-50 p-4 rounded-xl w-full">
              <p>Bank: <strong>{depositData.bankName}</strong></p>
              <p>Account: <strong>{depositData.accountNumber}</strong></p>
              <p>Name: <strong>{depositData.accountName}</strong></p>
              <p>Transfer Memo: <strong className="text-primary-600 bg-primary-100 px-2 py-1 rounded text-lg font-black tracking-widest">{depositData.transferMemo}</strong></p>
            </div>
            <p className="text-xs text-neutral-400 mt-4 text-center">Your balance will be updated automatically once the transfer is received.</p>
            <Button className="mt-6 w-full" variant="outline" onClick={() => setDepositData(null)}>Done</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
