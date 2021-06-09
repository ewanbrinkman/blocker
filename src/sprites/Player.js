import FrictionParticles from '../particles/FrictionParticles.js';
import { getSquareCenter, getBodyOffset } from '../utils.js';
import { BASE_PLAYER, PLAYER_SQUARE } from '../constants/player.js';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        // Adjust position, since when first creating the sprite it is
        // the center of the image. The player should spawn so that the
        // center of its square is the given coordinate.
        let [ squareCenterStartX, squareCenterStartY ] = getSquareCenter(
            config.x, config.y, config.playerType, BASE_PLAYER.scale, true);

        super(config.scene, squareCenterStartX, squareCenterStartY, 
            config.texture, config.frame);
        
        // Save the scene the player is in.
        this.scene = config.scene;

        // Start position.
        this.startX = squareCenterStartX;
        this.startY = squareCenterStartY;
        
        // Add the player to the scene.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Which animal type the player is.
        this.playerType = config.playerType;
        // Player movement settings.
        this.acceleration = BASE_PLAYER.acceleration;
        this.jumpVelocity = BASE_PLAYER.jumpVelocity;
        this.maxVelocity = BASE_PLAYER.maxVelocity;
        this.wallJumpVelocity = BASE_PLAYER.wallJumpVelocity;
        this.wallSlideMultiplier = BASE_PLAYER.wallSlideMultiplier;

        this.friction = BASE_PLAYER.friction;
        // Friction when stopping.
        this.drag = BASE_PLAYER.drag;
        // How much the player should bounce on impacts.
        this.bounce = BASE_PLAYER.bounce;
        // The maximum player velocity when moving normally. It is the
        // acceleration divded by the friction constant. For example,
        // if the maximum acceleration is 1000 and the friction
        // constant is 2, then the maximum velocity is 1000 / 2 which
        // is 500.
        this.baseMaxVelocity = {
            x: this.acceleration / this.friction
        }
        
        // How fast the player will slow down.
        this.body.setDrag(this.drag.x, this.drag.y);
        // Make sure the player doesn't go too fast, or else they could
        // clip through blocks.
        this.body.setMaxVelocity(this.maxVelocity.x, this.maxVelocity.y);
        // How much the player will bounce on collisions.
        this.body.setBounce(this.bounce);
        
        // Change the player's hitbox size.
        this.scale = BASE_PLAYER.scale;
        this.body.setSize(PLAYER_SQUARE.size, PLAYER_SQUARE.size);
        // Adjust the hitbox location to overlap with the square body section of
        // the animal.
        const [ bodyOffsetX, bodyOffsetY ] = getBodyOffset(this.playerType);
        this.body.setOffset(bodyOffsetX, bodyOffsetY);
        // Change the player size.
        this.setScale(this.scale);

        // Don't go out of the map.
        this.body.setCollideWorldBounds(true);

        // Add the colliders and overlaps for the player.
        this.addCollisions();

        // Particles when the player moves around.
        this.frictionParticles = new FrictionParticles(this.scene, this);
        
        // Keep track of the player's velocity during the last update.
        // That way, when the player hits the floor, it can be known
        // how hard they hit using their velocity from the previous
        // frame.
        this.lastVelocity = {
            y: 0
        }

        // Render on top.
        this.setDepth(1);
    }

    getBodyCenter(x, y) {
        let [ squareCenterStartX, squareCenterStartY ] = getSquareCenter(
            x, y, this.playerType, this.scale, true);

        return [ squareCenterStartX, squareCenterStartY ];
    }

    doorExit() {
        this.scene.nextLevel();
    }

    addCollisions() {
        // Collide with the blocks of the map.
        this.scene.colliders['collidersLayer'] = this.scene.physics.add.collider(this.scene.collidersLayer, this);
        // Collide with the custom sized collision boxes of the map.
        this.scene.colliders['walls'] = this.scene.physics.add.collider(this.scene.walls, this);

        // Collide with the bottom of exit doors. The index is one more
        // than that shown in Tiled.
        this.scene.doorsExitLayer.setTileIndexCallback(58, this.doorExit, this);
        this.scene.overlaps['doorsExitLayer'] = this.scene.physics.add.overlap(this.scene.doorsExitLayer, this);
        // Collide with the top of exit doors. The top has a smaller
        // hitbox to match the image.
        this.scene.overlaps['exitDoorTops'] = this.scene.physics.add.overlap(this.scene.exitDoorTops, this, this.doorExit, undefined, this);
    }

    update(cursors, time, delta) {
        // Friction particles when moving.
        if (this.body.onFloor() && (Math.abs(this.body.velocity.x) > this.baseMaxVelocity.x * this.frictionParticles.minVelocityFloor)) {
            this.movingFast();
        } else {
            this.frictionParticles.floor.on = false;
        }

        // If the player hits the floor moving fast enough, some impact
        // particles appear and bounce along the floor.
        if (this.body.onFloor() && (this.lastVelocity.y > 500)) {
            this.frictionParticles.explodeFloorHitParticles();
        }

        // If the player is moving into a wall (moving left or right)
        // and moving down, make them slide slower down the wall.
        if (this.body.onWall() && this.body.velocity.y > 0) {
            this.wallSlide();
        } else {
            this.frictionParticles.wall.on = false;
        }

        // Friction increases as the player's velocity increases.
        // Multiply the velocity be a negative number to make friction
        // go in the opposite direction of movement.
        if (cursors.left.isDown) {
            this.body.setAccelerationX(-this.acceleration + this.body.velocity.x * -this.friction);
        } else if (cursors.right.isDown) {
            this.body.setAccelerationX(this.acceleration + this.body.velocity.x * -this.friction);
        } else {
            this.body.setAccelerationX(0);
        }

        if (cursors.space.isDown || cursors.up.isDown) {
            if (this.body.onFloor()) {
                // Jump off the ground.
                this.body.setVelocityY(-this.jumpVelocity);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(cursors.space)) {
            // The player will try to do a wall jump.
            this.wallJump();
        }
        
        // Don't pass through the left and right edge of the map, and
        // respawn if below the bottom of the map.
        this.collideWorldSides();

        this.lastVelocity = {
            y: this.body.velocity.y
        }
    }

    movingFast() {
        // Make sure the image is correct.
        this.frictionParticles.updateParticleImage('floor');
        // Start the friction particles on the floor.
        if (!this.frictionParticles.floor.on) {
            this.frictionParticles.startParticles('floor');
        }
    }

    wallSlide() {
        // Lower the player's y velocity when sliding down along the wall.
        this.body.velocity.y *= this.wallSlideMultiplier;

        // Make sure the image is correct.
        this.frictionParticles.updateParticleImage('wall');
        // Start the friction particles on the wall.
        if (!this.frictionParticles.wall.on) {
            this.frictionParticles.startParticles('wall');
        }
    }

    wallJump() {
        // The player must be on a wall without touching the ground.
        if (!this.body.onFloor() && this.body.onWall()) {
             // Wall jump, set the x velocity in the correct direction.
             if (this.body.blocked.right) {
                this.body.setVelocityX(-this.wallJumpVelocity.x);
                this.frictionParticles.explodeWallJumpParticles('right');
            } else if (this.body.blocked.left) {
                this.body.setVelocityX(this.wallJumpVelocity.x);
                this.frictionParticles.explodeWallJumpParticles('left');
            }

            this.body.setVelocityY(-this.wallJumpVelocity.y);
        }
    }

    teleport(x, y) {
        this.setPosition(x, y);
    }

    respawn() {
        // To counter gravity pushing the player into the wall.
        let gravityYOffset = 0;
        if (this.body.deltaY() > 0) {
            gravityYOffset = this.body.deltaY();
        }
        // Teleport back to the spawn point.
        this.teleport(this.startX, this.startY - gravityYOffset)
        // Reset their velocity so they don't keep their velocity from
        // before they respawn.
        this.body.setVelocity(0, 0);
    }

    collideWorldSides() {
        // Don't go off the left or right side of the screen. This
        // method is better than doing physics.world.setBoundsCollision
        // since it doesn't count running into the left or right edge
        // as being blocked.
        if (this.body.position.x < 0) {
            this.body.position.x = 0;
            this.body.setVelocityX(0);
        } else if (this.body.position.x + this.body.width > this.scene.map.widthInPixels) {
            this.body.position.x = this.scene.map.widthInPixels - this.body.width;
            this.body.setVelocityX(0);
        }

        // Respawn if the player fell out of the map.
        if (this.body.position.y > this.scene.map.heightInPixels) {
            this.respawn();
        }
    }
}
