function getTile(sprite, scene, layer, sideX, sideY, offset = {x: 0, y: 0}) {
    // The position to look for a tile at.
    let tileX = sprite.body[sideX] + offset.x;
    let tileY = sprite.body[sideY] + offset.y;

    // Look for a tile at the given position.
    let tile = scene.map.getTileAtWorldXY(tileX, tileY, false, scene.cameras.main, layer);
    
    return tile;
}

function besideCustomTile(sprite, scene, group, tile, offset = {left: 0, top: 0, right: 0, bottom: 0}) {
    // Get the bounds of the player's hitbox.
    let bodyBounds = {}
    bodyBounds = sprite.body.getBounds(bodyBounds);

    // OverlapRect will test if the rectangle overlaps with any
    // bodies. The bodies must not be in a static group.
    let bodyOverlaps = scene.physics.overlapRect(
        bodyBounds.x + offset.left,
        bodyBounds.y + offset.top,
        bodyBounds.right - bodyBounds.x + offset.right, // The width.
        bodyBounds.bottom - bodyBounds.y + offset.bottom // The height.
    );

    // Check to see if there is actually an overlapping body from
    // the target group.
    let besideCustomTile = false;
    bodyOverlaps.forEach(body => {
        if (group.children.entries.includes(body.gameObject)) {
            // The body must be part of the tile given. This makes sure
            // the sprite has collided with a body on the given tile,
            // and not some nearby tile.
            let bodyTile = scene.map.worldToTileXY(body.position.x, body.position.y);
            if (bodyTile.x === tile.x && bodyTile.y === tile.y) {
                besideCustomTile = true;
            }
        }
    });
    
    return besideCustomTile;
}

export function getTileSide(sprite, scene, layer, custom = null, offsetY = true) {
    // The four corners to test for a tile.
    // No y offset is used for the friction particles to make sure the
    // image is correct.
    let corners = [
        {sideX: 'left', sideY: 'top', offset: {x: -1, y: offsetY ? 1: 0}},
        {sideX: 'left', sideY: 'bottom', offset: {x: -1, y: offsetY ? -1: 0}},
        {sideX: 'right', sideY: 'top', offset: {x: 1, y: offsetY ? 1 : 0}},
        {sideX: 'right', sideY: 'bottom', offset: {x: 1, y: offsetY ? -1 : 0}},
    ]

    // Search for a tile. If one is found, stop searching.
    let tile;
    // Save which corner the tile was found at.
    let corner;
    for (corner in corners) {
        tile = getTile(sprite, scene, layer, corners[corner].sideX,
            corners[corner].sideY, corners[corner].offset);
        if (tile) {
            if (!custom || !custom.indexes.includes(parseInt(tile.index))) {
                // Don't test for custom collisions or the tile doesn't
                // have custom collisions.
                break;
            } else if (besideCustomTile(sprite, scene, custom.group, tile, {left: 0, top: 1, right: 0, bottom: -1})) {
                // If actually touching the custom collision box tile or not. Add
                // and subtract one from the y position for besideCustomTile so
                // being underneath a tile doesn't count. This function gets side
                // tiles.
                break;
            } else {
                // Not beside/touching the tile.
                tile = null;
            }
        }
    }

    return {
        tile: tile,
        side: tile ? corners[corner].sideX : null
    }
}

export function getTileBottom(sprite, scene, layer) {
    // The two corners to test for a tile.
    let corners = [
        {sideX: 'left', sideY: 'bottom', offset: {x: 0, y: 1}},
        {sideX: 'right', sideY: 'bottom', offset: {x: 0, y: 1}}
    ]

    // Search for a tile. If one is found, stop searching.
    let tile;
    // Save which corner the tile was found at.
    let corner;
    for (corner in corners) {
        tile = getTile(sprite, scene, layer, corners[corner].sideX,
            corners[corner].sideY, corners[corner].offset);
        if (tile) {
            break;
        }
    }
    
    return {
        tile: tile,
        side: tile ? corners[corner].sideX : null
    }
}
