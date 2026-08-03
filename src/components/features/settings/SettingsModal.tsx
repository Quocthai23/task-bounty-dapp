import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/shared/atoms/dialog';
import { Switch } from '@/components/shared/atoms/switch';
import { X, Globe, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text)]">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[var(--app-border)] pb-4 mb-4">
          <DialogTitle className="text-xl font-black text-[var(--app-text)]">{t('settings.title')}</DialogTitle>
          <DialogClose className="text-[var(--app-text-tertiary)] hover:text-[var(--app-text)] bg-[var(--app-surface-muted)] hover:opacity-80 rounded-full p-2 transition-colors">
            <X size={18} />
          </DialogClose>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-[var(--app-surface-muted)] rounded-2xl p-4 border border-[var(--app-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[var(--app-text)]">{t('settings.language')}</h4>
                <p className="text-xs font-medium text-[var(--app-text-muted)]">{t('settings.languageSubtitle')}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all font-bold ${i18n.language === 'en' || i18n.language === 'en-US' ? 'border-[var(--color-primary-500)] bg-[var(--app-surface)] shadow-sm text-[var(--color-primary-500)]' : 'border-transparent bg-transparent text-[var(--app-text-muted)] hover:bg-[var(--app-border)]'}`}
              >
                <span>🇬🇧 {t('settings.english')}</span>
                {(i18n.language === 'en' || i18n.language === 'en-US') && <span className="w-3 h-3 rounded-full bg-[var(--color-primary-500)]" />}
              </button>
              
              <button
                onClick={() => changeLanguage('vi')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all font-bold ${i18n.language === 'vi' ? 'border-[var(--color-primary-500)] bg-[var(--app-surface)] shadow-sm text-[var(--color-primary-500)]' : 'border-transparent bg-transparent text-[var(--app-text-muted)] hover:bg-[var(--app-border)]'}`}
              >
                <span>🇻🇳 {t('settings.vietnamese')}</span>
                {i18n.language === 'vi' && <span className="w-3 h-3 rounded-full bg-[var(--color-primary-500)]" />}
              </button>
            </div>
          </div>

          <div className="bg-[var(--app-surface-muted)] rounded-2xl p-4 border border-[var(--app-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center">
                  <Moon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--app-text)]">{t('settings.darkMode')}</h4>
                  <p className="text-xs font-medium text-[var(--app-text-muted)]">{t('settings.darkModeDesc')}</p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
