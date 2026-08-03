import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/wallet.service';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet as WalletIcon, 
  RefreshCw, 
  Building2, 
  History, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  PieChart as PieChartIcon, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Gift, 
  Coins, 
  TrendingUp, 
  Info, 
  AlertTriangle,
  CreditCard,
  Send,
  ClipboardPaste,
  CheckCircle2,
  Globe,
  Timer,
  Lock,
  Shield,
  ArrowRightLeft,
  X,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
  presets: number[];
  contractAddress: string;
  color: string;
  isDepositSupported?: boolean;
}

const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: 'VND',
    name: 'Việt Nam Đồng',
    symbol: '₫',
    flag: '🇻🇳',
    decimals: 0,
    presets: [50000, 100000, 200000, 500000, 1000000, 2000000, 5000000],
    contractAddress: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    color: '#10b981', // Emerald
    isDepositSupported: true,
  },
  {
    code: 'USD',
    name: 'Đô la Mỹ',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
    presets: [10, 25, 50, 100, 500],
    contractAddress: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
    color: '#0ea5e9', // Sky Blue
    isDepositSupported: false,
  },
  {
    code: 'EUR',
    name: 'Đồng Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2,
    presets: [10, 25, 50, 100, 500],
    contractAddress: '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
    color: '#6366f1', // Indigo
    isDepositSupported: false,
  },
  {
    code: 'JPY',
    name: 'Yên Nhật',
    symbol: '¥',
    flag: '🇯🇵',
    decimals: 0,
    presets: [1000, 3000, 5000, 10000, 50000],
    contractAddress: '0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9',
    color: '#f43f5e', // Rose
    isDepositSupported: false,
  },
  {
    code: 'CNY',
    name: 'Nhân dân tệ',
    symbol: '¥',
    flag: '🇨🇳',
    decimals: 2,
    presets: [50, 100, 200, 500, 1000],
    contractAddress: '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9',
    color: '#f59e0b', // Amber
    isDepositSupported: false,
  }
];

const SYSTEM_CREDIT_COLOR = '#a855f7'; // Purple

interface BaseCurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
}

const BASE_CURRENCIES: BaseCurrencyConfig[] = [
  { code: 'VND', name: 'VND (Việt Nam)', symbol: '₫', flag: '🇻🇳', decimals: 0 },
  { code: 'USD', name: 'USD (United States)', symbol: '$', flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', name: 'EUR (Eurozone)', symbol: '€', flag: '🇪🇺', decimals: 2 },
  { code: 'JPY', name: 'JPY (Japan)', symbol: '¥', flag: '🇯🇵', decimals: 0 },
  { code: 'CNY', name: 'CNY (China)', symbol: '¥', flag: '🇨🇳', decimals: 2 },
];

// Approximate exchange rates to VND (1 Unit = X VND)
const EXCHANGE_RATES_TO_VND: Record<string, number> = {
  VND: 1,
  USD: 25450,
  EUR: 27600,
  JPY: 168,
  CNY: 3520,
};

// Helper function to validate EVM address
const isValidAddress = (addr: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim());
};

export const Wallet: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Refs
  const workstationRef = React.useRef<HTMLDivElement>(null);
  const amountInputRef = React.useRef<HTMLInputElement>(null);

  // State
  const [baseCurrency, setBaseCurrency] = useState<string>('VND');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('VND');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'swap' | 'history' | 'bank'>('deposit');
  const [withdrawMode, setWithdrawMode] = useState<'bank' | 'wallet'>('bank');
  const [targetWalletAddress, setTargetWalletAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [depositData, setDepositData] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAssetList, setShowAssetList] = useState<boolean>(true);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Dedicated Swap State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [swapFromCurrency, setSwapFromCurrency] = useState<string>('USD');
  const [swapToCurrency, setSwapToCurrency] = useState<string>('VND');
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<string>('ALL');

  // Bank Form State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Queries
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletService.getBalance,
    refetchInterval: depositData ? 3000 : 15000
  });

  const { data: bankData, refetch: refetchBank } = useQuery({
    queryKey: ['bank-account'],
    queryFn: walletService.getBankAccount,
  });

  const { data: transactionsData, isLoading: isTxLoading } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getTransactions({ page: 1, limit: 20 }),
    refetchInterval: 10000
  });

  const { data: exchangeRatesData } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: walletService.getExchangeRates,
    refetchInterval: 60000,
  });

  const { data: treasuryData } = useQuery({
    queryKey: ['treasury-status'],
    queryFn: walletService.getTreasuryStatus,
    refetchInterval: 15000,
  });

  // Quote & 15-Minute Lock State
  const [activeQuote, setActiveQuote] = useState<any>(null);
  const [quoteSecondsLeft, setQuoteSecondsLeft] = useState<number>(0);
  const [isLockingQuote, setIsLockingQuote] = useState<boolean>(false);

  // Countdown timer for 15-min quote
  useEffect(() => {
    if (quoteSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setQuoteSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quoteSecondsLeft]);

  // Request or refresh a guaranteed quote
  const handleRequestQuote = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Vui lòng nhập số lượng cần rút trước khi khóa tỷ giá.');
      return;
    }
    if (num > currentAvailableBalance) {
      toast.error(`Số dư ${selectedCurrency} không đủ để thực hiện báo giá.`);
      return;
    }
    try {
      setIsLockingQuote(true);
      const quote = await walletService.createQuote(selectedCurrency, 'VND', num);
      setActiveQuote(quote);
      setQuoteSecondsLeft(quote.ttlSeconds || 900);
      toast.success(`Đã khóa tỷ giá bảo chứng ECB trong 15 phút! 1 ${selectedCurrency} = ${quote.exchangeRate.toLocaleString()} VND`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tạo báo giá tỷ giá');
    } finally {
      setIsLockingQuote(false);
    }
  };

  const activeCurrencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];
  const activeBaseCurrency = BASE_CURRENCIES.find(b => b.code === baseCurrency) || BASE_CURRENCIES[0];

  const balances = balanceData?.balances || { VND: 0, USD: 0, EUR: 0, JPY: 0, CNY: 0 };
  const currentAvailableBalance = balanceData?.breakdown?.[selectedCurrency]?.onChain ?? (balances[selectedCurrency] ?? 0);

  // Currency Conversion Helper with Frankfurter Live ECB Rates
  const liveRatesToVnd = exchangeRatesData?.ratesToVND || EXCHANGE_RATES_TO_VND;

  const convertToBase = (amt: number, fromCurr: string, targetBase: string = baseCurrency): number => {
    const inVnd = amt * (liveRatesToVnd[fromCurr] || EXCHANGE_RATES_TO_VND[fromCurr] || 1);
    const inTarget = inVnd / (liveRatesToVnd[targetBase] || EXCHANGE_RATES_TO_VND[targetBase] || 1);
    return inTarget;
  };

  const formatNumber = (val: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  // Build Asset Allocations
  const assetItems = SUPPORTED_CURRENCIES.map(curr => {
    const bal = balanceData?.breakdown?.[curr.code]?.onChain ?? (balances[curr.code] ?? 0);
    const convertedVal = convertToBase(bal, curr.code, baseCurrency);
    return {
      id: curr.code,
      code: curr.code,
      name: curr.name,
      symbol: curr.symbol,
      flag: curr.flag,
      decimals: curr.decimals,
      amount: bal,
      convertedVal,
      color: curr.color,
      type: 'MAIN' as const,
      isDepositSupported: curr.isDepositSupported,
    };
  });

  // System Credit Item
  const systemCreditAmount = balanceData?.systemCredit || 0;
  const systemCreditConverted = convertToBase(systemCreditAmount, 'VND', baseCurrency);
  const systemCreditItem = {
    id: 'SYSTEM_CREDIT',
    code: 'CREDIT',
    name: 'Điểm Thưởng Hoạt Động (Nội bộ)',
    symbol: 'PTS',
    flag: '🎁',
    decimals: 0,
    amount: systemCreditAmount,
    convertedVal: systemCreditConverted,
    color: SYSTEM_CREDIT_COLOR,
    type: 'SYSTEM_CREDIT' as const,
    isDepositSupported: false,
  };

  const allAssets = [...assetItems, systemCreditItem];

  // Totals in Base Currency
  const totalMainInBase = assetItems.reduce((acc, it) => acc + it.convertedVal, 0);
  const totalEstimatedBalance = totalMainInBase + systemCreditConverted;

  // Chart Slices
  const activeSlices = allAssets
    .filter(a => a.convertedVal > 0)
    .map(a => {
      const percentage = totalEstimatedBalance > 0 ? (a.convertedVal / totalEstimatedBalance) * 100 : 0;
      return {
        ...a,
        percentage,
      };
    });

  // Track deposit completion
  useEffect(() => {
    if (depositData && currentAvailableBalance > 0) {
      toast.success(`Nạp tiền ${selectedCurrency} thành công! Số dư đã được cộng vào tài khoản.`);
    }
  }, [currentAvailableBalance, depositData, selectedCurrency]);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTargetWalletAddress(text.trim());
        toast.success('Đã dán địa chỉ ví từ Clipboard!');
      }
    } catch {
      toast.error('Không thể truy cập Clipboard, vui lòng dán thủ công.');
    }
  };

  // Currency Selection with support check
  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
    setDepositData(null);
    if (activeTab === 'deposit' && code !== 'VND') {
      toast.info(`Cổng nạp PayOS hiện chỉ hỗ trợ đồng VND. Các loại ngoại tệ (${code}) đang trong giai đoạn thử nghiệm.`);
    }
  };

  // Mutations
  const depositMutation = useMutation({
    mutationFn: (amt: number) => walletService.deposit(amt, '', selectedCurrency),
    onSuccess: (data) => {
      setDepositData(data.paymentInstructions);
      setAmount('');
      toast.success('Đã tạo liên kết thanh toán PayOS thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể khởi tạo yêu cầu nạp tiền');
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: (amt: number) => 
      walletService.withdraw(
        amt, 
        '', 
        selectedCurrency, 
        withdrawMode === 'wallet' ? 'WALLET' : 'BANK',
        withdrawMode === 'wallet' ? targetWalletAddress.trim() : undefined,
        withdrawMode === 'bank' && selectedCurrency !== 'VND' ? activeQuote?.quoteId : undefined,
        selectedCurrency,
        withdrawMode === 'bank' ? 'VND' : selectedCurrency
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['treasury-status'] });
      setAmount('');
      setActiveQuote(null);
      setQuoteSecondsLeft(0);
      if (withdrawMode === 'wallet') {
        toast.success(`Đã chuyển thành công ${amount} ${selectedCurrency} tới địa chỉ ví!`);
        setTargetWalletAddress('');
      } else {
        toast.success('Yêu cầu rút tiền & kiều hối về tài khoản ngân hàng đã được tiếp nhận và xử lý!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể thực hiện giao dịch');
    }
  });

  const updateBankMutation = useMutation({
    mutationFn: (data: { bankName: string; accountNumber: string }) => walletService.updateBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-account'] });
      setBankName('');
      setAccountNumber('');
      toast.success('Đã lưu tài khoản ngân hàng thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật tài khoản ngân hàng');
    }
  });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCurrency !== 'VND') {
      toast.error('Hệ thống hiện tại chỉ hỗ trợ nạp tiền tự động qua đồng VND.');
      return;
    }
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    depositMutation.mutate(num);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error('Vui lòng nhập số tiền / số lượng hợp lệ');
      return;
    }
    if (num > currentAvailableBalance) {
      toast.error(`Số dư ${selectedCurrency} không đủ (${formatNumber(currentAvailableBalance, activeCurrencyInfo.decimals)} khả dụng)`);
      return;
    }

    if (withdrawMode === 'wallet') {
      if (!targetWalletAddress || !isValidAddress(targetWalletAddress)) {
        toast.error('Vui lòng nhập đúng định dạng địa chỉ ví người nhận (0x...)');
        return;
      }
    } else {
      if (!bankData?.bankName || !bankData?.accountNumber) {
        toast.error('Vui lòng liên kết tài khoản ngân hàng trước khi rút tiền');
        setActiveTab('bank');
        return;
      }
    }

    withdrawMutation.mutate(num);
  };

  const scrollToWorkstation = (focusInput = true) => {
    setTimeout(() => {
      if (workstationRef.current) {
        workstationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (focusInput && amountInputRef.current) {
        amountInputRef.current.focus();
      }
    }, 100);
  };

  // Swap Mutation (Web2 Pure Custodial Swap)
  const swapMutation = useMutation({
    mutationFn: (data: { from: string; to: string; amount: number; quoteId?: string }) =>
      walletService.swap(data.from, data.to, data.amount, data.quoteId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['treasury-status'] });
      toast.success(`Quy đổi thành công ${formatNumber(data.sourceAmount, 2)} ${data.sourceCurrency} sang ${formatNumber(data.targetAmount, 2)} ${data.targetCurrency}!`);
      setSwapAmount('');
      setIsSwapModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Quy đổi ngoại tệ thất bại');
    }
  });

  const handleExecuteSwap = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = Number(swapAmount);
    if (!num || num <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ cần đổi');
      return;
    }
    const srcBalance = balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0);
    if (num > srcBalance) {
      toast.error(`Số dư ${swapFromCurrency} không đủ (${formatNumber(srcBalance, 2)} khả dụng)`);
      return;
    }
    swapMutation.mutate({
      from: swapFromCurrency,
      to: swapToCurrency,
      amount: num,
    });
  };

  const handleOpenSwap = (fromCurr: string = 'USD', toCurr: string = 'VND') => {
    setSwapFromCurrency(fromCurr);
    setSwapToCurrency(toCurr);
    setSwapAmount('');
    setIsSwapModalOpen(true);
  };

  const handleCardClick = (asset: any) => {
    if (asset.type === 'MAIN') {
      setSelectedCurrency(asset.code);
      setSelectedHistoryFilter(asset.code);
      setActiveTab('history');
      scrollToWorkstation(false);
      toast.info(`Đang xem lịch sử giao dịch của ${asset.name} (${asset.code})`);
    }
  };

  const handleOpenDeposit = (currCode: string = 'VND') => {
    setSelectedCurrency(currCode);
    setActiveTab('deposit');
    setDepositData(null);
    scrollToWorkstation(true);
    if (currCode !== 'VND') {
      toast.info(`Cổng nạp PayOS hiện chỉ hỗ trợ đồng VND. Các loại ngoại tệ (${currCode}) đang trong giai đoạn thử nghiệm.`);
    } else {
      toast.info('Đã chuyển đến biểu mẫu nạp tiền VND qua PayOS');
    }
  };

  const handleOpenWithdraw = (currCode: string = selectedCurrency, mode: 'bank' | 'wallet' = 'bank') => {
    setSelectedCurrency(currCode);
    setWithdrawMode(mode);
    setActiveTab('withdraw');
    setDepositData(null);
    scrollToWorkstation(true);
    toast.info(`Đã chuyển đến biểu mẫu ${mode === 'bank' ? 'rút tiền về ngân hàng' : 'chuyển tiền tới ví số'}`);
  };

  // Donut geometry calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-slate-800">
      
      {/* ========================================================================= */}
      {/* TOP HEADER & BASE CURRENCY BAR (CLEAN MODERN WHITE CARD)                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Quản Lý Tài Khoản & Số Dư
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Cổng thanh toán tự động PayOS & Chuyển tiền kiều hối Cross-Currency tức thì
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Base Currency Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-inner">
            <span className="text-xs text-slate-500 px-2.5 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Đồng cơ sở:
            </span>
            <div className="flex gap-1">
              {BASE_CURRENCIES.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setBaseCurrency(b.code)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    baseCurrency === b.code
                      ? 'bg-blue-600 text-white shadow-sm font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                  title={b.name}
                >
                  <span>{b.flag}</span>
                  <span>{b.code}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { refetchBalance(); refetchBank(); }}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isBalanceLoading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIVE ECB EXCHANGE RATES TICKER                                            */}
      {/* ========================================================================= */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-md">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Tỷ Giá Hối Đoái Trực Tiếp (ECB / Frankfurter API)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Sync
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">🇺🇸 1 USD</div>
            <div className="text-sm sm:text-base font-mono font-black text-amber-300 mt-1">
              {(liveRatesToVnd['USD'] || 25450).toLocaleString()} ₫
            </div>
          </div>
          <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">🇪🇺 1 EUR</div>
            <div className="text-sm sm:text-base font-mono font-black text-blue-300 mt-1">
              {(liveRatesToVnd['EUR'] || 27650).toLocaleString()} ₫
            </div>
          </div>
          <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">🇯🇵 100 JPY</div>
            <div className="text-sm sm:text-base font-mono font-black text-emerald-300 mt-1">
              {((liveRatesToVnd['JPY'] || 163) * 100).toLocaleString()} ₫
            </div>
          </div>
          <div className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-400 flex items-center justify-center gap-1">🇨🇳 1 CNY</div>
            <div className="text-sm sm:text-base font-mono font-black text-rose-300 mt-1">
              {(liveRatesToVnd['CNY'] || 3510).toLocaleString()} ₫
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION: ESTIMATED TOTAL BALANCE & ALLOCATION DONUT                  */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm p-6 sm:p-8">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Total Estimated Valuation */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tổng Tài Sản Ước Tính</span>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-slate-400">≈</span>
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 font-mono">
                  {isBalanceLoading ? (
                    <span className="text-slate-400 animate-pulse">Đang tính toán...</span>
                  ) : (
                    `${formatNumber(totalEstimatedBalance, activeBaseCurrency.decimals)} ${activeBaseCurrency.symbol}`
                  )}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {activeBaseCurrency.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Được quy đổi tự động theo tỷ giá chuẩn sang đồng tiền cơ sở {activeBaseCurrency.name}.
              </p>
            </div>

            {/* Dual-Balance Sub Breakdown Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Withdrawable Balance */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Số Dư Khả Dụng
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">RÚT / CHUYỂN</span>
                </div>
                <div className="text-xl font-bold text-emerald-950 font-mono">
                  ≈ {formatNumber(totalMainInBase, activeBaseCurrency.decimals)} {activeBaseCurrency.symbol}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {totalEstimatedBalance > 0 ? ((totalMainInBase / totalEstimatedBalance) * 100).toFixed(1) : 100}% tổng tài sản
                </div>
              </div>

              {/* Bonus / System Credit */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs text-purple-800 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-purple-600" /> Điểm Thưởng Hoạt Động
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">NỘI BỘ</span>
                </div>
                <div className="text-xl font-bold text-purple-950 font-mono">
                  ≈ {formatNumber(systemCreditConverted, activeBaseCurrency.decimals)} {activeBaseCurrency.symbol}
                </div>
                <div className="text-[11px] text-purple-700 font-medium">
                  {totalEstimatedBalance > 0 ? ((systemCreditConverted / totalEstimatedBalance) * 100).toFixed(1) : 0}% (Dùng cho Bounty/Task)
                </div>
              </div>
            </div>

            {/* Global Action Bar (Thanh Hành Động Chung 3 Nút Nổi Bật) */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleOpenDeposit('VND')}
                  className="flex items-center justify-center gap-2.5 text-sm font-black px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:shadow-lg active:scale-98"
                >
                  <ArrowDownLeft className="w-5 h-5" /> + Nạp Tiền
                </button>
                <button
                  onClick={() => handleOpenWithdraw('VND', 'bank')}
                  className="flex items-center justify-center gap-2.5 text-sm font-black px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all cursor-pointer hover:shadow-lg active:scale-98"
                >
                  <ArrowUpRight className="w-5 h-5" /> - Rút Tiền
                </button>
                <button
                  onClick={() => handleOpenSwap('USD', 'VND')}
                  className="flex items-center justify-center gap-2.5 text-sm font-black px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer hover:shadow-lg active:scale-98"
                >
                  <ArrowRightLeft className="w-5 h-5" /> 🔄 Quy Đổi (Swap)
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setShowAssetList(!showAssetList)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/80 transition-colors cursor-pointer"
                >
                  {showAssetList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showAssetList ? 'Thu gọn danh sách tiền tệ' : 'Xem chi tiết các loại tiền'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive Donut Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between w-full mb-3 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-blue-600" /> Phân Bổ Danh Mục
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Chạm để xem chi tiết</span>
            </div>

            {/* Donut Container */}
            <div className="relative w-48 h-48 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="20"
                  fill="transparent"
                />

                {/* Slices */}
                {activeSlices.length > 0 ? (
                  activeSlices.map((slice) => {
                    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += slice.percentage;

                    const isHovered = hoveredSlice === slice.id;

                    return (
                      <circle
                        key={slice.id}
                        cx="100"
                        cy="100"
                        r={radius}
                        stroke={slice.color}
                        strokeWidth={isHovered ? 26 : 20}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        fill="transparent"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(slice.id)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })
                ) : (
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    stroke="#cbd5e1"
                    strokeWidth="20"
                    strokeDasharray={`${circumference} ${circumference}`}
                    fill="transparent"
                  />
                )}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {hoveredSlice ? (
                  (() => {
                    const item = allAssets.find(a => a.id === hoveredSlice);
                    const slice = activeSlices.find(s => s.id === hoveredSlice);
                    return (
                      <>
                        <span className="text-xl">{item?.flag}</span>
                        <span className="text-xs font-bold text-slate-800 mt-0.5">{item?.name}</span>
                        <span className="text-sm font-black text-blue-600 font-mono">
                          {slice ? `${slice.percentage.toFixed(1)}%` : '0%'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[110px]">
                          ≈ {formatNumber(item?.convertedVal || 0, activeBaseCurrency.decimals)} {activeBaseCurrency.symbol}
                        </span>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <WalletIcon className="w-5 h-5 text-blue-600 mb-0.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Tổng tài sản</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatNumber(totalEstimatedBalance, activeBaseCurrency.decimals)} {activeBaseCurrency.symbol}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{activeSlices.length} Loại tiền</span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Color Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-3 pt-3 border-t border-slate-200 text-xs">
              {allAssets.map(asset => {
                const isHovered = hoveredSlice === asset.id;
                const slice = activeSlices.find(s => s.id === asset.id);
                const percent = slice ? slice.percentage.toFixed(1) : '0.0';

                return (
                  <div
                    key={asset.id}
                    onMouseEnter={() => setHoveredSlice(asset.id)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isHovered ? 'bg-slate-200/80 text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: asset.color }} />
                      <span className="font-bold text-[11px] truncate">{asset.code} ({asset.symbol})</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-700">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED ASSET BREAKDOWN LIST (WHITE CARDS)                                */}
      {/* ========================================================================= */}
      {showAssetList && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-600" /> Chi Tiết Các Loại Tiền & Số Dư
            </h2>
            <span className="text-xs text-slate-500">
              Quy đổi sang <strong className="text-slate-800 font-bold">{activeBaseCurrency.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allAssets.map((asset) => {
              const isSelected = selectedCurrency === asset.code;
              const isMain = asset.type === 'MAIN';

              return (
                <div
                  key={asset.id}
                  onClick={() => handleCardClick(asset)}
                  className={`rounded-3xl p-5 border transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md ${
                    isSelected && isMain
                      ? 'bg-blue-50/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-3xl">{asset.flag}</span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{asset.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isMain 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {isMain ? asset.code : 'Thưởng'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[160px]">
                            {asset.code} ({asset.symbol})
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: asset.color }} />
                      </div>
                    </div>

                    {/* Balances Display */}
                    <div className="space-y-1.5 my-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>Số dư thực tế:</span>
                        <strong className="text-slate-900 font-mono text-sm font-bold">
                          {formatNumber(asset.amount, asset.decimals)} {asset.symbol}
                        </strong>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                        <span>Giá trị quy đổi:</span>
                        <span className="text-blue-600 font-mono font-bold">
                          ≈ {formatNumber(asset.convertedVal, activeBaseCurrency.decimals)} {activeBaseCurrency.symbol}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Informational Footer (NO cluttering buttons) */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      {isMain ? 'Chạm để xem lịch sử' : 'Dùng cho Bounty/Task'}
                    </span>
                    {isSelected && isMain && (
                      <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                        Đang chọn ●
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSTATION TABS & ACTIVE FLOWS                                           */}
      {/* ========================================================================= */}
      <div ref={workstationRef} id="workstation-tabs" className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden scroll-mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-2 overflow-x-auto bg-slate-50/70">
          <button
            onClick={() => { setActiveTab('deposit'); setDepositData(null); }}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'deposit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Nạp tiền ({selectedCurrency})
          </button>

          <button
            onClick={() => { setActiveTab('withdraw'); setDepositData(null); }}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'withdraw'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Rút tiền ({selectedCurrency})
          </button>

          <button
            onClick={() => { setActiveTab('swap'); setDepositData(null); }}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'swap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" /> Quy đổi ngoại tệ (Swap)
          </button>

          <button
            onClick={() => { setActiveTab('history'); setDepositData(null); }}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Lịch sử giao dịch
          </button>

          <button
            onClick={() => { setActiveTab('bank'); setDepositData(null); }}
            className={`pb-4 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" /> Tài khoản ngân hàng
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* ========================================================================= */}
          {/* TAB 1: DEPOSIT                                                            */}
          {/* ========================================================================= */}
          {activeTab === 'deposit' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Nạp Tiền Vào Tài Khoản</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Chuyển khoản qua cổng thanh toán tự động PayOS. Tiền sẽ được cộng tức thì vào số dư khả dụng của bạn.
                </p>
              </div>

              {/* Currency Selector Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Chọn loại tiền muốn nạp:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SUPPORTED_CURRENCIES.map(c => {
                    const isSelected = selectedCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => handleCurrencySelect(c.code)}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">{c.flag}</span>
                        <span className="text-xs font-bold">{c.code}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {c.symbol}
                        </span>
                        {c.code === 'VND' ? (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Tự động
                          </span>
                        ) : (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            Sắp có
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Non-VND Warning Notice */}
              {selectedCurrency !== 'VND' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Ngoại tệ {selectedCurrency} chưa hỗ trợ nạp tự động</span>
                  </div>
                  <p className="text-amber-800">
                    Hiện tại hệ thống thanh toán tự động qua PayOS chỉ hỗ trợ đồng <strong>VND (Việt Nam Đồng)</strong>. Các loại ngoại tệ ({selectedCurrency}) sẽ sớm được mở trong phiên bản tiếp theo.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenDeposit('VND')}
                    className="mt-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Chuyển sang nạp bằng VND 🇻🇳
                  </button>
                </div>
              )}

              {!depositData ? (
                <form onSubmit={handleDepositSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>Số tiền nạp ({activeCurrencyInfo.symbol}):</span>
                      {selectedCurrency === 'VND' && (
                        <span className="text-emerald-600 font-bold">
                          ✓ Hỗ trợ thanh toán QR tự động PayOS
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        ref={amountInputRef}
                        type="number"
                        step="any"
                        placeholder={`Nhập số tiền ${selectedCurrency}...`}
                        value={amount}
                        disabled={selectedCurrency !== 'VND'}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full text-lg font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors disabled:opacity-50 disabled:bg-slate-100 ring-offset-2 focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                        {activeCurrencyInfo.symbol}
                      </span>
                    </div>
                  </div>

                  {/* Preset Buttons */}
                  {selectedCurrency === 'VND' && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Chọn nhanh mệnh giá VND:</span>
                      <div className="flex flex-wrap gap-2">
                        {activeCurrencyInfo.presets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setAmount(preset.toString())}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors cursor-pointer"
                          >
                            +{preset.toLocaleString()} {activeCurrencyInfo.symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={depositMutation.isPending || !amount || selectedCurrency !== 'VND'}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {depositMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                    {selectedCurrency === 'VND' ? 'Tạo Yêu Cầu Nạp Tiền PayOS' : 'Chỉ hỗ trợ nạp VND'}
                  </button>
                </form>
              ) : (
                /* PayOS Payment QR Code Display */
                <div className="space-y-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Quét Mã QR Thanh Toán PayOS</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mở ứng dụng ngân hàng và quét mã QR để chuyển khoản chính xác.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                      Đang chờ thanh toán
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                    {depositData.qrCode ? (
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                        <QRCodeSVG value={depositData.qrCode} size={220} level="M" />
                      </div>
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                        QR Code Not Available
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="text-slate-900 font-bold">{depositData.bankName || 'MB Bank'}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">{depositData.accountNumber}</span>
                        <button onClick={() => copyToClipboard(depositData.accountNumber, 'Số tài khoản')} className="text-slate-500 hover:text-slate-900 cursor-pointer">
                          {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Số tiền:</span>
                      <span className="text-emerald-700 font-bold text-sm">
                        {depositData.amount?.toLocaleString()} VND
                      </span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Nội dung chuyển khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 font-bold">{depositData.description}</span>
                        <button onClick={() => copyToClipboard(depositData.description, 'Nội dung chuyển khoản')} className="text-slate-500 hover:text-slate-900 cursor-pointer">
                          {copiedField === 'Nội dung chuyển khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setDepositData(null)}
                      className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                    >
                      Hủy Yêu Cầu
                    </button>
                    {depositData.checkoutUrl && (
                      <a
                        href={depositData.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Mở Cổng PayOS
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: WITHDRAW & TRANSFER (DUAL METHOD FLOW: BANK vs DIGITAL WALLET)      */}
          {/* ========================================================================= */}
          {activeTab === 'withdraw' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Rút Tiền & Chuyển Khoản</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn kênh nhận tiền: Rút thẳng về Tài khoản Ngân hàng hoặc Chuyển tức thì đến Địa chỉ Ví Số.
                </p>
              </div>

              {/* Withdrawal Method Switcher (2 Channels) */}
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setWithdrawMode('bank')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    withdrawMode === 'bank'
                      ? 'bg-white text-amber-800 shadow-sm font-extrabold border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>1. Về Ngân Hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWithdrawMode('wallet')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    withdrawMode === 'wallet'
                      ? 'bg-white text-blue-800 shadow-sm font-extrabold border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>2. Đến Ví Số (0x...)</span>
                </button>
              </div>

              {/* Currency Selector Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Chọn loại tiền muốn rút/chuyển:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SUPPORTED_CURRENCIES.map(c => {
                    const cBal = balanceData?.breakdown?.[c.code]?.onChain ?? (balances[c.code] ?? 0);
                    const isSelected = selectedCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        onClick={() => setSelectedCurrency(c.code)}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? withdrawMode === 'bank' 
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                              : 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">{c.flag}</span>
                        <span className="text-xs font-bold">{c.code}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {formatNumber(cBal, c.decimals)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel 1: Bank Account Display */}
              {withdrawMode === 'bank' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-900 font-bold flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-600" /> Ngân hàng nhận tiền:
                    </span>
                    <button 
                      onClick={() => setActiveTab('bank')} 
                      className="text-amber-700 hover:underline font-bold text-xs cursor-pointer"
                    >
                      Thay đổi / Liên kết mới
                    </button>
                  </div>
                  <div className="font-mono text-sm text-slate-900 font-bold">
                    {bankData?.bankName || 'Chưa liên kết'} - {bankData?.accountNumber || 'Vui lòng liên kết tài khoản ngân hàng'}
                  </div>
                </div>
              )}

              {/* Channel 2: Destination Wallet Address Input */}
              {withdrawMode === 'wallet' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-blue-600" /> Địa chỉ ví người nhận (0x...):
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteAddress}
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-xs cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" /> Dán từ Clipboard
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ ví đích 0x..."
                      value={targetWalletAddress}
                      onChange={(e) => setTargetWalletAddress(e.target.value.trim())}
                      className="w-full font-mono text-xs font-bold bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                    />
                    {targetWalletAddress && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {isValidAddress(targetWalletAddress) ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Chưa hợp lệ
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ chuyển tức thì giữa các ví tài khoản trong hệ thống hoặc các ví đối tác tương thích.
                  </p>
                </div>
              )}

              <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-slate-700">Số lượng ({activeCurrencyInfo.symbol}):</label>
                    <span className="text-emerald-700 font-mono font-bold">
                      Khả dụng: {formatNumber(currentAvailableBalance, activeCurrencyInfo.decimals)} {activeCurrencyInfo.symbol}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder={`Nhập số lượng ${selectedCurrency}...`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full text-lg font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3.5 focus:outline-none focus:bg-white transition-colors ${
                        withdrawMode === 'bank' ? 'focus:border-amber-600' : 'focus:border-blue-600'
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      {activeCurrencyInfo.symbol}
                    </span>
                  </div>
                </div>

                {/* Percentage Quick Selector */}
                <div className="flex gap-2">
                  {[0.25, 0.5, 0.75, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const newAmt = (currentAvailableBalance * pct).toFixed(activeCurrencyInfo.decimals);
                        setAmount(newAmt);
                        setActiveQuote(null);
                        setQuoteSecondsLeft(0);
                      }}
                      className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      {pct * 100}% {pct === 1 ? '(Tối đa)' : ''}
                    </button>
                  ))}
                </div>

                {/* ================================================================= */}
                {/* 15-MINUTE GUARANTEED EXCHANGE RATE QUOTE WIDGET (CROSS-CURRENCY)   */}
                {/* ================================================================= */}
                {withdrawMode === 'bank' && selectedCurrency !== 'VND' && Number(amount) > 0 && (
                  <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-sm">
                          <ArrowRightLeft className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                            Kiều Hối: Đốt {selectedCurrency} → Giải Ngân VND
                          </div>
                          <div className="text-[11px] text-indigo-700/80">
                            Khóa tỷ giá bảo chứng ECB 15 phút (Zero Slippage Guarantee)
                          </div>
                        </div>
                      </div>

                      {activeQuote && quoteSecondsLeft > 0 ? (
                        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold font-mono">
                          <Timer className="w-3.5 h-3.5 animate-spin" />
                          <span>
                            Còn {Math.floor(quoteSecondsLeft / 60)}:{(quoteSecondsLeft % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          Chưa khóa tỷ giá
                        </span>
                      )}
                    </div>

                    {/* Rate details & Lock button */}
                    {!activeQuote || quoteSecondsLeft <= 0 ? (
                      <div className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Tỷ giá tham chiếu hiện tại:</span>
                          <span className="font-bold font-mono text-slate-900">
                            1 {selectedCurrency} = {(liveRatesToVnd[selectedCurrency] || 25450).toLocaleString()} VND
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Số tiền VND dự kiến nhận:</span>
                          <span className="font-bold font-mono text-indigo-700 text-sm">
                            ≈ {(Number(amount) * (liveRatesToVnd[selectedCurrency] || 25450)).toLocaleString()} VND
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleRequestQuote}
                          disabled={isLockingQuote || Number(amount) <= 0 || Number(amount) > currentAvailableBalance}
                          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isLockingQuote ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                          Khóa Tỷ Giá Bảo Chứng 15 Phút Ngay
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-slate-500">Mã Báo Giá (Quote ID):</span>
                          <span className="font-mono font-bold text-slate-700 text-[11px]">
                            #{activeQuote.quoteId.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Tỷ giá đã khóa cố định:</span>
                          <span className="font-mono font-bold text-emerald-700">
                            1 {selectedCurrency} = {activeQuote.exchangeRate.toLocaleString()} VND
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Phí giao dịch & Đổi ngoại tệ:</span>
                          <span className="font-bold text-emerald-600">0 VND (100% Miễn phí)</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
                          <span className="font-bold text-slate-900">Thực nhận về tài khoản:</span>
                          <span className="font-black font-mono text-emerald-700 text-base">
                            {activeQuote.targetAmount.toLocaleString()} VND
                          </span>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleRequestQuote}
                            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Làm mới báo giá
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Simple Payout for Direct VND */}
                {Number(amount) > 0 && withdrawMode === 'bank' && selectedCurrency === 'VND' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex justify-between items-center">
                    <span>Số tiền VND nhận về tài khoản ngân hàng:</span>
                    <strong className="font-mono text-sm text-slate-900 font-bold">
                      {Number(amount).toLocaleString()} VND
                    </strong>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    withdrawMutation.isPending || 
                    !amount || 
                    Number(amount) <= 0 || 
                    Number(amount) > currentAvailableBalance ||
                    (withdrawMode === 'wallet' && !isValidAddress(targetWalletAddress)) ||
                    (withdrawMode === 'bank' && selectedCurrency !== 'VND' && (!activeQuote || quoteSecondsLeft <= 0))
                  }
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                    withdrawMode === 'bank'
                      ? 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {withdrawMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : withdrawMode === 'bank' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {withdrawMode === 'bank' 
                    ? (selectedCurrency === 'VND' ? 'Xác Nhận Rút Về Ngân Hàng' : 'Xác Nhận Rút Kiều Hối Về Ngân Hàng')
                    : 'Xác Nhận Chuyển Tiền Đến Ví'}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SWAP (QUY ĐỔI NGOẠI TỆ INSTANT WEB2)                                */}
          {/* ========================================================================= */}
          {activeTab === 'swap' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Quy Đổi Ngoại Tệ Tức Thì (Swap)</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Chuyển đổi tức thì giữa các loại tiền tệ (USD, EUR, VND, JPY, CNY) theo tỷ giá thị trường ECB thời gian thực. Phí 0%.
                </p>
              </div>

              <form onSubmit={handleExecuteSwap} className="space-y-4">
                {/* FROM CARD */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold">Từ (Bạn đổi):</span>
                    <span className="font-mono font-medium">
                      Khả dụng:{' '}
                      <strong className="text-slate-900 font-bold">
                        {formatNumber(balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0), 2)}{' '}
                        {swapFromCurrency}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.0"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="w-full text-2xl font-black font-mono bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-300"
                    />

                    <select
                      value={swapFromCurrency}
                      onChange={(e) => {
                        const newFrom = e.target.value;
                        setSwapFromCurrency(newFrom);
                        if (newFrom === swapToCurrency) {
                          setSwapToCurrency(SUPPORTED_CURRENCIES.find(c => c.code !== newFrom)?.code || 'VND');
                        }
                      }}
                      className="bg-white border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm hover:border-slate-300"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Percentage Presets */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[25, 50, 75, 100].map((pct) => {
                      const srcBal = balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0);
                      return (
                        <button
                          type="button"
                          key={pct}
                          onClick={() => {
                            const calculated = (srcBal * pct) / 100;
                            setSwapAmount(calculated.toString());
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200/80 text-[11px] font-bold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                        >
                          {pct === 100 ? 'Tối đa (Max)' : `${pct}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SWAP DIRECTION SWITCH BUTTON */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      const prevFrom = swapFromCurrency;
                      const prevTo = swapToCurrency;
                      setSwapFromCurrency(prevTo);
                      setSwapToCurrency(prevFrom);
                    }}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-md text-blue-600 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-all transform hover:rotate-180 cursor-pointer"
                    title="Đảo chiều quy đổi"
                  >
                    <ArrowUpDown className="w-5 h-5" />
                  </button>
                </div>

                {/* TO CARD */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold">Sang (Bạn nhận ước tính):</span>
                    <span className="font-mono font-medium">
                      Số dư hiện tại:{' '}
                      <strong className="text-slate-900 font-bold">
                        {formatNumber(balanceData?.breakdown?.[swapToCurrency]?.onChain ?? (balances[swapToCurrency] ?? 0), 2)}{' '}
                        {swapToCurrency}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {(() => {
                      const srcVnd = liveRatesToVnd[swapFromCurrency] || 1;
                      const tgtVnd = liveRatesToVnd[swapToCurrency] || 1;
                      const rate = srcVnd / tgtVnd;
                      const calculatedTarget = Number(swapAmount) > 0 ? (Number(swapAmount) * rate) : 0;
                      const targetDecimals = SUPPORTED_CURRENCIES.find(c => c.code === swapToCurrency)?.decimals ?? 2;

                      return (
                        <input
                          type="text"
                          readOnly
                          value={Number(swapAmount) > 0 ? formatNumber(calculatedTarget, targetDecimals) : '0.0'}
                          className="w-full text-2xl font-black font-mono bg-transparent text-emerald-700 focus:outline-none"
                        />
                      );
                    })()}

                    <select
                      value={swapToCurrency}
                      onChange={(e) => {
                        const newTo = e.target.value;
                        setSwapToCurrency(newTo);
                        if (newTo === swapFromCurrency) {
                          setSwapFromCurrency(SUPPORTED_CURRENCIES.find(c => c.code !== newTo)?.code || 'USD');
                        }
                      }}
                      className="bg-white border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm hover:border-slate-300"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* RATE & FEE BREAKDOWN */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
                  {(() => {
                    const srcVnd = liveRatesToVnd[swapFromCurrency] || 1;
                    const tgtVnd = liveRatesToVnd[swapToCurrency] || 1;
                    const rate = srcVnd / tgtVnd;
                    return (
                      <div className="flex items-center justify-between text-indigo-950 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600" /> Tỷ giá thị trường (ECB):
                        </span>
                        <span className="font-mono font-bold text-blue-700">
                          1 {swapFromCurrency} ≈ {rate < 1 ? rate.toFixed(6) : formatNumber(rate, 2)} {swapToCurrency}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-indigo-100">
                    <span>Phí quy đổi:</span>
                    <span className="font-bold text-emerald-600">0% (Hoàn toàn miễn phí)</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Thời gian xử lý:</span>
                    <span className="font-bold text-slate-800">Tức thì (&lt; 1 giây • Sổ cái bảo chứng)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    swapMutation.isPending ||
                    !swapAmount ||
                    Number(swapAmount) <= 0 ||
                    Number(swapAmount) > (balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0))
                  }
                  className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-98"
                >
                  {swapMutation.isPending ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="w-5 h-5" />
                  )}
                  {swapMutation.isPending ? 'Đang quy đổi...' : `Xác Nhận Đổi ${swapAmount || 0} ${swapFromCurrency} Sang ${swapToCurrency}`}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: TRANSACTION HISTORY                                                */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Lịch Sử Giao Dịch Thu / Chi</h2>
                  <p className="text-xs text-slate-500">
                    Chi tiết các lần nạp, rút, kiều hối và thưởng hoạt động trong tài khoản của bạn.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Tải lại
                  </button>
                </div>
              </div>

              {/* Currency Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 pb-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-bold mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" /> Lọc tiền tệ:
                </span>
                <button
                  onClick={() => setSelectedHistoryFilter('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedHistoryFilter === 'ALL'
                      ? 'bg-blue-600 text-white shadow-sm font-black'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedHistoryFilter(c.code)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      selectedHistoryFilter === c.code
                        ? 'bg-blue-600 text-white shadow-sm font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                  </button>
                ))}
              </div>

              {(() => {
                const txListRaw = Array.isArray(transactionsData)
                  ? transactionsData
                  : (transactionsData?.data || (transactionsData as any)?.transactions || []);

                if (isTxLoading) {
                  return <div className="py-12 text-center text-slate-500 text-xs">Đang tải lịch sử giao dịch...</div>;
                }

                const txList = selectedHistoryFilter === 'ALL'
                  ? txListRaw
                  : txListRaw.filter((tx: any) => 
                      tx.currency === selectedHistoryFilter ||
                      tx.sourceCurrency === selectedHistoryFilter ||
                      tx.targetCurrency === selectedHistoryFilter
                    );

                if (!txList || txList.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      {selectedHistoryFilter === 'ALL' 
                        ? 'Chưa có giao dịch nào được ghi nhận.' 
                        : `Không có giao dịch nào liên quan đến ${selectedHistoryFilter}.`}
                    </div>
                  );
                }

                const getFriendlyTypeName = (type: string, txHash?: string) => {
                  switch (type) {
                    case 'DEPOSIT':
                      return 'Nạp tiền (PayOS)';
                    case 'WITHDRAW':
                      return txHash?.startsWith('to_0x') ? 'Chuyển ví số' : 'Rút về ngân hàng';
                    case 'SWAP':
                      return 'Quy đổi ngoại tệ';
                    case 'PAYOUT':
                      return 'Thanh toán nhiệm vụ';
                    case 'REFUND':
                      return 'Hoàn trả số dư';
                    case 'LOCK':
                      return 'Tạm giữ bảo chứng';
                    case 'GRANT_CREDIT':
                    case 'CREDIT_GRANT':
                      return 'Thưởng hoạt động';
                    default:
                      return type;
                  }
                };

                const getFriendlyStatus = (status: string) => {
                  switch (status) {
                    case 'COMPLETED':
                      return { text: 'Thành công', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
                    case 'PENDING':
                      return { text: 'Đang xử lý', color: 'text-amber-700 bg-amber-50 border-amber-200' };
                    case 'FAILED':
                      return { text: 'Thất bại', color: 'text-rose-700 bg-rose-50 border-rose-200' };
                    default:
                      return { text: status, color: 'text-slate-700 bg-slate-50 border-slate-200' };
                  }
                };

                return (
                  <div className="space-y-2.5">
                    {txList.map((tx: any) => {
                      const isPositive = ['DEPOSIT', 'PAYOUT', 'REFUND', 'GRANT_CREDIT', 'CREDIT_GRANT'].includes(tx.type);
                      const isSwap = tx.type === 'SWAP';
                      const statusInfo = getFriendlyStatus(tx.status);
                      const typeLabel = getFriendlyTypeName(tx.type, tx.txHash);

                      return (
                        <div
                          key={tx.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 flex items-center justify-between transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isSwap
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : isPositive 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {isSwap ? (
                                <ArrowRightLeft className="w-5 h-5" />
                              ) : isPositive ? (
                                <ArrowDownLeft className="w-5 h-5" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <span>
                                  {tx.sourceCurrency && tx.targetCurrency && tx.sourceCurrency !== tx.targetCurrency
                                    ? `Quy đổi (${tx.sourceCurrency} → ${tx.targetCurrency})`
                                    : typeLabel}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200">
                                  {tx.currency || 'VND'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                                {tx.targetAmount && tx.sourceCurrency !== tx.targetCurrency && (
                                  <span className="text-emerald-700 font-mono font-bold">
                                    • Nhận: {tx.targetAmount.toLocaleString()} {tx.targetCurrency}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`font-mono text-sm font-bold ${
                              isSwap ? 'text-indigo-700' : isPositive ? 'text-emerald-700' : 'text-amber-700'
                            }`}>
                              {isSwap ? '⇄ ' : isPositive ? '+' : '-'}{tx.amount?.toLocaleString()} {tx.currency || 'VND'}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-0.5 ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: BANK ACCOUNT                                                       */}
          {/* ========================================================================= */}
          {activeTab === 'bank' && (
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Liên Kết Tài Khoản Ngân Hàng</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Cung cấp thông tin tài khoản ngân hàng chính chủ để nhận tiền khi rút tiền về ngân hàng.
                </p>
              </div>

              {bankData && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-xs">
                  <div className="text-slate-500">Tài khoản hiện tại:</div>
                  <div className="text-slate-900 font-bold text-sm">
                    {bankData.bankName} - {bankData.accountNumber}
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!bankName || !accountNumber) {
                    toast.error('Vui lòng điền đầy đủ tên ngân hàng và số tài khoản');
                    return;
                  }
                  updateBankMutation.mutate({ bankName, accountNumber });
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tên ngân hàng (Ví dụ: MB Bank, Vietcombank, Techcombank):</label>
                  <input
                    type="text"
                    placeholder="Nhập tên ngân hàng..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full text-sm font-bold bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số tài khoản ngân hàng:</label>
                  <input
                    type="text"
                    placeholder="Nhập số tài khoản..."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full text-sm font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateBankMutation.isPending || !bankName || !accountNumber}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updateBankMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Lưu Tài Khoản Ngân Hàng
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED SWAP MODAL (POPUP CHUYÊN DỤNG CHO QUY ĐỔI NGOẠI TỆ)             */}
      {/* ========================================================================= */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-400/30">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">Quy Đổi Ngoại Tệ (Instant Swap)</h3>
                  <p className="text-xs text-slate-300">Tỷ giá ECB thời gian thực • Phí 0% • Xử lý tức thì</p>
                </div>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleExecuteSwap} className="p-6 space-y-4">
              {/* FROM CARD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold">Từ (Bạn đổi):</span>
                  <span className="font-mono font-medium">
                    Khả dụng:{' '}
                    <strong className="text-slate-900 font-bold">
                      {formatNumber(balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0), 2)}{' '}
                      {swapFromCurrency}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.0"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    className="w-full text-2xl font-black font-mono bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-300"
                  />

                  {/* Currency Select */}
                  <select
                    value={swapFromCurrency}
                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setSwapFromCurrency(newFrom);
                      if (newFrom === swapToCurrency) {
                        setSwapToCurrency(SUPPORTED_CURRENCIES.find(c => c.code !== newFrom)?.code || 'VND');
                      }
                    }}
                    className="bg-white border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm hover:border-slate-300"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Percentage Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[25, 50, 75, 100].map((pct) => {
                    const srcBal = balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0);
                    return (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => {
                          const calculated = (srcBal * pct) / 100;
                          setSwapAmount(calculated.toString());
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200/80 text-[11px] font-bold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                      >
                        {pct === 100 ? 'Tối đa (Max)' : `${pct}%`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SWAP DIRECTION SWITCH BUTTON */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    const prevFrom = swapFromCurrency;
                    const prevTo = swapToCurrency;
                    setSwapFromCurrency(prevTo);
                    setSwapToCurrency(prevFrom);
                  }}
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-md text-blue-600 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-all transform hover:rotate-180 cursor-pointer"
                  title="Đảo chiều quy đổi"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </button>
              </div>

              {/* TO CARD */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold">Sang (Bạn nhận ước tính):</span>
                  <span className="font-mono font-medium">
                    Số dư hiện tại:{' '}
                    <strong className="text-slate-900 font-bold">
                      {formatNumber(balanceData?.breakdown?.[swapToCurrency]?.onChain ?? (balances[swapToCurrency] ?? 0), 2)}{' '}
                      {swapToCurrency}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {(() => {
                    const srcVnd = liveRatesToVnd[swapFromCurrency] || 1;
                    const tgtVnd = liveRatesToVnd[swapToCurrency] || 1;
                    const rate = srcVnd / tgtVnd;
                    const calculatedTarget = Number(swapAmount) > 0 ? (Number(swapAmount) * rate) : 0;
                    const targetDecimals = SUPPORTED_CURRENCIES.find(c => c.code === swapToCurrency)?.decimals ?? 2;

                    return (
                      <input
                        type="text"
                        readOnly
                        value={Number(swapAmount) > 0 ? formatNumber(calculatedTarget, targetDecimals) : '0.0'}
                        className="w-full text-2xl font-black font-mono bg-transparent text-emerald-700 focus:outline-none"
                      />
                    );
                  })()}

                  {/* Currency Select */}
                  <select
                    value={swapToCurrency}
                    onChange={(e) => {
                      const newTo = e.target.value;
                      setSwapToCurrency(newTo);
                      if (newTo === swapFromCurrency) {
                        setSwapFromCurrency(SUPPORTED_CURRENCIES.find(c => c.code !== newTo)?.code || 'USD');
                      }
                    }}
                    className="bg-white border border-slate-200 font-bold text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none cursor-pointer shadow-sm hover:border-slate-300"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* EXCHANGE RATE & FEE BREAKDOWN */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
                {(() => {
                  const srcVnd = liveRatesToVnd[swapFromCurrency] || 1;
                  const tgtVnd = liveRatesToVnd[swapToCurrency] || 1;
                  const rate = srcVnd / tgtVnd;
                  return (
                    <div className="flex items-center justify-between text-indigo-950 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600" /> Tỷ giá thị trường (ECB):
                      </span>
                      <span className="font-mono font-bold text-blue-700">
                        1 {swapFromCurrency} ≈ {rate < 1 ? rate.toFixed(6) : formatNumber(rate, 2)} {swapToCurrency}
                      </span>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-indigo-100">
                  <span>Phí quy đổi:</span>
                  <span className="font-bold text-emerald-600">0% (Hoàn toàn miễn phí)</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Thời gian xử lý:</span>
                  <span className="font-bold text-slate-800">Tức thì (&lt; 1 giây • Sổ cái bảo chứng)</span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={
                  swapMutation.isPending ||
                  !swapAmount ||
                  Number(swapAmount) <= 0 ||
                  Number(swapAmount) > (balanceData?.breakdown?.[swapFromCurrency]?.onChain ?? (balances[swapFromCurrency] ?? 0))
                }
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-98"
              >
                {swapMutation.isPending ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-5 h-5" />
                )}
                {swapMutation.isPending ? 'Đang quy đổi...' : `Xác Nhận Đổi ${swapAmount || 0} ${swapFromCurrency} Sang ${swapToCurrency}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
