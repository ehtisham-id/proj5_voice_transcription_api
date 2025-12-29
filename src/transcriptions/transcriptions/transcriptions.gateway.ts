import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class TranscriptionsGateway {
  @WebSocketServer()
  server: Server;

  emitStatus(userId: string, status: string) {
    this.server.to(userId).emit('transcription-status', { status });
  }

  @SubscribeMessage('join')
  handleJoin(client: any, payload: { userId: string }) {
    client.join(payload.userId);
  }
}
