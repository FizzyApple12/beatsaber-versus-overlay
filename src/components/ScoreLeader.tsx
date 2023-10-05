import { FC, useState } from 'react';
import { Client } from '../ta-client/lib/client';
import { Models } from '../ta-client/models/proto/models';
import { useInterval } from 'usehooks-ts';

export type ScoreLeaderProps = {
    client: Client;
    leftPlayerUUID: string;
    rightPlayerUUID: string;
};

export const ScoreLeader: FC<ScoreLeaderProps> = ({
    client,
    leftPlayerUUID,
    rightPlayerUUID
}) => {
    const [leadPercent, setLeadPercent] = useState(0);

    useInterval(() => {
        if (
            client.Matches.length == 0 ||
            (client.getPlayer(leftPlayerUUID)?.play_state !=
                Models.User.PlayStates.InGame &&
                client.getPlayer(rightPlayerUUID)?.play_state !=
                    Models.User.PlayStates.InGame)
        ) {
            setLeadPercent(0);
            return;
        }

        const leftPlayerScore =
            client
                .getMatchPlayers(client.Matches[0])
                .find((player) => player.guid == leftPlayerUUID)?.score_details
                .score || 0;

        const rightPlayerScore =
            client
                .getMatchPlayers(client.Matches[0])
                .find((player) => player.guid == rightPlayerUUID)?.score_details
                .score || 0;

        if (rightPlayerScore > leftPlayerScore)
            setLeadPercent(
                Math.cbrt((rightPlayerScore - leftPlayerScore) /
                    (leftPlayerScore + rightPlayerScore))
            );
        else
            setLeadPercent(
                -Math.cbrt((leftPlayerScore - rightPlayerScore) /
                    (leftPlayerScore + rightPlayerScore))
            );
    }, 1000);

    return (
        <div
            className="scoreLeader"
            style={{
                top:
                    client.getPlayer(leftPlayerUUID)?.play_state ==
                        Models.User.PlayStates.InGame ||
                    client.getPlayer(rightPlayerUUID)?.play_state ==
                        Models.User.PlayStates.InGame
                        ? 72
                        : 52
            }}
        >
            <div
                className="scoreLeaderBar1"
                style={{
                    width: `calc(${leadPercent < 0 ? -leadPercent : 0} * 50vw)`
                }}
            />

            <div
                className="scoreLeaderBar2"
                style={{
                    width: `calc(${leadPercent > 0 ? leadPercent : 0} * 50vw)`
                }}
            />
        </div>
    );
};
