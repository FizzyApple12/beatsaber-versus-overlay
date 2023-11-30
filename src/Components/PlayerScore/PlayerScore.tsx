import { FC, useMemo, useState } from 'react';
import { Client, EventReceiver, Models, TAEvents } from '../../TAClient';
import { useClientEvent } from '../../Hooks/useClientEvent';

import './PlayerScore.css';

export type PlayerScoreProps = {
    client: Client;
    playerUUID: string;
    leftPlayer: boolean;
    playing: boolean;
};

const postMatchShowTime = 10500;

export const PlayerScore: FC<PlayerScoreProps> = ({
    client,
    playerUUID,
    leftPlayer,
    playing
}) => {
    const [score, setScore] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [combo, setCombo] = useState(0);

    const [showScores, setShowScores] = useState(false);

    const onRealtimeScore: EventReceiver<TAEvents.PacketEvent<Models.RealtimeScore>> = ({
        data
    }) => {
        if (data.user_guid == playerUUID) {
            setScore(data.score);
            setAccuracy(data.accuracy);
            setCombo(data.combo);
        }
        //console.log(`${data.user_guid}: ${data.combo} ${data.accuracy} ${data.combo}`);
    };

    useClientEvent('realtimeScore', onRealtimeScore, client);

    useMemo(() => {
        if (playing) {
            setShowScores(true);
        } else {
            setTimeout(() => {
                setShowScores(false);
            }, postMatchShowTime);
        }
    }, [playing]);

    return (
        <div
            className={`playerScoreBase playerScore${
                leftPlayer ? 'Left' : 'Right'
            }`}
            style={{
                bottom: showScores ? 12 : undefined
            }}
        >
            <h1 className="playerScoreText">
                {combo}x<br />
                {(accuracy * 100).toPrecision(4)}%<br />
                {score}
            </h1>
        </div>
    );
};
