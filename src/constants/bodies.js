// Pixel distance from edge of player image to the body (hitbox).
export const BODY_OFFSETS = {
    player: {
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
}

// Pixels before scaling.
export const BODY_SIZES = {
    player: {
        x: 256,
        y: 256
    }
}
