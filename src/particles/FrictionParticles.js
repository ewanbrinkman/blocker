import { PLAYER_SQUARE } from '../constants.js';

export class FrictionParticles {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Minimum player velocity relative to the maximum while moving
        // along the floor, in order to start friction particles.
        this.minVelocityFloor = 0.8

        // When moving fast along the floor.
        this.floor = this.scene.frictionParticles.createEmitter({
            on: false,
            follow: this.player, // Follow the player.
            speed: 100,
            scale: { start: 0.13, end: 0.1},
            blendMode: 'NORMAL',
            frequency: 45, // The amount of ms between particles.
            lifespan: 250,
            alpha: {
                start: 1,
                end: 0
            },
            followOffset: {
                y: this.player.displayHeight / 2 - PLAYER_SQUARE[this.player.playerType].bottom * this.player.scale
            } // Make the particles appear at the bottom of the player image.
        });

        // When sliding on a wall.
        this.wall = this.scene.frictionParticles.createEmitter({
            on: false,
            follow: this.player, // Follow the player.
            speed: 100,
            scale: { start: 0.13, end: 0.1},
            blendMode: 'NORMAL',
            frequency: 70, // The amount of ms between particles.
            lifespan: 250,
            alpha: {
                start: 1,
                end: 0
            },
            followOffset: {
                y: -this.player.displayHeight / 2 + PLAYER_SQUARE[this.player.playerType].top * this.player.scale
            } // Make the particles appear at the top of the player image.
        });

        // An explosion of particles when wall jumping.
        this.wallJump = this.scene.frictionParticles.createEmitter({
            on: false,
            speed: 200,
            scale: { start: 0.13, end: 0.1},
            blendMode: 'NORMAL',
            lifespan: 300,
            alpha: {
                start: 1,
                end: 0.8
            }
        });

        // An explosion of particles when wall jumping.
        this.floorHit = this.scene.frictionParticles.createEmitter({
            on: false,
            speed: 250,
            gravityY: 1000,
            scale: { start: 0.13, end: 0.1},
            blendMode: 'NORMAL',
            lifespan: 800,
            bounce: 0.6,
            angle: { min: -120, max: -60 },
            alpha: {
                start: 1,
                end: 0.8
            }
        });

        this.particleTypes = {
            'floor': this.floor,
            'wall': this.wall,
            'wallJump': this.wallJump,
            'floorHit': this.floorHit
        };
    }

    startParticles(particleType) {
        if (particleType === 'floor') {
            this.floor.on = true;
            // Set the position and direction of the particles based on player velocity.
            if (this.player.body.velocity.x > 0) {
                this.floor.setAngle({ min: 180, max: 240 });
                this.floor.followOffset.x = -this.player.displayWidth / 2 + PLAYER_SQUARE[this.player.playerType].left * this.player.scale;
            } else {
                this.floor.setAngle({ min: -40, max: 0 });
                this.floor.followOffset.x = this.player.displayWidth / 2 - PLAYER_SQUARE[this.player.playerType].right * this.player.scale;
            }
        } else if (particleType === 'wall') {
            this.wall.on = true;
            // Set the position and direction of the particles based on player velocity.
            if (this.player.body.blocked.right) {
                this.wall.setAngle({ min: -90, max: -130 });
                this.wall.followOffset.x = this.player.displayWidth / 2 - PLAYER_SQUARE[this.player.playerType].right * this.player.scale;
            } else {
                this.wall.setAngle({ min: -50, max: -90 });
                this.wall.followOffset.x = -this.player.displayWidth / 2 + PLAYER_SQUARE[this.player.playerType].left * this.player.scale;
            }
        }
    }

    updateParticleImage(particleType) {
        // Make the image of the particles match the tile the player is
        // on or agaisnt.
        let tileX, tileY, tile;

        if (particleType === 'floor' || particleType === 'floorHit') {
            tileX = this.player.body.left;
            tileY = this.player.body.y + 70;

            tile = this.scene.map.getTileAtWorldXY(tileX, tileY, false, this.scene.cameras.main, this.scene.blockLayer);

            // If no tile was found, the body could be at an edge and
            // is touching a tile on the other side of its body.
            if (!tile) {
                // Test for a tile on the other side of the body.
                tileX = this.player.body.right;
                tile = this.scene.map.getTileAtWorldXY(tileX, tileY, false, this.scene.cameras.main, this.scene.blockLayer);
            }
        } else if (particleType === 'wall' || particleType === 'wallJump') {
            if (this.player.body.blocked.right) {
                tileX = this.player.body.x + 70;
            } else {
                tileX = this.player.body.x - 70;
            }
            tileY = this.player.body.top;

            tile = this.scene.map.getTileAtWorldXY(tileX, tileY, false, this.scene.cameras.main, this.scene.blockLayer);

            // If no tile was found, the body could be at an edge and
            // is touching a tile on the other side of its body.
            if (!tile) {
                // Test for a tile on the other side of the body.
                tileY = this.player.body.bottom;
                tile = this.scene.map.getTileAtWorldXY(tileX, tileY, false, this.scene.cameras.main, this.scene.blockLayer);
            }
        }

        // Update the image for the particles, if a tile was found.
        if (tile) {
            this.particleTypes[particleType].setFrame(tile.index - 1);
        }
    }

    explodeWallJumpParticles(wallSide) {
        // Make sure the particle image matches the surface the player
        // is jumping off of.
        this.updateParticleImage('wallJump');
        
        if (wallSide === 'right') {
            this.wallJump.setAngle({ min: 90, max: 270 });
            this.wallJump.explode(8, this.player.body.x + this.player.body.halfWidth,
                this.player.body.y + this.player.body.halfHeight);
        } else if (wallSide === 'left') {
            this.wallJump.setAngle({ min: -90, max: 90 });
            this.wallJump.explode(8, this.player.body.x,
                this.player.body.y + this.player.body.halfHeight);
        }
    }

    explodeFloorHitParticles() {
        // Make sure the particle image matches the surface the player
        // is jumping off of.
        this.updateParticleImage('floorHit');

        let amount;

        if (this.player.lastVelocity.y < 520) {
            // 2 blocks.
            amount = 2;
        } else if (this.player.lastVelocity.y < 640) {
            // 3 blocks (player jump velocity floor hit is 540).
            amount = 3;
        } else if (this.player.lastVelocity.y < 740) {
            // 4 blocks.
            amount = 5;
        } else {
            amount = 7;
        }

        // Update the bounds so the particles collide with the floor.
        this.floorHit.setBounds({
            x: this.player.body.x - 400,
            y: this.player.body.top - 100,
            width: this.player.body.width + 800,
            height: this.player.body.height + 100
        });
        
        this.floorHit.explode(amount, this.player.body.x + this.player.body.halfWidth,
            this.player.body.bottom);
    }
}