import FrictionParticles from '../particles/FrictionParticles.js';
import { getTileSide } from '../utils/tiles.js';
import { getBodyOffset, getBodySide, applyBodyOffsetX, applyBodyOffset} from '../utils/body.js';
import { BASE_PLAYER, PLAYER_SQUARE } from '../constants/player.js';
import { TILES } from '../constants/maps.js';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(config) {
        // Adjust position, since when first creating the sprite it is
        // the center of the image. The player should spawn so that the
        // center of its body is the given coordinate.
        // Since "this" can't be used yet, pass in an object (instead
        // of "this" for the sprite) with everything needed.
        let position = applyBodyOffset({
            scale: config.scale,
            entity: 'player',
            type: config.playerType
        }, config.position);

        super(config.scene, position.x, position.y, 
            config.texture, config.frame);
        
        // Save the scene the player is in.
        this.scene = config.scene;

        // Start position.
        this.spawnPoint = config.position;
        
        // Add the player to the scene.
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.entity = 'player';
        // Which animal type the player is.
        this.type = config.playerType;

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
        this.scale = config.scale;
        this.body.setSize(PLAYER_SQUARE.size, PLAYER_SQUARE.size);
        // Adjust the hitbox location to overlap with the square body section of
        // the animal. Don't apply the sprite's scale when doing so.
        this.body.setOffset(getBodyOffset(this, 'left', false), getBodyOffset(this, 'top', false));
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

        // Render on top. Friction particles have a higher depth than
        // the player, so friction particles render on top of the
        // player, while the player renders on top of the map.
        this.setDepth(1);
    }

    update(input) {
        // Update the friction particles used by the player. The
        // particle explosion from wall jumping is done in the wall
        // jumping function.
        this.updateFrictionParticles();

        // Friction increases as the player's velocity increases.
        // Multiply the velocity be a negative number to make friction
        // go in the opposite direction of movement.
        if (input.left.isDown) {
            // Move left.
            this.body.setAccelerationX(-this.acceleration + this.body.velocity.x * -this.friction);
        } else if (input.right.isDown) {
            // Move right.
            this.body.setAccelerationX(this.acceleration + this.body.velocity.x * -this.friction);
        } else {
            // Stop accelerating if no left or right key is being held
            // down.
            this.body.setAccelerationX(0);
        }

        if (input.up.isDown && this.body.onFloor()) {
            // Jump off the ground.
            this.scene.registry.sounds.jump.play();
            this.body.setVelocityY(-this.jumpVelocity);
        }

        if (input.up.justDown) {
            // The player will try to do a wall jump.
            this.wallJump();
        }
        
        // Don't pass through the left and right edge of the map, and
        // respawn if below the bottom of the map.
        this.collideWorldSides();

        this.lastVelocity = {
            y: this.body.velocity.y
        }

        // For testing.
        if (input.test.justDown) {
            // Change the player size.
            if (this.scale === BASE_PLAYER.scale) {
                this.scale = 0.1;
            } else {
                this.scale = BASE_PLAYER.scale;
            }
            // this.scene.cameras.main.zoom = 1 + (BASE_PLAYER.scale - this.scale) * 3;
            this.setScale(this.scale);
        }

        if (input.respawn.justDown) {
            // Respawn the player back at its set respawn point.
            this.respawn();
        }
    }

    updateFrictionParticles() {
        // Friction particles when moving.
        if (this.body.onFloor() && (Math.abs(this.body.velocity.x) > this.baseMaxVelocity.x * this.frictionParticles.minVelocityFloor)) {
            // Make sure the image is correct every update.
            this.frictionParticles.updateParticleImage('floor');
            if (!this.frictionParticles.floor.on) {
                this.frictionParticles.startParticles('floor');
            }
        } else {
            this.frictionParticles.floor.on = false;
        }

        // If the player hits the floor moving fast enough, some impact
        // particles appear and bounce along the floor.
        if (this.body.onFloor() && (this.lastVelocity.y > 500)) {
            this.frictionParticles.explodeFloorHitParticles();

            // Play an impact sound if the impact velocity is large
            // enough.
            if (this.lastVelocity.y > 640) {
                this.scene.registry.sounds.hit.play();
            }
        }

        // If the player is moving into a wall (moving left or right)
        // and moving down, make them slide slower down the wall.
        if (this.body.onWall() && this.body.velocity.y > 0) {
            this.wallSlide();
        } else {
            this.frictionParticles.wall.on = false;
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
        // Get information on any tile beside the player.
        let tileData = getTileSide(this, this.scene, this.scene.collidersLayer, {group: this.scene.walls, indexes: this.scene.customCollisionTilesIndexes});

        // The player must be on a wall without touching the ground.
        if (!this.body.onFloor() && tileData.tile) {
            this.scene.registry.sounds.jump.play();
            // Wall jump, set the x velocity in the correct direction.
            if (tileData.side === 'right') {
                this.body.setVelocityX(-this.wallJumpVelocity.x);
                this.frictionParticles.explodeWallJumpParticles(tileData.tile, tileData.side);
            } else if (tileData.side === 'left') {
                this.body.setVelocityX(this.wallJumpVelocity.x);
                this.frictionParticles.explodeWallJumpParticles(tileData.tile, tileData.side);
            }
            this.body.setVelocityY(-this.wallJumpVelocity.y);
        }
    }

    doorExit() {
        // When the player touches an exit door, switch to the next level.
        this.scene.nextLevel();
    }

    addCollisions() {
        // Collide with the blocks of the map.
        this.scene.colliders['collidersLayer'] = this.scene.physics.add.collider(this.scene.collidersLayer, this);
        // Collide with the custom sized collision boxes of the map.
        this.scene.colliders['walls'] = this.scene.physics.add.collider(this.scene.walls, this);
        // Collide with the exit doors.
        this.scene.overlaps['exitDoors'] = this.scene.physics.add.overlap(this.scene.exitDoors, this, this.doorExit, undefined, this);
    }

    collideWorldSides() {
        // Use the sprite position in the if statements. Using the body
        // won't work when a level switches and the map gets smaller.
        // Add or subtract 3 from the player position in the if
        // statements, so that the player isn't right agaisnt an edge.
        if (getBodySide(this, 'right') < 0) {
            this.setX(applyBodyOffsetX(this, this.scene.map.widthInPixels + this.body.width / 2 - 3));
            // let tile = this.scene.map.getTileAtWorldXY(newX, this.body.y);
            // console.log(tile);
        } else if (getBodySide(this, 'left') > this.scene.map.widthInPixels) {
            this.setX(applyBodyOffsetX(this, -this.body.width / 2 + 3));
        }
        // Respawn if the player fell out of the map.
        if (getBodySide(this, 'top') > this.scene.map.heightInPixels) {
            this.respawn();
        }
    }

    respawn(death = true) {
        // Don't play the death sound if the player is just teleporting
        // to the door at the start of a new level.
        if (death) {
            this.scene.registry.sounds.lose.play();
        }

        let position = applyBodyOffset(this, this.spawnPoint);

        // Subtract movement change to counter gravity pushing the
        // player into the wall below, as well as making sure the
        // player simply lines up nicely in the middle of the spawn
        // point.
        // Teleport back to the spawn point.
        this.setPosition(
            position.x - this.body.deltaX(),
            position.y - this.body.deltaY() - TILES.height / 2);

        // Reset their velocity so they don't keep their velocity from
        // before they respawn.
        this.body.setVelocity(0, 0);
        // Reset the last velocity that is used by the friction
        // particles.
        this.lastVelocity = {
            y: 0
        }
    }
}
