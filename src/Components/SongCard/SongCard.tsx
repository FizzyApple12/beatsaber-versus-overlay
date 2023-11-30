import { FC } from 'react';
import { MapDetail } from '../../Models/BeatSaverModels';

import './SongCard.css'

export type SongCardProps = {
    mapData: MapDetail | undefined;
    show: boolean;
    playing: boolean;
    duration: number;
    selectedDifficulty: number;
};

const difficulties: string[] = ['E', 'N', 'H', 'X', 'X+'];
const colors: string[] = ['#008055', '#1268a1', '#bd5500', '#b52a1c', '#7646af'];

export const SongCard: FC<SongCardProps> = ({
    mapData,
    show,
    playing,
    duration,
    selectedDifficulty,
}) => {
    return (
        <div
            className="songDialog"
            style={{
                bottom: !show ? undefined : '12px'
            }}
        >
            <img className="songCover" src={mapData?.versions[0].coverURL} />
            <div>
                <h1 className="songTitle">{mapData?.metadata.songName}</h1>
                <br />
                <div className="songSecondRow">
                    <h1 className="songAuthor">
                        {mapData?.metadata.songAuthorName}
                    </h1>

                    <span
                        className="songDifficulty"
                        style={{
                            backgroundColor: `${colors[selectedDifficulty]}`
                        }}
                    >
                        {difficulties[selectedDifficulty]}
                    </span>
                </div>

                <div
                    className="songProgressContainer"
                    style={{
                        opacity: playing ? 1 : 0
                    }}
                >
                    <div
                        className="songProgress"
                        style={{
                            animationDuration: `${duration}s`,
                            animationName: playing
                                ? 'songProgressAnimate'
                                : 'none'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
