import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  api = 'http://localhost:3000/notifications';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.api}/unread-count`);
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.api}/${id}/read`, {});
  }

  markAllAsRead() {
    return this.http.patch(`${this.api}/read-all`, {});
  }
}
