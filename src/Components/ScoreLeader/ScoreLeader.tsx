import { FC, useEffect, useState } from 'react';
import { Client, EventReceiver, Models, TAEvents } from '../../TAClient';
import { useClientEvent } from '../../Hooks/useClientEvent';

import './ScoreLeader.css';

export type ScoreLeaderProps = {
    client: Client;
    leftPlayerUUID: string;
    rightPlayerUUID: string;
    playing: boolean;
};

export const ScoreLeader: FC<ScoreLeaderProps> = ({
    client,
    leftPlayerUUID,
    rightPlayerUUID,
    playing
}) => {
    const [leadPercent, setLeadPercent] = useState(0);

    const [leftPlayerScore, setLeftPlayerScore] = useState(0);
    const [rightPlayerScore, setRightPlayerScore] = useState(0);

    const onRealtimeScore: EventReceiver<
        TAEvents.PacketEvent<Models.RealtimeScore>
    > = ({ data }) => {
        if (data.user_guid == leftPlayerUUID) {
            setLeftPlayerScore(data.score);
        } else if (data.user_guid == rightPlayerUUID) {
            setRightPlayerScore(data.score);
        }
    };

    useClientEvent('realtimeScore', onRealtimeScore, client);

    useEffect(() => {
        if (rightPlayerScore > leftPlayerScore)
            setLeadPercent(
                Math.cbrt(
                    (rightPlayerScore - leftPlayerScore) /
                        (leftPlayerScore + rightPlayerScore)
                )
            );
        else
            setLeadPercent(
                -Math.cbrt(
                    (leftPlayerScore - rightPlayerScore) /
                        (leftPlayerScore + rightPlayerScore)
                )
            );
    }, [leftPlayerScore, rightPlayerScore]);

    return (
        <div
            className="scoreLeader"
            style={{
                top: playing ? 72 : 52
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
