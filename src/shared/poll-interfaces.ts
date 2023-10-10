export interface Participants {
  [participantID: string]: string;
}

export interface Nomination {
  userID: string;
  text: string;
}

export interface Nominations {
  [nominationID: string]: Nomination;
}

export interface Rankings {
  [userID: string]: string[];
}

interface Result {
  nominationID: string;
  nominationText: string;
  score: number;
}

export type Results = Result[];

export interface Poll {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  nominations: Nominations;
  rankings: Rankings;
  results: Results;
  hasStarted: boolean;
}
