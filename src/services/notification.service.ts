import { api, API_URL } from './api';
import { io, Socket } from 'socket.io-client';

export interface NotificationItem {
  id: string;
  userId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  details?: any;
}

class NotificationService {
  public socket: Socket | null = null;

  async getNotifications(
    page: number = 1,
    limit: number = 20,
    category?: string,
    startDate?: string,
    endDate?: string
  ) {
    const params: any = { page, limit };
    if (category && category !== 'ALL') params.category = category;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get('/notifications', { params });
    return response.data;
  }

  async scanDeadlines() {
    const response = await api.get('/notifications/scan-deadlines');
    return response.data;
  }

  async markAsRead(id: string) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  }

  connectSocket(userId?: string) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Connect to the base URL of the API with /notifications namespace
    const socketUrl = API_URL.replace(/\/api$/, '') + '/notifications';
    
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected for notifications');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('notification', callback);
    this.socket.on('newNotification', callback);
  }

  offNotification(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off('notification', callback);
    this.socket.off('newNotification', callback);
  }
}

export const notificationService = new NotificationService();
