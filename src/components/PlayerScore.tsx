import { FC, useState } from 'react';
import { Client } from '../ta-client/lib/client';
import { Models } from '../ta-client/models/proto/models';
import { useInterval } from 'usehooks-ts';

export type PlayerScoreProps = {
    client: Client;
    matchUUID: string;
    playerUUID: string;
    leftPlayer: boolean;
};

export const PlayerScore: FC<PlayerScoreProps> = ({
    client,
    matchUUID,
    playerUUID,
    leftPlayer
}) => {
    const [score, setScore] = useState(0);
    const [accuracy, setAccuracy] = useState(0);

    const [inGame, setInGame] = useState(false);

    useInterval(() => {
        if (
            client.Matches.length == 0 ||
            client.getPlayer(playerUUID)?.play_state !=
                Models.User.PlayStates.InGame
        ) {
            setInGame(false);
            return;
        }
        setInGame(true);

        const currentMatch = client.getMatch(matchUUID);

        if (!currentMatch) return;

        const pScore = client
            .getMatchPlayers(currentMatch)
            .find((player) => player.guid == playerUUID)?.score_details.score;

        const pAcc = client
            .getMatchPlayers(currentMatch)
            .find((player) => player.guid == playerUUID)
            ?.score_details.accuracy;

        setScore(pScore || 0);

        setAccuracy(pAcc || 0);
    }, 1000);

    return (
        <div
            className={`playerScoreBase playerScore${
                leftPlayer ? 'Left' : 'Right'
            }`}
            style={{
                bottom: inGame ? 12 : undefined
            }}
        >
            <h1 className="playerScoreText">
                {(accuracy * 100).toPrecision(4)}%<br />
                {score}
            </h1>
        </div>
    );
};
