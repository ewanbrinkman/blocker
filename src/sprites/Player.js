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
        this.spawnPoint = {
            x: squareCenterStartX,
            y: squareCenterStartY
        }
        
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

        // Render on top. Friction particles have a higher depth than
        // the player, so friction particles render on top of the
        // player, while the player renders on top of the map.
        this.setDepth(1);
    }

    update(keys, time, delta) {
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
        if (keys.cursors.left.isDown) {
            this.body.setAccelerationX(-this.acceleration + this.body.velocity.x * -this.friction);
        } else if (keys.cursors.right.isDown) {
            this.body.setAccelerationX(this.acceleration + this.body.velocity.x * -this.friction);
        } else {
            this.body.setAccelerationX(0);
        }

        if (keys.cursors.space.isDown || keys.cursors.up.isDown) {
            if (this.body.onFloor()) {
                // Jump off the ground.
                this.scene.registry.sounds.jump.play();
                this.body.setVelocityY(-this.jumpVelocity);
            }
        }

        if (Phaser.Input.Keyboard.JustDown(keys.cursors.up) || Phaser.Input.Keyboard.JustDown(keys.cursors.space)) {
            // The player will try to do a wall jump.
            this.wallJump();
        }
        
        // Don't pass through the left and right edge of the map, and
        // respawn if below the bottom of the map.
        this.collideWorldSides();

        this.lastVelocity = {
            y: this.body.velocity.y
        }

        if (Phaser.Input.Keyboard.JustDown(keys.r)) {
            this.respawn();
        }
    }

    besideCustomWall() {
        // Get the bounds of the player's hitbox.
        let bodyBounds = {}
        bodyBounds = this.body.getBounds(bodyBounds);

        // OverlapRect will test if the rectangle overlaps with any
        // bodies. This is why the scene's walls group is not a static
        // group.
        let bodyOverlaps = this.scene.physics.overlapRect(
            bodyBounds.x,
            bodyBounds.y,
            bodyBounds.right - bodyBounds.x,
            bodyBounds.bottom - bodyBounds.y
        );

        let besideCustomWall = false;
        // Check to see if there is actually an overlapping body from
        // the walls group.
        bodyOverlaps.forEach(body => {
            if (this.scene.walls.children.entries.includes(body.gameObject)) {
                besideCustomWall = true;
            }
        });
        
        return besideCustomWall;
    }

    besideTile() {
        // A normal tile here means a tile without any custom collision
        // box.
        let tile = this.scene.map.getTileAtWorldXY(this.body.left - 1, this.body.top, false, this.scene.cameras.main, this.scene.collidersLayer);
        
        // If no tile was found, the body could be at an edge and
        // is touching a tile on the other side of its body.
        if (!tile) {
            tile = this.scene.map.getTileAtWorldXY(this.body.left - 1, this.body.bottom - 1, false, this.scene.cameras.main, this.scene.collidersLayer);
        }

        let side ;
        // If a tile was found at this point, is is on the left.
        if (tile) {
            side = 'left';
        }

        // If not tile has been found yet, test the right side now.
        if (!tile) {
            tile = this.scene.map.getTileAtWorldXY(this.body.right + 1, this.body.top, false, this.scene.cameras.main, this.scene.collidersLayer);
        }

        if (!tile) {
            tile = this.scene.map.getTileAtWorldXY(this.body.right + 1, this.body.bottom - 1, false, this.scene.cameras.main, this.scene.collidersLayer);
        }

        // If a tile was found at this point, it is on the right. Only
        // change the side variable if it hasn't been set to left
        // already.
        if (side !== 'left' && tile) {
            side = 'right';
        }

        // If a tile was found, check if it has custom collisions.
        let custom;
        if (tile) {
            custom = this.scene.customCollisionTilesIndexes.includes(parseInt(tile.index));
        }

        // Test if the player is allowed to do a wall jump. If the tile
        // has custom collisions, the player may or may not be able to.
        let wallJumpAllowed;
        if (tile && !custom || custom && this.besideCustomWall()) {
            wallJumpAllowed = true;
        } else {
            wallJumpAllowed = false;
        }

        return {
            tile: tile,
            side: side,
            custom: custom,
            wallJumpAllowed: wallJumpAllowed
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
        // Get information on any tile beside the player.
        let data = this.besideTile();

        // The player must be on a wall without touching the ground.
        if (!this.body.onFloor() && data.wallJumpAllowed) {
            this.scene.registry.sounds.jump.play();
            // Wall jump, set the x velocity in the correct direction.
            if (data.side === 'right') {
                this.body.setVelocityX(-this.wallJumpVelocity.x);
                this.frictionParticles.explodeWallJumpParticles(data.side, data.tile);
            } else if (data.side === 'left') {
                this.body.setVelocityX(this.wallJumpVelocity.x);
                this.frictionParticles.explodeWallJumpParticles(data.side, data.tile);
            }
            this.body.setVelocityY(-this.wallJumpVelocity.y);
        }
    }

    getPlayerCenter(x, y, onBottom = true) {
        return getSquareCenter(x, y, this.playerType, this.scale, onBottom);
    }

    getSpritePosition(side) {
        if (side === 'left') {
            let [x, y] = getSquareCenter(this.getTopLeft().x, 0, this.playerType, this.scale, false);
            return x;
        } else if (side === 'right') {
            let [x, y] = getSquareCenter(this.getTopRight().x, 0, this.playerType, this.scale, false);
            return x;
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

    respawn(sound = true) {
        if (sound) {
            this.scene.registry.sounds.lose.play();
        }

        // Subtract movement change to counter gravity pushing the
        // player into the wall below, as well as making sure the
        // player simply lines up nicely in the middle of the spawn
        // point.
        // Teleport back to the spawn point.
        this.setPosition(
            this.spawnPoint.x - this.body.deltaX(),
            this.spawnPoint.y - this.body.deltaY());

        // Reset their velocity so they don't keep their velocity from
        // before they respawn.
        this.body.setVelocity(0, 0);
        // Reset the last velocity that is used by the friction
        // particles.
        this.lastVelocity = {
            y: 0
        }
    }

    collideWorldSides() {
        // Use the sprite position in the if statements. Using the body
        // won't work when a level switches and the map gets smaller.
        // Add or subtract 3 from the player position in the if
        // statements, so that the player isn't right agaisnt an edge.
        if (this.getSpritePosition('right') < 0) {
            let [ newX, newY ] = this.getPlayerCenter(this.scene.map.widthInPixels, 0);
            // let tile = this.scene.map.getTileAtWorldXY(newX, this.body.y);
            // console.log(tile);
            this.setX(newX + this.body.width / 2 - 3);
        } else if (this.getSpritePosition('left') > this.scene.map.widthInPixels) {
            let [ newX, newY ] = this.getPlayerCenter(0, 0);
            this.setX(newX - this.body.width / 2 + 3);  
        }
        // Respawn if the player fell out of the map.
        if (this.body.position.y > this.scene.map.heightInPixels) {
            this.respawn();
        }
    }
}
