import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/wallet.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/atoms/card';
import { Button } from '@/components/shared/atoms/button';
import { Input } from '@/components/shared/atoms/input';

export const Wallet: React.FC = () => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletService.getBalance
  });

  const depositMutation = useMutation({
    mutationFn: (amount: number) => walletService.deposit(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
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

  const balance = (balanceData as any)?.balance || 0;

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
    </div>
  );
};
