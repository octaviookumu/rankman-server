import { Nomination } from './poll-interfaces';
import { Socket } from 'socket.io';

// service interfaces
export interface CreatePollFields {
  topic: string;
  votesPerVoter: number;
  name: string;
}

export interface JoinPollFields {
  pollID: string;
  name: string;
}

export interface RejoinPollFields {
  pollID: string;
  userID: string;
  name: string;
}

export interface AddParticipantFields {
  pollID: string;
  userID: string;
  name: string;
}

export interface AddNominationFields {
  pollID: string;
  userID: string;
  text: string;
}

export interface SubmitRankingsFields {
  pollID: string;
  userID: string;
  rankings: string[];
}

// repository types
// used when adding to db. Might rename this file
export interface CreatePollData {
  pollID: string;
  topic: string;
  votesPerVoter: number;
  userID: string;
}

export interface AddParticipantData {
  pollID: string;
  userID: string;
  name: string;
}

export interface AddNominationData {
  pollID: string;
  nominationID: string;
  nomination: Nomination;
}

export interface AddParticipantRankingsData {
  pollID: string;
  userID: string;
  rankings: string[];
}

export interface AddResultData {
  nominationID: string;
  nominationText: string;
  score: number;
}

// guard types
export interface AuthPayload {
  userID: string;
  pollID: string;
  name: string;
}

export type RequestWithAuth = Request & AuthPayload;
export type SocketWithAuth = Socket & AuthPayload;
