import { FC, useMemo, useState } from 'react';
import { Client } from '../ta-client/lib/client';
import { Models } from '../ta-client/models/proto/models';

import { useInterval } from 'usehooks-ts';

import './WinOverlay.css';
import { IconTrophy } from '@tabler/icons-react';

export type WinOverlayProps = {
    client: Client;
    leftPlayerUUID: string;
    rightPlayerUUID: string;
};

const winScreenShowTime = 8500;
const winScreenDelayTime = 2000;

export const WinOverlay: FC<WinOverlayProps> = ({
    client,
    leftPlayerUUID,
    rightPlayerUUID
}) => {
    const [leftPlayerScore, setLeftPlayerScore] = useState(0);
    const [rightPlayerScore, setRightPlayerScore] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);

    const [showWinScreen, setShowWinScreen] = useState(false);

    useInterval(() => {
        if (
            client.Matches.length == 0 ||
            (client.getPlayer(leftPlayerUUID)?.play_state !=
                Models.User.PlayStates.InGame &&
                client.getPlayer(rightPlayerUUID)?.play_state !=
                    Models.User.PlayStates.InGame)
        ) {
            setIsPlaying(false);
            return;
        }

        setIsPlaying(true);

        const leftPlayerScore =
            client.getMatchPlayers(client.Matches[0]).find((player) => {
                return player.guid == leftPlayerUUID;
            })?.score_details.score || 0;

        const rightPlayerScore =
            client.getMatchPlayers(client.Matches[0]).find((player) => {
                return player.guid == rightPlayerUUID;
            })?.score_details.score || 0;

        setLeftPlayerScore(leftPlayerScore);
        setRightPlayerScore(rightPlayerScore);
    }, 1000);

    useMemo(() => {
        if (!isPlaying) {
            setTimeout(() => {
                setShowWinScreen(true);
    
                setTimeout(() => {
                    setShowWinScreen(false);
    
                    setLeftPlayerScore(0);
                    setRightPlayerScore(0);
                }, winScreenShowTime);
            }, winScreenDelayTime);
        }
    }, [isPlaying]);

    return (
        <>
            <div
                className={`baseWinShutter leftWinShutter ${
                    showWinScreen
                        ? leftPlayerScore > rightPlayerScore
                            ? 'winAnimation0'
                            : leftPlayerScore == rightPlayerScore
                            ? 'tieAnimation0'
                            : 'looseAnimation0'
                        : ''
                }`}
            >
                <IconTrophy
                    className={`baseTrophy leftTrophy ${
                        showWinScreen && leftPlayerScore >= rightPlayerScore
                            ? 'trophyAnimation'
                            : ''
                    }`}
                />
            </div>
            <div
                className={`baseWinShutter rightWinShutter ${
                    showWinScreen
                        ? leftPlayerScore < rightPlayerScore
                            ? 'winAnimation1'
                            : leftPlayerScore == rightPlayerScore
                            ? 'tieAnimation1'
                            : 'looseAnimation1'
                        : ''
                }`}
            >
                <IconTrophy
                    className={`baseTrophy rightTrophy ${
                        showWinScreen && leftPlayerScore <= rightPlayerScore
                            ? 'trophyAnimation'
                            : ''
                    }`}
                />
            </div>
        </>
    );
};
