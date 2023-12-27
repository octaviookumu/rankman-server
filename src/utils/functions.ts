import {
  FormattedNominations,
  FormattedParticipants,
  FormattedRankings,
  Poll,
  Result,
} from 'src/poll/interfaces';

export const getResults = (
  rankings: FormattedRankings,
  nominations: FormattedNominations,
  votesPerVoter: number,
): Result[] => {
  try {
    // 1. Each value of `rankings` key values is an array of a participants'
    // vote. Points for each array element corresponds to following formula:
    // r_n = ((votesPerVoter - 0.5*n) / votesPerVoter)^(n+1), where n corresponds
    // to array index of rankings.
    // Accumulate score per nominationID
    // console.log('nominations', votesPerVoter, rankings, nominations);
    const scores: { [nominationID: string]: number } = {};

    // const nominationsMap = nominations.reduce((result, item) => {
    //   result[item.id] = item.nominationText;
    //   return result;
    // }, {});

    Object.values(rankings).forEach((userRankings) => {
      userRankings.forEach((nominationID, n) => {
        const voteValue = Math.pow(
          (votesPerVoter - 0.5 * n) / votesPerVoter,
          n + 1,
        );

        scores[nominationID] = (scores[nominationID] ?? 0) + voteValue;
      });
    });

    // 2. Take nominationID to score mapping, and merge in nominationText
    // and nominationID into value
    const results = Object.entries(scores).map(([nominationID, score]) => ({
      nominationID,
      nominationText: nominations[nominationID].text,
      score,
    }));

    // 3. Sort values by score in descending order
    results.sort((res1, res2) => res2.score - res1.score);

    return results;
  } catch (error) {
    console.log('Failed to return results', error);
  }
};

export const formatParticipants = (poll: Poll): FormattedParticipants => {
  const formattedParticipants = poll.participants.reduce(
    (result, participant) => {
      result[participant.id] = participant;
      return result;
    },
    {},
  );
  return formattedParticipants;
};
