import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { SocketService, ChatItem } from '../socket.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('chatBox') chatBox!: ElementRef<HTMLDivElement>;

  // input fields
  username = '';
  message = '';

  // locked identity for highlight + join
  myUsername = '';

  // stream of chat + system items
  messages$!: Observable<ChatItem[]>;

  constructor(private socket: SocketService) {
    this.messages$ = this.socket.itemsObs$;
  }

  ngAfterViewChecked(): void {
    const el = this.chatBox?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  submit() {
    const u = this.username.trim();
    const m = this.message.trim();
    if (!u || !m) return;

    // lock the identity the first time user sends a message
    if (!this.myUsername) this.myUsername = u;

    this.socket.sendMessage(u, m);
    this.message = '';
  }

  trackByTs(_: number, item: ChatItem) {
    return item.ts;
  }
}
