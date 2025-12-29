import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class TranscriptionsGateway {
  @WebSocketServer()
  server: Server;

  emitCreated(transcription: any) {
    this.server.emit('transcription.created', transcription);
  }

  emitDeleted(transcriptionId: string) {
    this.server.emit('transcription.deleted', { id: transcriptionId });
  }
}
