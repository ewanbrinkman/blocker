export const SCENE_KEYS = {
    boot: 'boot',
    credits: 'credits',
    game: 'game',
    options: 'options',
    preloader: 'preloader',
    title: 'title'
}

export const PRELOADER_SCENE = {
    logo: {
        offsetY: -200
    },
    progressBox: {
        width: 320,
        height: 50,
        color: 0x84be1b,
        alpha: 1
    },
    progressBar: {
        width: 300,
        height: 40,
        color: 0x8cd41c,
        alpha: 1
    },
    loadingText: {
        offsetY: -50
    },
    percentText: {
        offsetY: -5
    },
    assetText: {
        offsetY: 50
    }
}

export const BASE_PLAYER = {
    playerType: 'rabbit',
    scale: 0.25,
    acceleration: 1000,
    jumpVelocity: 560,
    wallJumpVelocity: {
        x: 800,
        y: 560
    },
    wallSlideMultiplier: 0.9,
    maxVelocity: {
        x: 1000,
        y: 900
    },
    friction: 4,
    drag: {
        x: 800,
        y: 0
    },
    bounce: 0
}

export const TILES = {
    width: 70,
    height: 70
}

export const PLAYER_SQUARE = {
    size: 256,
    'elephant': {
        left: 70,
        right: 70,
        top: 28,
        bottom: 30   
    },
    'giraffe': {
        left: 49,
        right: 49,
        top: 86,
        bottom: 0   
    },
    'hippo': {
        left: 23,
        right: 24,
        top: 34,
        bottom: 24
    },
    'monkey': {
        left: 54,
        right: 54,
        top: 0,
        bottom: 0
    },
    'panda': {
        left: 54,
        right: 54,
        top: 47,
        bottom: 0
    },
    'parrot': {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    'penguin': {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    'pig': {
        left: 37,
        right: 37,
        top: 21,
        bottom: 0
    },
    'rabbit': {
        left: 0,
        right: 0,
        top: 130,
        bottom: 0
    },
    'snake': {
        left: 0,
        right: 0,
        top: 0,
        bottom: 50
    }
}
