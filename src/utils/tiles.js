export function getTileLeft(sprite, scene, layer, tilePosition) {
    let tileX = sprite.body.left - 1;
    let tileY;

    if (tilePosition === 'top') {
        tileY = sprite.body.top;
    } else if (tilePosition === 'bottom') {
        tileY = sprite.body.bottom;
    } else if (tilePosition === 'middle') {
        tileY = sprite.body.top - sprite.body.halfHeight;
    }

    let tiles = scene.map.getTileAtWorldXY(tileX, sprite.body.top + 1, false, scene.cameras.main, layer);
    
    // If no tile was found, the body could be at an edge and
    // is touching a tile on the other side of its body.
    if (!tile) {
        tile = scene.map.getTileAtWorldXY(tileX, sprite.body.bottom - 1, false, scene.cameras.main, layer);
    }

    return tile;
}