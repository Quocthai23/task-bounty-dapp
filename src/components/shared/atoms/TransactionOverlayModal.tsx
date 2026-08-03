import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/atoms/dialog';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TransactionOverlayModalProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'error';
  txHash?: string;
  message?: string;
  onClose: () => void;
}

export const TransactionOverlayModal: React.FC<TransactionOverlayModalProps> = ({ 
  isOpen, 
  status, 
  txHash, 
  message, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && status !== 'processing' && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Trạng Thái Giao Dịch</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <p className="text-center font-bold text-slate-800">Đang xử lý giao dịch an toàn...</p>
              <p className="text-xs text-slate-500 text-center">Vui lòng không đóng cửa sổ hoặc tải lại trang trong lúc xử lý.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              <p className="text-center font-bold text-emerald-700">Giao dịch thành công!</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-rose-600" />
              <p className="text-center font-bold text-rose-700">Giao dịch thất bại</p>
            </>
          )}
          
          {message && <p className="text-xs text-slate-600 text-center mt-2 font-medium">{message}</p>}
          
          {txHash && (
            <div className="text-xs text-slate-500 mt-4 break-all text-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl font-mono">
              Mã giao dịch: {txHash}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
