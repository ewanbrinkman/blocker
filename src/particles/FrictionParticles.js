import { getTileSide, getTileBottom } from '../utils/tiles.js';
import { getBodyOffset, getBodySide } from '../utils/body.js';

export default class FrictionParticles {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Minimum player velocity relative to the maximum while moving
        // along the floor, in order to start friction particles.
        this.minVelocityFloor = 0.8

        this.createEmitters();
    }

    createEmitters() {
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
            }
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
            }
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
            // Make the particles appear at the bottom of the player image.
            this.floor.followOffset.y = this.player.displayHeight / 2 - getBodyOffset(this.player, 'bottom');

            // Set the position and direction of the particles based on player velocity.
            if (this.player.body.velocity.x > 0) {
                this.floor.setAngle({ min: 180, max: 240 });
                this.floor.followOffset.x = -this.player.displayWidth / 2 + getBodyOffset(this.player, 'left');
            } else {
                this.floor.setAngle({ min: -40, max: 0 });
                this.floor.followOffset.x = this.player.displayWidth / 2 - getBodyOffset(this.player, 'right');
            }
            this.floor.on = true;
        } else if (particleType === 'wall') {
            // Make the particles appear at the top of the player image.
            this.wall.followOffset.y = -this.player.displayHeight / 2 + getBodyOffset(this.player, 'top')

            // Set the position and direction of the particles based on player velocity.
            if (this.player.body.blocked.right) {
                this.wall.setAngle({ min: -90, max: -130 });
                this.wall.followOffset.x = this.player.displayWidth / 2 - getBodyOffset(this.player, 'right');
            } else {
                this.wall.setAngle({ min: -50, max: -90 });
                this.wall.followOffset.x = -this.player.displayWidth / 2 + getBodyOffset(this.player, 'left');
            }
            this.wall.on = true;
        }
    }

    updateParticleImage(particleType) {
        // Make the image of the particles match the tile the player is
        // on or agaisnt.
        let tile;

        // Different particle types get the tile image from different
        // locations.
        if (particleType === 'floor' || particleType === 'floorHit') {
            tile = getTileBottom(this.player, this.scene, this.scene.collidersLayer).tile;
        } else if (particleType === 'wall') {
            // If the player is beside a tile on the wall.
            tile = getTileSide(this.player, this.scene, this.scene.collidersLayer, undefined, false).tile;
        }

        // Update the image for the particles, if a tile was found.
        if (tile) {
            this.particleTypes[particleType].setFrame(tile.index - 1);
        }
    }

    explodeWallJumpParticles(tile, wallSide) {
        // Make sure the particle image matches the surface the player
        // is jumping off of.
        this.particleTypes['wallJump'].setFrame(tile.index - 1);
        
        if (wallSide === 'right') {
            this.wallJump.setAngle({ min: 90, max: 270 });
            this.wallJump.explode(
                8,
                getBodySide(this.player, 'left') + this.player.body.halfWidth,
                getBodySide(this.player, 'top') + this.player.body.halfHeight);
        } else if (wallSide === 'left') {
            this.wallJump.setAngle({ min: -90, max: 90 });
            this.wallJump.explode(
                8,
                getBodySide(this.player, 'left'),
                getBodySide(this.player, 'top') + this.player.body.halfHeight);
        }
    }

    explodeFloorHitParticles() {
        // Make sure the particle image matches the surface the player
        // is jumping off of.
        this.updateParticleImage('floorHit');

        let amount;

        // The amount of particles depends on how hard the player hit
        // the floor.
        if (this.player.lastVelocity.y < 520) {
            // 2 blocks.
            amount = 2;
        } else if (this.player.lastVelocity.y < 640) {
            // 3 blocks.
            amount = 3;
        } else if (this.player.lastVelocity.y < 740) {
            // 4 blocks.
            amount = 5;
        } else {
            amount = 7;
        }

        // Update the bounds so the particles collide with the floor.
        this.floorHit.setBounds({
            x: getBodySide(this.player, 'left') - 400,
            y: getBodySide(this.player, 'top') - 100,
            width: this.player.body.width + 800,
            height: this.player.body.height + 100
        });

        this.floorHit.explode(
            amount,
            getBodySide(this.player, 'left') + this.player.body.halfWidth,
            getBodySide(this.player, 'bottom'));
    }

    killAllParticles() {
        // Stop all particles that are currently playing.
        Object.values(this.particleTypes).forEach(particleEmitter => {
            particleEmitter.killAll();
        });
    }
}
