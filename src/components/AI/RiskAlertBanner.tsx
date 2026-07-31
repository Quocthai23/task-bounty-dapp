import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/shared/atoms/badge';
import './RiskAlertBanner.css';

interface Alert {
  id: string;
  taskId: string;
  taskTitle: string;
  riskScore: number;
  message: string;
}

export const RiskAlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Mocking WebSocket behavior that triggers a warning from NestJS cron job
    const mockSocketEvent = setTimeout(() => {
      setAlerts([{
        id: 'alert-1',
        taskId: 't-101',
        taskTitle: 'Setup Blockchain Smart Contracts',
        riskScore: 75,
        message: 'Task [Setup Blockchain Smart Contracts] có nguy cơ chậm tiến độ cao. Lý do: Đã dùng 70% thời gian nhưng chưa có code mới đẩy lên.'
      }]);
    }, 3000);

    return () => clearTimeout(mockSocketEvent);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="risk-banner-container animate-fade-in">
      {alerts.map(alert => (
        <div key={alert.id} className="risk-banner glass-panel">
          <div className="risk-banner-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
          <div className="risk-banner-content">
            <div className="risk-banner-title">
              <strong>AI Risk Alert</strong>
              <Badge variant="destructive" className="animate-pulse">Score: {alert.riskScore}/100</Badge>
            </div>
            <p>{alert.message}</p>
          </div>
          <button className="risk-banner-close" onClick={() => dismissAlert(alert.id)}>&times;</button>
        </div>
      ))}
    </div>
  );
};
