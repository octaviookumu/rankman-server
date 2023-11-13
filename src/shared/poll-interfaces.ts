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

export interface Result {
  nominationID: string;
  nominationText: string;
  score: number;
}

export interface Poll {
  id: string;
  topic: string;
  votesPerVoter: number;
  participants: Participants;
  adminID: string;
  nominations: Nominations;
  rankings: Rankings;
  results: Result[];
  hasStarted: boolean;
}
