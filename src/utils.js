import { BASE_PLAYER, TILES, PLAYER_SQUARE } from './constants.js';

export function squareCenterOffset(side1, side2, scale) {
    // The argument "side1" is the amount of pixels on one side of the
    // square. The argument "side2" is the amount of pixels on the
    // opposite side of the square.
    return (side1 - side2) / 2 * scale
}

export function getSquareCenter(x, y, playerType, scale, placeBottom) {
    // Given an x and y position, move the coordinates so that the
    // center is at the middle of the animal square, not the middle of
    // the image. Since the animals are symmetrical on the right and
    // left side, only the y position needs to change. The argument
    // placeBottom can be used to set an offset to y to place the
    // player on the bottom of the tile.
    let offsetY = 0;
    if (placeBottom) {
        offsetY = (TILES.height - (PLAYER_SQUARE.size * BASE_PLAYER.scale)) / 2;
    }
    return [x - squareCenterOffset(PLAYER_SQUARE[playerType].left, PLAYER_SQUARE[playerType].right, scale),
            y - squareCenterOffset(PLAYER_SQUARE[playerType].top, PLAYER_SQUARE[playerType].bottom, scale) + offsetY];
}

export function getBodyOffset(playerType) {
    // The x and y distance to get to the top left of the square
    // from the top left of the image.
    return [PLAYER_SQUARE[playerType].left,
            PLAYER_SQUARE[playerType].top];
}
