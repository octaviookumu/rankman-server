import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { PollService } from './poll.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from 'src/shared/interfaces';
import { NominationDto } from './dto/nomination.dto';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: 'poll',
})
export class PollGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PollGateway.name);
  constructor(private readonly pollService: PollService) {}

  @WebSocketServer() io: Namespace;

  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized`);
  }

  async handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug('Show client:', client);

    this.logger.debug(
      `Socket connected with userID: ${client.userID}, pollID: ${client.pollID} and name ${client.name}`,
    );
    this.logger.log(`WS with client id: ${client.id} connected!`);
    this.logger.debug(`Number of sockets connected: ${sockets.size}`);

    // Get the poll the person needs to connect to from their token
    const roomName = client.pollID;

    // have a socket join the room
    await client.join(roomName);

    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(
      `userID: ${client.userID} joined room with name: ${roomName}`,
    );
    this.logger.debug(
      `Total client connected to room ${roomName}: ${connectedClients}`,
    );

    const updatedPoll = await this.pollService.addParticipant({
      pollID: client.pollID,
      userID: client.userID,
      name: client.name,
    });

    // send event to all clients connected to a room/poll
    // can change if you only want to send the participants names instead of the whole poll
    this.io.to(roomName).emit('poll_updated', updatedPoll);
  }

  async handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    const { pollID, userID, id } = client;
    const updatedPoll = await this.pollService.removeParticipant(
      pollID,
      userID,
    );

    const roomName = pollID;
    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.log(`Disconnected socket id: ${id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Total clients connected to room ${roomName}: ${connectedClients}`,
    );

    // updatedPoll could be undefined if the poll already started
    // in this case the socket is disconnected but not the poll state
    if (updatedPoll) {
      this.io.to(roomName).emit('poll_updated', updatedPoll);
    }
  }

  @SubscribeMessage('nominate')
  async nominate(
    @MessageBody() nomination: NominationDto,
    @ConnectedSocket() client: SocketWithAuth,
  ): Promise<void> {
    this.logger.debug(
      `Attempting to add nomination for user ${client.userID} to poll ${client.pollID}\n${nomination.text}`,
    );

    const updatedPoll = await this.pollService.addNomination({
      pollID: client.pollID,
      userID: client.userID,
      text: nomination.text,
    });

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }
}
