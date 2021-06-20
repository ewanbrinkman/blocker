import { BODY_OFFSETS } from '../constants/bodies.js';

export function getBodyOffset(sprite, side, scale = true) {
    // Don't apply the sprite's scale if the "scale" argument is false.
    return BODY_OFFSETS[sprite.entity][sprite.type][side] * (scale ? sprite.scale: 1);
}

export function getBodySide(sprite, side) {
    let spriteSize;
    let axis;
    if (side === 'left' || side === 'right') {
        axis = 'x';
        spriteSize = sprite.displayWidth;
    } else if (side === 'top' || side === 'bottom') {
        axis = 'y';
        spriteSize = sprite.displayHeight;
    }
    let position = sprite[axis];

    // The distance from the player image to the body on the given
    // side.
    let offset = getBodyOffset(sprite, side);

    // Subtract instead for these sides.
    if (side === 'right' || side === 'bottom') {
        offset *= -1
    } else if (side === 'left' || side === 'top') {
        spriteSize *= -1;
    }

    position += spriteSize / 2 + offset;

    return position;
}

export function applyBodyOffsetX(sprite, x) {
    return x + (getBodyOffset(sprite, 'right') - getBodyOffset(sprite, 'left')) / 2;
}

export function applyBodyOffsetY(sprite, y) {
    return y + (getBodyOffset(sprite, 'bottom') - getBodyOffset(sprite, 'top')) / 2;
}

export function applyBodyOffset(sprite, position) {
    return {
        x: applyBodyOffsetX(sprite, position.x),
        y: applyBodyOffsetY(sprite, position.y),
    }
}
