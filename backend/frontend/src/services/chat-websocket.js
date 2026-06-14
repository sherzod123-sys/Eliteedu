/**
 * chat-websocket.js
 * Django Channels 4.x bilan ishlash uchun to'g'ri WebSocket client
 *
 * Barcha eventlar: new_message, reaction_updated, message_edited,
 * message_deleted, message_pinned, message_unpinned, messages_read,
 * typing, user_status, error
 */

class ChatWebSocket {
    constructor({ roomId, token, onEvent, siteUrl = 'http://127.0.0.1:8000' }) {
      this.roomId   = roomId;
      this.token    = token;
      this.onEvent  = onEvent;  // callback: (type, data) => void
      this.siteUrl  = siteUrl;
      this.ws       = null;
      this.reconnectTimer   = null;
      this.reconnectDelay   = 2000;   // 2 sekund
      this.maxReconnectDelay = 30000; // 30 sekund
      this.shouldReconnect  = true;
      this.pingInterval     = null;
  
      this.connect();
    }
  
    // ==================== Connection ====================
  
    connect() {
      const wsBase = this.siteUrl.replace(/^http/, 'ws');
      // ✅ Token query param orqali yuboriladi
      const url = `${wsBase}/ws/chat/${this.roomId}/?token=${this.token}`;
  
      console.log(`[WS] Connecting to ${url}`);
      this.ws = new WebSocket(url);
  
      this.ws.onopen    = () => this._onOpen();
      this.ws.onmessage = (e) => this._onMessage(e);
      this.ws.onclose   = (e) => this._onClose(e);
      this.ws.onerror   = (e) => this._onError(e);
    }
  
    disconnect() {
      this.shouldReconnect = false;
      clearTimeout(this.reconnectTimer);
      clearInterval(this.pingInterval);
      if (this.ws) this.ws.close(1000, 'User disconnected');
    }
  
    _onOpen() {
      console.log('[WS] Connected ✅');
      this.reconnectDelay = 2000; // reset
  
      // ✅ Ping yuborish — ulanishni tirik saqlash
      this.pingInterval = setInterval(() => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000);
  
      this.onEvent('connected', {});
    }
  
    _onClose(event) {
      clearInterval(this.pingInterval);
      console.warn(`[WS] Closed: code=${event.code}, reason=${event.reason}`);
  
      if (event.code === 4001) {
        console.error('[WS] Auth xato — reconnect qilinmaydi');
        this.onEvent('auth_error', {});
        return;
      }
  
      if (this.shouldReconnect) {
        console.log(`[WS] ${this.reconnectDelay}ms dan keyin qayta ulanish...`);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
          this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
        }, this.reconnectDelay);
      }
    }
  
    _onError(error) {
      console.error('[WS] Error:', error);
    }
  
    _onMessage(event) {
      try {
        const data = JSON.parse(event.data);
        const type = data.type;
  
        console.debug(`[WS] received: type=${type}`, data);
  
        // ✅ Barcha event turlarini handle qilish
        switch (type) {
          case 'new_message':
            this.onEvent('new_message', data.message);
            break;
  
          case 'reaction_updated':
            this.onEvent('reaction_updated', data.message);
            break;
  
          case 'message_edited':
            this.onEvent('message_edited', data.message);
            break;
  
          case 'message_deleted':
            this.onEvent('message_deleted', data.message);
            break;
  
          case 'message_pinned':
            this.onEvent('message_pinned', data.pin);
            break;
  
          case 'message_unpinned':
            this.onEvent('message_unpinned', { pin_id: data.pin_id });
            break;
  
          case 'messages_read':
            this.onEvent('messages_read', { user_id: data.user_id });
            break;
  
          case 'typing':
            this.onEvent('typing', {
              user_id:  data.user_id,
              username: data.username,
              is_typing: data.is_typing,
            });
            break;
  
          case 'user_status':
            this.onEvent('user_status', {
              user_id:   data.user_id,
              is_online: data.is_online,
              last_seen: data.last_seen,
            });
            break;
  
          case 'error':
            console.error('[WS] Server error:', data.message);
            this.onEvent('error', { message: data.message });
            break;
  
          case 'pong':
          case 'ping':
            break; // ignore
  
          default:
            console.warn('[WS] Noma\'lum event:', type, data);
        }
      } catch (e) {
        console.error('[WS] JSON parse xato:', e);
      }
    }
  
    // ==================== Send Actions ====================
  
    _send(payload) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(payload));
      } else {
        console.warn('[WS] WebSocket ochiq emas, yuborib bo\'lmadi');
      }
    }
  
    /** Matnli xabar yuborish */
    sendText(content, replyToId = null) {
      this._send({
        type: 'text',
        content,
        reply_to_id: replyToId,
      });
    }
  
    /**
     * Ovozli xabar yuborish (kichik fayllar — max ~1MB).
     * Katta fayllar uchun HTTP POST /api/chat/rooms/:id/messages/send/ ishlating.
     * @param {Blob} audioBlob  — MediaRecorder dan olingan audio blob
     * @param {number} duration — sekundlarda davomiyligi
     */
    async sendVoice(audioBlob, duration = 0, replyToId = null) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result; // "data:audio/webm;base64,..."
          this._send({
            type: 'voice',
            audio: base64,
            duration,
            reply_to_id: replyToId,
          });
          resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
    }
  
    /** Emoji reaksiya */
    sendReaction(messageId, emoji) {
      this._send({ type: 'react', message_id: messageId, emoji });
    }
  
    /** Typing indicator */
    sendTyping(isTyping) {
      this._send({ type: 'typing', is_typing: isTyping });
    }
  
    /** Xabarni o'chirish */
    deleteMessage(messageId) {
      this._send({ type: 'delete', message_id: messageId });
    }
  
    /** Xabarni tahrirlash */
    editMessage(messageId, content) {
      this._send({ type: 'edit', message_id: messageId, content });
    }
  
    /** Pin qo'yish */
    pinMessage(messageId) {
      this._send({ type: 'pin', message_id: messageId });
    }
  
    /** Pinni olib tashlash */
    unpinMessage(pinId) {
      this._send({ type: 'unpin', pin_id: pinId });
    }
  
    /** Forward qilish */
    forwardMessage(messageId, targetRoomId) {
      this._send({ type: 'forward', message_id: messageId, target_room_id: targetRoomId });
    }
  
    /** Xabarlarni o'qildi deb belgilash */
    markRead() {
      this._send({ type: 'read' });
    }
  }
  
  
  // ==================== Ishlatish misoli ====================
  
  /*
  const chat = new ChatWebSocket({
    roomId:  42,
    token:   'eyJhbGciOi...', // JWT access token
    siteUrl: 'http://127.0.0.1:8000',
  
    onEvent: (type, data) => {
      switch (type) {
        case 'new_message':
          console.log('Yangi xabar:', data);
          // addMessageToUI(data);
          break;
  
        case 'reaction_updated':
          console.log('Reaksiya yangilandi:', data);
          // updateReactionsInUI(data);
          break;
  
        case 'message_edited':
          console.log('Xabar tahrirlandi:', data);
          break;
  
        case 'message_deleted':
          console.log('Xabar o\'chirildi:', data);
          break;
  
        case 'message_pinned':
          console.log('Pin qo\'yildi:', data);
          break;
  
        case 'message_unpinned':
          console.log('Pin olib tashlandi:', data);
          break;
  
        case 'typing':
          console.log(`${data.username} yozmoqda: ${data.is_typing}`);
          break;
  
        case 'user_status':
          console.log(`User ${data.user_id} online: ${data.is_online}`);
          break;
      }
    }
  });
  
  // Matn yuborish
  chat.sendText('Salom!');
  chat.sendText('Javob beraman', replyToId=5);
  
  // Ovozli xabar (MediaRecorder dan)
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    await chat.sendVoice(blob, duration=15);
  };
  
  // Emoji
  chat.sendReaction(messageId=10, emoji='👍');
  
  // Typing
  inputEl.addEventListener('input', () => {
    chat.sendTyping(true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => chat.sendTyping(false), 1500);
  });
  
  // Cleanup
  window.addEventListener('beforeunload', () => chat.disconnect());
  */
  
  export default ChatWebSocket;