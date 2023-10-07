import { FC, useState } from 'react';
import './App.css';
import { Client } from './ta-client/lib/client';
import { ScoreLeader } from './components/ScoreLeader';
import { PlayerScore } from './components/PlayerScore';
import { WinOverlay } from './components/WinOverlay';
import { useInterval } from 'usehooks-ts';
import { useClientEvent } from './useClientEvent';
import { EventReceiver } from './ta-client/models/EventEmitter';
import { TAEvents } from './ta-client/models/TAEvents';
import { Models } from './ta-client/models/proto/models';
import { useWSEvent } from './useWSEvent';

const difficulties = ['Easy', 'Normal', 'Hard', 'Expert', 'Expert+'];

const client = new Client('Overlayie', {
    url: 'ws://ta.fizzyapple12.com:2053',
    password: 'iLOVEenvision'
});

const nameService = new WebSocket('ws://localhost:3045');

nameService.addEventListener

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

    const [songName, setSongName] = useState('');
    const [difficultyName, setDifficultyName] = useState('');

    const onMatchCreated: EventReceiver<TAEvents.PacketEvent<Models.Match>> = ({
        data
    }) => {
        setMatchUUID(data.guid);

        setLeftPlayerUUID(data.associated_users[0] || '');
        setRightPlayerUUID(data.associated_users[1] || '');

        const newMatchData: Models.Match = data;

        newMatchData.associated_users.push(client.Self.guid);

        client.updateMatch(newMatchData)
    };

    const onMatchDeleted: EventReceiver<
        TAEvents.PacketEvent<Models.Match>
    > = ({ data }) => {
        if (data.guid != matchUUID) return;

        setMatchUUID('');
    };

    useClientEvent('matchCreated', onMatchCreated, client);
    useClientEvent('matchDeleted', onMatchDeleted, client);

    const onPlayerNameData: EventReceiver<MessageEvent<string>> = ({ data }) => {
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

    useWSEvent('message', onPlayerNameData, nameService)

    useInterval(() => {
        //const leftPlayerNameFound = client.getPlayer(leftPlayerUUID)?.name;

        //if (leftPlayerNameFound) setLeftPlayerName(leftPlayerNameFound);

        //const rightPlayerNameFound = client.getPlayer(rightPlayerUUID)?.name;

        //if (rightPlayerNameFound) setRightPlayerName(rightPlayerNameFound);

        setInMatch((matchUUID && true) || false);

        const songNameFound = client.getMatch(matchUUID)?.selected_level?.name;

        if (songNameFound) setSongName(songNameFound);

        const difficultyNameFound =
            difficulties[client.getMatch(matchUUID)?.selected_difficulty || 0];

        if (difficultyNameFound) setDifficultyName(difficultyNameFound);
    }, 1000);

    useInterval(() => {

        const currentMatch = client.getMatch(matchUUID);

        if (!currentMatch) return;
        const isMatchConnected = client.getMatchWebsocketUsers(currentMatch).find((sockUser) => sockUser.guid == client.Self.guid);

        if (!isMatchConnected) {
            currentMatch.associated_users.push(client.Self.guid);
            client.updateMatch(currentMatch);
        }

    }, 10000);

    return (
        <>
            <div className="overlay">
                <h1
                    className="waitText"
                    style={{
                        opacity: !inMatch ? 1 : 0
                    }}
                >
                    Waiting For The Next Match...
                </h1>

                <h1
                    className="player1"
                    style={{
                        top: (!inMatch || !showLeftPlayerName) ? undefined : '0px'
                    }}
                >
                    {leftPlayerName}
                </h1>

                <h1
                    className="player2"
                    style={{
                        top: (!inMatch || !showRightPlayerName) ? undefined : '0px'
                    }}
                >
                    {rightPlayerName}
                </h1>
            </div>

            <ScoreLeader
                client={client}
                leftPlayerUUID={leftPlayerUUID}
                rightPlayerUUID={rightPlayerUUID}
            />

            <div
                className="difficultyDialog"
                style={{
                    opacity: !client.getMatch(matchUUID)?.selected_difficulty
                        ? 0
                        : 1
                }}
            >
                <h1 className="difficultyText">{difficultyName}</h1>
            </div>

            <div
                className="songDialog"
                style={{
                    bottom: !client.getMatch(matchUUID)?.selected_level
                        ? undefined
                        : '-8px'
                }}
            >
                <h1 className="songText">{songName}</h1>
            </div>

            <PlayerScore
                client={client}
                matchUUID={matchUUID}
                playerUUID={leftPlayerUUID}
                leftPlayer={true}
            />
            <PlayerScore
                client={client}
                matchUUID={matchUUID}
                playerUUID={rightPlayerUUID}
                leftPlayer={false}
            />

            <WinOverlay
                client={client}
                leftPlayerUUID={leftPlayerUUID}
                rightPlayerUUID={rightPlayerUUID}
            />
        </>
    );
};

export default App;
