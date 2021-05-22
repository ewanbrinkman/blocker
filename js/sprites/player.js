function getSquareCenter(x, y, playerType, playerScale) {
    // Given an x and y position, move the coordinates so that the
    // center is at the middle of the animal square, not the middle of
    // the image.
    switch (playerType) {
        case 'hippo': {
            return [x, y - (34 - 24) / 2 * playerScale]; // 34 px top, 24 px bottom.
        }
        case 'monkey': {
            return [x, y]; // The center of the image is also the centre of the square.
        }
        case 'rabbit': {
            return [x, y - 130 / 2 * playerScale]; // 130 px top.
        }
        case 'pig': {
            return [x, y - 21 / 2 * playerScale]; // 21 px top.
        }
    }
}

function getBodyOffset(playerType) {
    switch (playerType) {
        case 'hippo': {
            return [23, 34];
        }
        case 'monkey': {
            return [54, 0];
        }
        case 'rabbit': {
            return [0, 130];
        }
        case 'pig': {
            return [37, 21];
        }
    }
}

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        // Adjust position, since when first creating the sprite it is
        // the center of the image.
        let [ squareCenterStartX, squareCenterStartY ] = getSquareCenter(
            config.x, config.y, config.playerType, config.playerScale);

        super(config.scene, squareCenterStartX, squareCenterStartY, 
            config.texture, config.frame);
        
        // Save the scene the player is in.
        this.scene = config.scene;

        // Start position.
        this.startX = config.x
        this.startY = config.y

        console.log('start_pos', config.x, config.y)
        
        // Add the player to the scene.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Player properties.
        this.playerType = config.playerType;
        this.playerScale = config.playerScale;
        // How fast the player moves.
        this.playerAcc = 1000;
        this.playerJumpVel = 560;
        // Set max velocity.
        this.playerMaxVelX = 250;
        this.playerMaxVelY = 750;
        // Friction when moving.
        this.playerDragX = 1500;
        this.playerDragY = 10;
        // How much the player should bounce on impacts.
        this.playerBounce = 0;
        
        // Set the player properties.
        this.body.setDrag(this.playerDragX, this.playerDragY);
        this.body.setMaxVelocity(this.playerMaxVelX, this.playerMaxVelY);
        this.body.setBounce(this.playerBounce);
        
        // Change the player's hitbox (body) size.
        this.body.setSize(256, 256)
        // Adjust the hitbox location to overlap with the square body section of
        // the animal.
        const [ bodyOffsetX, bodyOffsetY ] = getBodyOffset(this.playerType);
        this.body.setOffset(bodyOffsetX, bodyOffsetY);
        // Change the player size.
        this.setScale(this.playerScale);

        // Don't go out of the map.
        this.body.setCollideWorldBounds(true);
        // Collide with the blocks of the map.
        this.scene.physics.add.collider(this.scene.blockLayer, this);

        console.log(this.body.center);
    }

    update(cursors, time, delta) {
        if (cursors.left.isDown) {
            this.body.setAccelerationX(-this.playerAcc);
        } else if (cursors.right.isDown) {
            this.body.setAccelerationX(this.playerAcc);
        } else {
            this.body.setAccelerationX(0);
        }

        if ((cursors.space.isDown || cursors.up.isDown) && this.body.onFloor()) {
            this.body.setVelocityY(-this.playerJumpVel);
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
