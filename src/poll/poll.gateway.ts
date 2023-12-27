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
// import { CreatePollDto } from './dto/create-poll.dto';
// import { UpdatePollDto } from './dto/update-poll.dto';
import {
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Namespace } from 'socket.io';
import { NominationDto } from './dto/nomination.dto';
import { WsCatchAllFilter } from './exceptions/ws-catch-all-filter';
import { GatewayAdminGuard } from 'src/auth/gateway-admin.guard';
import { SocketWithAuth } from './interfaces';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
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
    this.logger.log(`handleDisconnect`);
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

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant ${id} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollService.removeParticipant(
      client.pollID,
      id,
    );

    if (updatedPoll) {
      this.io.to(client.pollID).emit('poll_updated', updatedPoll);
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

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_nomination')
  async removeNomination(
    @MessageBody('id') nominationID: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove nomination ${nominationID} from poll ${client.pollID}`,
    );

    const updatedPoll = await this.pollService.removeNomination(
      client.pollID,
      nominationID,
    );

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('start_vote')
  async startVote(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Attempting to start voting for poll: ${client.pollID}`);

    const updatedPoll = await this.pollService.startPoll(client.pollID);

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @SubscribeMessage('submit_rankings')
  async submitRankings(
    @ConnectedSocket() client: SocketWithAuth,
    @MessageBody('rankings') rankings: string[],
  ): Promise<void> {
    this.logger.debug(
      `Submitting votes for user: ${client.userID} belonging to pollID: ${client.pollID}`,
    );

    const updatedPoll = await this.pollService.submitRankings({
      userID: client.userID,
      pollID: client.pollID,
      rankings,
    });

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('close_poll')
  async closePoll(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Closing poll ${client.pollID} and computing results`);

    const updatedPoll = await this.pollService.computeResults(client.pollID);

    this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('cancel_poll')
  async cancelPoll(@ConnectedSocket() client: SocketWithAuth): Promise<void> {
    this.logger.debug(`Cancelling poll with id: ${client.pollID}`);

    await this.pollService.cancelPoll(client.pollID);

    this.io.to(client.pollID).emit('poll_cancelled');
  }
}
