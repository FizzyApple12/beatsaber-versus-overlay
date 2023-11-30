export type MapDetail = {
    automapper: boolean,
    bookmarked: boolean,
    collaborators: UserDetail[],
    createdAt: string,
    curatedAt: string,
    curator: UserDetail,
    deletedAt: string,
    description: string,
    id: string,
    lastPublishedAt: string,
    metadata: MapDetailMetadata,
    name: string,
    qualified: boolean,
    ranked: boolean,
    stats: MapStats,
    tags: string[],
    updatedAt: string,
    uploaded: string,
    uploader: UserDetail,
    versions: MapVersion[],
};

export type UserDetail = {
    admin: boolean,
    avatar: string,
    curator: boolean,
    curatorTab: boolean,
    description: string,
    email: string,
    followData: UserFollowData,
    hash: string,
    id: number,
    name: string,
    patreon: string,
    playlistUrl: string,
    stats: UserStats,
    suspendedAt: string,
    testplay: boolean,
    type: string,
    uniqueSet: boolean,
    uploadLimit: number,
    verifiedMapper: boolean,
};

export type UserFollowData = {
    curation: boolean,
    followers: number,
    following: boolean,
    follows: number,
    upload: boolean,
};

export type UserStats = {
    avgBpm: number,
    avgDuration: number,
    avgScore: number,
    diffStats: UserDiffStats,
    firstUpload: string,
    lastUpload: string,
    rankedMaps: number,
    totalDownvotes: number,
    totalMaps: number,
    totalUpvotes: number,
};

export type UserDiffStats = {
    easy: number,
    expert: number,
    expertPlus: number,
    hard: number,
    normal: number,
    total: number,
};

export type MapDetailMetadata = {
    bpm: number,
    duration: number,
    levelAuthorName: string,
    songAuthorName: string,
    songName: string,
    songSubName: string,
};

export type MapStats = {
    downloads: number,
    downvotes: number,
    plays: number,
    reviews: number,
    score: number,
    scoreOneDP: number,
    sentiment: string,
    upvotes: number,
};

export type MapVersion = {
    coverURL: string,
    createdAt: string,
    diffs: MapDifficulty[],
    downloadURL: string,
    feedback: string,
    hash: string,
    key: string,
    previewURL: string,
    sageScore: number,
    scheduledAt: string,
    state: string,
    testplayAt: string,
    testplays: MapTestplay[],
};

export type MapDifficulty = {
    bombs: number,
    characteristic: string,
    chroma: boolean,
    cinema: boolean,
    difficulty: string,
    events: number,
    label: string,
    length: number,
    maxScore: number,
    me: boolean,
    ne: boolean,
    njs: number,
    notes: number,
    nps: number,
    obstacles: number,
    offset: number,
    paritySummary: MapParitySummary,
    seconds: number,
    stars: number,
};

export type MapParitySummary = {
    errors: number,
    resets: number,
    warns: number,
};

export type MapTestplay = {
    createdAt: string,
    feedback: string,
    feedbackAt: string,
    user: UserDetail,
    video: string,
};