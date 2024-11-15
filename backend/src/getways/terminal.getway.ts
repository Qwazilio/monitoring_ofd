import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Card } from 'src/entities/card.entity';
import { Terminal } from 'src/entities/terminal.entity';
import { CardService } from 'src/realizations/card/card.service';
import { TerminalService } from 'src/realizations/terminal/terminal.service';

@WebSocketGateway({
  cors: true,
  transport: ['websocket']
})
export class TerminalGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly terminalService: TerminalService,
    private readonly cardService: CardService
  ){}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('import')
  async handleImport(
    @ConnectedSocket() client: Socket,
    @MessageBody() { terminals }: { terminals: any }
  ) {
    for (const terminal of terminals) {
      const _terminal = await this.terminalService.upsert(terminal as Terminal, terminal.card as Card);
      const _card = await this.cardService.upsert(terminal.card as Card, _terminal);
      await this.terminalService.update({ id: _terminal.id, active_card: _card });
    }
    this.sendTerminalList();
  }
  
  @SubscribeMessage('updateTerminal')
  async handleUpdate(
    @MessageBody() terminal: Terminal
  ) {
    const updated_terminal = await this.terminalService.update(terminal)
    this.sendTerminalList()
  }

  async sendTerminalList(){
    const terminals = await this.terminalService.getAll()
    this.server.emit('terminalListChanged', terminals);
  }
}
