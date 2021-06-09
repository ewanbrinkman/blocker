export const SCENE_KEYS = {
    boot: 'boot',
    credits: 'credits',
    game: 'game',
    hud: 'hud',
    options: 'options',
    preloader: 'preloader',
    title: 'title',
    gameover: 'gameover'
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
    },
    titleText: {
        offset: {
            y: 50
        }
    },
    playerButton: {
        offsetStart: {
            y: 175
        },
        offsetBetween: {
            y: 140
        }
    },
    gamemodeButton: {
        offset: {
            x: 70,
            y: -280
        }
    },
    gamemodeText: {
        offset: {
            x: 0
        }
    }
}

export const HUD_SCENE = {
    timeLeftText: {
        offset: {
            x: 20,
            y: 20
        }
    },
    timeElapsedText: {
        offset: {
            x: 20,
            y: 60
        }
    }
}

export const GAME_OVER_SCENE = {
    backButton: {
        offset: {
            y: -100
        }
    },
    resultsTextSpacing: 50
}