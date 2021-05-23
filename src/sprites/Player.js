import { DEFAULT_PLAYER } from '../constants.js';

function squareCenterOffset(side1, side2, scale) {
    // The argument "side1" is the amount of pixels on one side of the
    // square. The argument "side2" is the amount of pixels on the
    // opposite side of the square.
    return (side1 - side2) / 2 * scale
}

function getSquareCenter(x, y, playerType, scale) {
    // Given an x and y position, move the coordinates so that the
    // center is at the middle of the animal square, not the middle of
    // the image. Since the animals are symmetrical on the right and
    // left side, only the y position needs to change.
    switch (playerType) {
        case 'chicken': {
            return [x, y - squareCenterOffset(17, 0, scale)];
        }
        case 'horse': {
            return [x, y - squareCenterOffset(15, 0, scale)];
        }
        case 'monkey': {
            return [x, y];
        }
        case 'rabbit': {
            return [x, y - squareCenterOffset(48, 0, scale)];
        }
        // case 'rabbit': {
        //     return [x, y - squareCenterOffset(130, 0, scale)];
        // }
    }
}

function getBodyOffset(playerType) {
    switch (playerType) {
        // The x and y distance to get to the top left of the square
        // from the top left of the image.
        case 'chicken': {
            return [0, 17];
        }
        case 'horse': {
            return [0, 15];
        }
        case 'monkey': {
            return [23, 0];
        }
        case 'rabbit': {
            return [0, 48];
        }
        // case 'rabbit': {
        //     return [0, 130];
        // }
    }
}

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        // Adjust position, since when first creating the sprite it is
        // the center of the image. The player should spawn so that the
        // center of its square is the given coordinate.
        let [ squareCenterStartX, squareCenterStartY ] = getSquareCenter(
            config.x, config.y, config.playerType, DEFAULT_PLAYER.scale);

        super(config.scene, squareCenterStartX, squareCenterStartY, 
            config.texture, config.frame);
        
        // Save the scene the player is in.
        this.scene = config.scene;

        // Start position.
        this.startX = config.x
        this.startY = config.y
        
        // Add the player to the scene.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Which animal type the player is.
        this.playerType = config.playerType;
        // Player movement settings.
        this.acceleration = DEFAULT_PLAYER.acceleration;
        this.jumpVelocity = DEFAULT_PLAYER.jumpVelocity;
        this.maxVelocity = DEFAULT_PLAYER.maxVelocity;
        // Friction when moving.
        this.drag = DEFAULT_PLAYER.drag;
        // How much the player should bounce on impacts.
        this.bounce = DEFAULT_PLAYER.bounce;
        
        // Set the player properties.
        this.body.setDrag(this.drag.x, this.drag.y);
        this.body.setMaxVelocity(this.maxVelocity.x, this.maxVelocity.y);
        this.body.setBounce(this.bounce);
        
        // Change the player's hitbox size.
        this.scale = DEFAULT_PLAYER.scale;
        this.body.setSize(128, 128);
        // Adjust the hitbox location to overlap with the square body section of
        // the animal.

        const [ bodyOffsetX, bodyOffsetY ] = getBodyOffset(this.playerType);
        this.body.setOffset(bodyOffsetX, bodyOffsetY);
        // Change the player size.
        this.setScale(this.scale);

        // Don't go out of the map.
        this.body.setCollideWorldBounds(true);
        // Collide with the blocks of the map.
        this.scene.physics.add.collider(this.scene.blockLayer, this);
    }

    update(cursors, time, delta) {
        if (cursors.left.isDown) {
            this.body.setAccelerationX(-this.acceleration);
        } else if (cursors.right.isDown) {
            this.body.setAccelerationX(this.acceleration);
        } else {
            this.body.setAccelerationX(0);
        }

        if ((cursors.space.isDown || cursors.up.isDown) && this.body.onFloor()) {
            this.body.setVelocityY(-this.jumpVelocity);
        } 
    
        if (this.body.y > this.scene.map.heightInPixels) {
            this.respawn();
        }
    }

    teleport(x, y) {
        // Set the body's center to the given x and y position. Since
        // the body is poitioned based on the top left coordinate, half
        // of the body's width and height must be subtracted from the x
        // and y coordinate.
        this.body.x = x - this.body.halfWidth;
        this.body.y = y - this.body.halfHeight;
    }

    respawn() {
        // Teleport back to the spawn point.
        this.teleport(this.startX, this.startY);
        // Reset their velocity so they don't keep their velocity from
        // before they respawn.
        this.body.setVelocity(0, 0);
    }
}
