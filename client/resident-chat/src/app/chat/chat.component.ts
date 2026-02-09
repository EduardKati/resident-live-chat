import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { SocketService, ChatMessage } from '../socket.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  username = '';
  message = '';
  messages$!: Observable<ChatMessage[]>;

  constructor(private socket: SocketService) {
    this.messages$ = this.socket.messagesObs$;
  }

  submit() {
    const u = this.username.trim();
    const m = this.message.trim();
    if (!u || !m) return;

    this.socket.sendMessage(u, m);
    this.message = '';
  }

  trackByTs(_: number, item: ChatMessage) {
    return item.ts;
  }
}
