import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { walletService } from '@/services/wallet.service';
import { Button } from '@/components/shared/atoms/button';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  ExternalLink, 
  Building, 
  Clock, 
  CheckCircle2,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export const ProfilePayment: React.FC = () => {
  const navigate = useNavigate();

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => walletService.getBalance(),
  });

  const { data: bankAccount } = useQuery({
    queryKey: ['wallet-bank-account'],
    queryFn: () => walletService.getBankAccount(),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getTransactions(),
  });

  const balances = balanceData?.balances || {
    USD: balanceData?.balance || 0,
    USDT: balanceData?.onChainBalance || 0,
    VNDT: 0,
  };

  const transactions = (transactionsData?.transactions || transactionsData || []).slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5">
            <CreditCard className="w-4 h-4" /> Tổng Quan Tài Chính & Số Dư
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Ví Tiền & Thanh Toán
          </h2>
          <p className="text-slate-500 text-xs mt-1 max-w-xl">
            Tóm tắt số dư đa tiền tệ và tài khoản nhận tiền. Để thực hiện nạp tiền PayOS, rút tiền ngân hàng hoặc quy đổi tỷ giá, hãy mở Trung tâm Payment.
          </p>
        </div>

        <Button
          onClick={() => navigate('/wallet')}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md flex items-center gap-2 shrink-0 transition-all hover:scale-105"
        >
          Mở Trung Tâm Thanh Toán & Ví Tiền <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* 3 Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* VNDT Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 font-semibold uppercase flex items-center justify-between">
            <span>Số Dư VND (VNDT)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Khuyên Dùng
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2 text-emerald-600 dark:text-emerald-400">
            {Number(balances.VNDT || 0).toLocaleString()} <span className="text-sm font-sans font-bold">₫</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Hỗ trợ nạp QR PayOS & rút về ngân hàng Việt Nam 24/7
          </div>
        </div>

        {/* USDT Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold uppercase flex items-center justify-between">
            <span>Số Dư USDT (Tether)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Web3 Escrow
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2 text-blue-600 dark:text-blue-400">
            {Number(balances.USDT || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans font-bold">₮</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Ví Custodial on-chain bảo đảm minh bạch Smart Contract
          </div>
        </div>

        {/* USD Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold uppercase flex items-center justify-between">
            <span>Số Dư USD (Fiat Credit)</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Nội Bộ
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono mt-2 text-slate-900 dark:text-white">
            ${Number(balances.USD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Số dư tín dụng thanh toán phần thưởng nhiệm vụ
          </div>
        </div>
      </div>

      {/* Linked Bank & Recent Transactions Preview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Linked Bank Account Card */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" /> Tài Khoản Ngân Hàng
              </h3>
              {bankAccount?.accountNumber && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã Liên Kết
                </span>
              )}
            </div>

            {bankAccount?.accountNumber ? (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-2">
                <div className="text-xs text-slate-400 font-medium">Ngân hàng:</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{bankAccount.bankName || 'MB Bank / Vietcombank'}</div>
                <div className="text-xs text-slate-400 font-medium mt-2">Số tài khoản:</div>
                <div className="text-base font-mono font-black text-slate-900 dark:text-white">{bankAccount.accountNumber}</div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center py-6 text-xs text-slate-500">
                Chưa cấu hình tài khoản nhận tiền rút VND
              </div>
            )}
          </div>

          <Button
            onClick={() => navigate('/wallet')}
            variant="neutral-outline"
            className="w-full mt-4 rounded-xl text-xs font-bold py-2.5"
          >
            Quản Lý & Cập Nhật Tài Khoản
          </Button>
        </div>

        {/* Recent Transactions Preview */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" /> Giao Dịch Gần Đây
            </h3>
            <button
              onClick={() => navigate('/wallet')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Xem tất cả →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Chưa có giao dịch nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-2.5">
              {transactions.map((tx: any, idx: number) => (
                <div
                  key={tx.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      tx.type === 'DEPOSIT' || tx.type === 'BOUNTY_REWARD'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.type === 'DEPOSIT' ? '↓' : tx.type === 'WITHDRAW' ? '↑' : '⇄'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {tx.type?.toLowerCase().replace(/_/g, ' ') || 'Giao dịch'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Gần đây'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {tx.amount ? Number(tx.amount).toLocaleString() : '0'} {tx.currency || ''}
                    </div>
                    <span className={`text-[10px] font-semibold ${
                      tx.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {tx.status || 'Hoàn tất'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePayment;
