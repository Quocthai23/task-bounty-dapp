import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogContent, 
} from '@/components/shared/atoms/dialog';
import { Button } from '@/components/shared/atoms/button';
import { Gift, Award, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

interface BonusMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  project: any;
  onConfirmBonus: (memberId: string, amount: number, currency: string, reason: string) => Promise<void>;
}

export const BonusMemberModal: React.FC<BonusMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  project,
  onConfirmBonus,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | ''>(50);
  const [currency, setCurrency] = useState('USD');
  const [reason, setReason] = useState(t('bonusMemberModal.defaultReason'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!member) return null;

  const user = member.user || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error(t('bonusMemberModal.validationAmount'));
      return;
    }
    if (!reason.trim()) {
      toast.error(t('bonusMemberModal.validationReason'));
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmBonus(member.id, Number(amount), currency, reason);
      toast.success(t('bonusMemberModal.successToast', {
        amount,
        currency,
        name: user.firstName || user.email
      }));
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('bonusMemberModal.errorToast'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl"
      >
        {/* Header - Clean White */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('bonusMemberModal.title')}</h2>
              <p className="text-xs text-slate-500">{t('bonusMemberModal.project', { title: project?.title })}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member Profile Badge */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-xl" />
              ) : (
                user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
              </div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {t('bonusMemberModal.roleAndBonus', {
                  role: member.role,
                  amount: (member.bonusReceived || 0).toLocaleString()
                })}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount & Currency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t('bonusMemberModal.amountLabel')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || '')}
                    className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-black text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="50"
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300"
                >
                  <option value="USD">USD</option>
                  <option value="USDT">USDT</option>
                  <option value="VNDT">VNDT</option>
                </select>
              </div>

              {/* Quick Amount presets */}
              <div className="flex gap-2 mt-2">
                {[20, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border transition-colors ${
                      amount === preset
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    +${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                {t('bonusMemberModal.reasonLabel')}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none leading-relaxed"
                placeholder={t('bonusMemberModal.reasonPlaceholder')}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-xs text-slate-500"
              >
                {t('bonusMemberModal.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl px-6 py-2.5 shadow-md shadow-amber-500/20"
              >
                {isSubmitting ? t('bonusMemberModal.sending') : t('bonusMemberModal.confirm')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
