export const SCENE_KEYS = {
    boot: 'boot',
    credits: 'credits',
    game: 'game',
    options: 'options',
    preloader: 'preloader',
    title: 'title'
}

export const FONT = {
    main: 'Pixel',
    Pixel: {
        offset: {
            y: -5 // To make the text look like it is truly centered.
        }
    }
}

export const COLORS = {
    background: '#a1e1ff',
    text: '#bc8142'
}

export const TILES = {
    width: 70,
    height: 70
}

export const MAPS = {
    titleAmount: 3,
    levelAmount: 1
}

export const PRELOADER_SCENE = {
    logo: {
        offset: {
            y: 100
        }
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
        offset: {
            y: -50
        }
    },
    assetText: {
        offset: {
            y: 50
        }
    }
}

export const TITLE_SCENE = {
    logo: {
        offset: {
            y: 100
        }
    },
    quitButton: {
        offset: {
            y: -100
        }
    },
    optionsButton: {
        offset: {
            x: -350
        }
    },
    creditsButton: {
        offset: {
            x: 350
        }
    },
    splashText: {
        offset: {
            x: 10,
            y: 10
        }
    },
    backgroundSpeed: 50
}

export const CREDITS_TEXT_SIZES = {
    title: '100px',
    header: '64px',
    body: '48px'
}

export const CREDITS_SCENE = {
    textSpeed: 150,
    startDelay: 750,
    spacingBefore: {
        header: 100,
        body: 5
    }
}

export const OPTIONS_SCENE = {
    backButton: {
        offset: {
            y: -100
        }
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

export const PLAYER_TYPES = [
    'elephant',
    'giraffe',
    'hippo',
    'monkey',
    'panda',
    'parrot',
    'penguin',
    'pig',
    'rabbit',
    'snake'
]

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
