import { FC, useMemo, useState } from 'react';

import './WinOverlay.css';
import { IconTrophy } from '@tabler/icons-react';
import { Client, EventReceiver, Models, Packets, TAEvents } from '../../TAClient';
import { useClientEvent } from '../../Hooks/useClientEvent';

export type WinOverlayProps = {
    client: Client;
    leftPlayerUUID: string;
    rightPlayerUUID: string;
    playing: boolean;
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

    const [leftPlayerFinished, setLeftPlayerFinished] = useState(false);
    const [rightPlayerFinished, setRightPlayerFinished] = useState(false);

    const [showWinScreen, setShowWinScreen] = useState(false);

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

    const onSongFinished: EventReceiver<
        TAEvents.PacketEvent<Packets.Push.SongFinished>
    > = ({ data }) => {
        if (data.player.guid == leftPlayerUUID) {
            setLeftPlayerScore(data.score);
            setLeftPlayerFinished(true);
        } else if (data.player.guid == rightPlayerUUID) {
            setRightPlayerScore(data.score);
            setRightPlayerFinished(true);
        }
    };

    useClientEvent('songFinished', onSongFinished, client);

    useMemo(() => {
        if (leftPlayerFinished && rightPlayerFinished) {
            setTimeout(() => {
                setShowWinScreen(true);

                setTimeout(() => {
                    setShowWinScreen(false);

                    setLeftPlayerFinished(false);
                    setRightPlayerFinished(false);
                    
                    setLeftPlayerScore(0);
                    setRightPlayerScore(0);
                }, winScreenShowTime);
            }, winScreenDelayTime);
        }
    }, [leftPlayerFinished, rightPlayerFinished]);

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
