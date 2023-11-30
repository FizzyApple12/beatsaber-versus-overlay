import { FC, useState } from 'react';
import { Client, EventReceiver, Models, TAEvents } from './TAClient';
import { ScoreLeader } from './Components/ScoreLeader/ScoreLeader';
import { PlayerScore } from './Components/PlayerScore/PlayerScore';
import { WinOverlay } from './Components/WinOverlay/WinOverlay';
import { useInterval } from 'usehooks-ts';
import { useClientEvent } from './Hooks/useClientEvent';
import { useWSEvent } from './Hooks/useWSEvent';
import { MapDetail } from './Models/BeatSaverModels';
import { SongCard } from './Components/SongCard/SongCard';

import './App.css';

const client = new Client('Overlayie', {
    url: 'ws://ta.fizzyapple12.com:2053',
    password: 'iLOVEenvision'
});

const nameService = new WebSocket('ws://localhost:3045');

nameService.addEventListener;

const App: FC = () => {
    // const { client } = useContext(ClientContext);

    const [matchUUID, setMatchUUID] = useState('');
    const [inMatch, setInMatch] = useState(false);

    const [leftPlayerUUID, setLeftPlayerUUID] = useState('');
    const [rightPlayerUUID, setRightPlayerUUID] = useState('');

    const [leftPlayerName, setLeftPlayerName] = useState('');
    const [showLeftPlayerName, setShowLeftPlayerName] = useState(true);

    const [rightPlayerName, setRightPlayerName] = useState('');
    const [showRightPlayerName, setShowRightPlayerName] = useState(true);

    const [songHash, setSongHash] = useState('');
    const [songData, setSongData] = useState<MapDetail>();

    const [selectedDifficulty, setSelectedDifficulty] = useState(0);

    const [showSong, setShowSong] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);

    const [confirmFlip, setConfirmFlip] = useState(false);

    const fetchMap = async (hash: string) => {
        const beatsaverRequest = await fetch(
            `https://beatsaver.com/api/maps/hash/${hash}`
        );
        const mapInfo: MapDetail = await beatsaverRequest.json();

        setSongData(mapInfo);
        setShowSong(true);
    };

    const onMatchCreated: EventReceiver<TAEvents.PacketEvent<Models.Match>> = ({
        data
    }) => {
        setMatchUUID(data.guid);

        setInMatch(true);

        setLeftPlayerUUID(data.associated_users[0] || '');
        setRightPlayerUUID(data.associated_users[1] || '');

        const newMatchData: Models.Match = data;

        newMatchData.associated_users.push(client.Self.guid);

        client.updateMatch(newMatchData);
    };

    const onMatchUpdated: EventReceiver<TAEvents.PacketEvent<Models.Match>> = ({
        data
    }) => {
        if (data.guid != matchUUID) return;

        const isMatchConnected = client
            .getMatchWebsocketUsers(data)
            .find((sockUser) => sockUser.guid == client.Self.guid);

        if (!isMatchConnected) {
            const newMatchData: Models.Match = data;

            newMatchData.associated_users.push(client.Self.guid);

            client.updateMatch(newMatchData);
        }

        const levelId = data.selected_level?.level_id;

        if (levelId) {
            setSelectedDifficulty(data.selected_difficulty ?? -1);

            const hash = levelId.replace('custom_level_', '');

            if (songHash != hash) {
                setShowSong(false);

                setSongHash(hash);
                fetchMap(hash);
            } else {
                setShowSong(true);
            }
        } else {
            setShowSong(false);
        }
    };

    const onMatchDeleted: EventReceiver<TAEvents.PacketEvent<Models.Match>> = ({
        data
    }) => {
        if (data.guid != matchUUID) return;

        setMatchUUID('');

        setInMatch(false);

        setLeftPlayerUUID('');
        setRightPlayerUUID('');
    };

    useClientEvent('matchCreated', onMatchCreated, client);
    useClientEvent('matchUpdated', onMatchUpdated, client);
    useClientEvent('matchDeleted', onMatchDeleted, client);

    const onPlayerNameData: EventReceiver<MessageEvent<string>> = ({
        data
    }) => {
        const [who, newName] = data.split(',');

        if (who == 'l') {
            setShowLeftPlayerName(false);

            setTimeout(() => {
                setLeftPlayerName(newName);

                setShowLeftPlayerName(true);
            }, 275);
        } else {
            setShowRightPlayerName(false);

            setTimeout(() => {
                setRightPlayerName(newName);

                setShowRightPlayerName(true);
            }, 275);
        }
    };

    useWSEvent('message', onPlayerNameData, nameService);

    useInterval(() => {
        if (leftPlayerUUID && rightPlayerUUID) {
            const checkIsPlaying =
                client.getPlayer(leftPlayerUUID)?.play_state ==
                    Models.User.PlayStates.InGame ||
                client.getPlayer(rightPlayerUUID)?.play_state ==
                    Models.User.PlayStates.InGame;

            if (checkIsPlaying != isPlaying)
                setIsPlaying(checkIsPlaying);
        } else {
            setIsPlaying(false);
        }
    }, 100);

    const switchScores = () => {
        if (inMatch) { 
            const oldLeftPlayerUUID = leftPlayerUUID;

            if (confirmFlip == false) {
                setConfirmFlip(true);

                setTimeout(function() {
                    setConfirmFlip(false);
                }, 3000);

                return;
            }

            setLeftPlayerUUID(rightPlayerUUID || '');
            setRightPlayerUUID(oldLeftPlayerUUID || '');
            setConfirmFlip(false);
        }
    }

    return (
        <>
            <div className="overlay" onClick={switchScores}>
                <h1
                    className="waitText"
                    style={{
                        opacity: !inMatch || confirmFlip ? 1 : 0
                    }}
                >
                    {
                        confirmFlip ?
                            "Click again to confirm swapping players..."
                            :
                            "Waiting For The Next Match..."
                    }
                </h1>

                <h1
                    className="player1"
                    style={{
                        top: !inMatch || !showLeftPlayerName ? undefined : '0px'
                    }}
                >
                    {leftPlayerName}
                </h1>

                <h1
                    className="player2"
                    style={{
                        top:
                            !inMatch || !showRightPlayerName ? undefined : '0px'
                    }}
                >
                    {rightPlayerName}
                </h1>
            </div>

            <SongCard
                mapData={songData}
                show={inMatch && showSong}
                playing={isPlaying}
                duration={songData?.metadata.duration ?? 0}
                selectedDifficulty={selectedDifficulty}
            />

            <ScoreLeader
                client={client}
                leftPlayerUUID={leftPlayerUUID}
                rightPlayerUUID={rightPlayerUUID}
                playing={isPlaying}
            />

            <PlayerScore
                client={client}
                playerUUID={leftPlayerUUID}
                leftPlayer={true}
                playing={isPlaying}
            />
            <PlayerScore
                client={client}
                playerUUID={rightPlayerUUID}
                leftPlayer={false}
                playing={isPlaying}
            />

            <WinOverlay
                client={client}
                leftPlayerUUID={leftPlayerUUID}
                rightPlayerUUID={rightPlayerUUID}
                playing={isPlaying}
            />
        </>
    );
};

export default App;
