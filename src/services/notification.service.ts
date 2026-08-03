import { api, API_URL } from './api';
import { io, Socket } from 'socket.io-client';

class NotificationService {
  public socket: Socket | null = null;

  async getNotifications(page: number = 1, limit: number = 10) {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data;
  }

  connectSocket() {
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
    this.socket.on('newNotification', callback);
  }

  offNotification(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.off('newNotification', callback);
  }
}

export const notificationService = new NotificationService();
