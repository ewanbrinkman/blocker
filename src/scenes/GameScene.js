import Player from '../sprites/Player.js';
import FrictionParticles from '../particles/FrictionParticles.js';
import { COLORS } from '../constants/style.js';
import { TILES } from '../constants/maps.js';
import { SCENE_KEYS } from '../constants/scenes.js';
import { LEVELS } from '../constants/levels.js';

// Start position.
const startX = 3 * TILES.width + 0.5 * TILES.width;
const startY = 1 * TILES.height + 0.5 * TILES.height;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.game);
    }

    refillLevels() {
        this.registry.game.possibleLevels = [...this.registry.levels]; 
    }

    randomLevel(omitLevel) {
        let possibleLevels = [...this.registry.game.possibleLevels];
        // Make sure the new level wasn't just completed.
        if (omitLevel) {
            possibleLevels = possibleLevels.filter(element => element !== omitLevel);
        }
        // Choose a random level.
        this.currentLevel = Phaser.Utils.Array.RemoveRandomElement(possibleLevels);

        // Update possible levels that can be chosen next by taking out
        // the level that was just chosen.
        this.registry.game.possibleLevels = this.registry.game.possibleLevels.filter(element => element !== this.currentLevel);

        // The level that was just chosen can't be chosen again in the
        // next level. This will only matter if the list of levels was
        // just refilled.
        this.registry.game.lastLevel = this.currentLevel;

        // If all levels have been completed, refill the uncompleted levels list.
        if (this.registry.game.possibleLevels.length === 0) {
            this.refillLevels();
        }
    }

    create() {
        // Keep track of colliders.
        this.colliders = {}

        // Create a list of all uncompleted levels. This way, the
        // game doesn't randomly give the player the same level in
        // a row.
        this.refillLevels();

        // Choose a random level. Make sure the last level that was
        // just completed isn't chosen again.
        this.randomLevel(this.registry.game.lastLevel);

        // Create the level.
        this.createLevel();
        
        // Particle when moving agaisnt surfaces.
        this.frictionParticles = this.add.particles('tiles');
        // Render on top.
        this.frictionParticles.setDepth(1);

        // Create the player.
        this.player = new Player({
            scene: this,
            x: startX,
            y: startY,
            texture: 'players',
            frame: this.registry.player.playerType,
            playerType: this.registry.player.playerType,
        });

        // Make the camera follow the player.
        this.cameras.main.startFollow(this.player);

        // Get the cursor keys for player movement.
        this.cursors = this.input.keyboard.createCursorKeys();

        // For testing going to the next level.
        this.input.keyboard.on('keydown-ESC', () => {
            this.nextLevel();
        });

        // For testing the timer.
        this.input.keyboard.on('keydown-A', () => {
            this.endTimer.delay += 10000;
        });

        // For testing the timer.
        this.input.keyboard.on('keydown-R', () => {
            this.player.respawn();
        });

        // The game timer.
        this.endTimer = this.time.addEvent({
            delay: LEVELS.normal.startTime * 1000,
            callback: this.gameOver,
            args: [],
            callbackScope: this,
        });

        // Start the HUD scene for the game. It will run at the same
        // time as the game.
        this.scene.launch(SCENE_KEYS.hud, {gameScene: this});
    }

    update(time, delta) {
        // Update the player.
        this.player.update(this.cursors, time, delta);
    }

    nextLevel() {
        // In the future, might want to add an option for the scene
        // data to pass in current player effects. That way, effects
        // can continue throughout levels.
        this.registry.game.completedLevelsCount += 1;

        // Destroy the current level.
        this.destroyLevel();

        // Choose a random level. Make sure the last level that was
        // just completed isn't chosen again.
        this.randomLevel(this.registry.game.lastLevel);
        // Create the level.
        this.createLevel();

        // Update the player's collisions.
        // Collide with the blocks of the map.
        this.colliders['collidersLayer'] = this.physics.add.collider(this.collidersLayer, this.player);
        // Collide with the custom sized collision boxes of the map.
        this.colliders['walls'] = this.physics.add.collider(this.walls, this.player);

        // Move the player to the starting position of the level.
        this.player.respawn();

        // Recreate the particle emitter. This prevents it from putting
        // particles in the wrong place after a new level starts.
        this.frictionParticles.destroy();
        // Particle when moving agaisnt surfaces.
        this.frictionParticles = this.add.particles('tiles');
        // Render on top.
        this.frictionParticles.setDepth(1);
        this.player.frictionParticles = new FrictionParticles(this, this.player);
    }

    destroyLevel() {
        // Destroy a level.
        this.map.destroy();
        // Pass in "true" to 
        this.walls.destroy(true);

        // Remove the player's colliders.
        this.physics.world.colliders.remove(this.colliders['collidersLayer']);
        this.physics.world.colliders.remove(this.colliders['walls']);

        // Stop all of the friction particles.
        this.player.frictionParticles.killAllParticles();
        
    }

    createLevel() {
        // Create the current level.
        // Load the map.
        // this.map = this.make.tilemap({key: this.currentLevel});
        this.map = this.make.tilemap({key: this.currentLevel});

        // Tiles for the block layer.
        this.tiles = this.map.addTilesetImage('tiles', 'tiles', TILES.width, TILES.height, 1, 4);
        // Create the block layer.
        this.collidersLayer = this.map.createLayer('Colliders', this.tiles, 0, 0);
        this.decorationsLayer = this.map.createLayer('Decorations', this.tiles, 0, 0);

        this.customCollisionTilesIndexes = [];

        // Create custom collision boxes as static sprites.
        this.walls = this.physics.add.staticGroup();
        // Get the data in Tiled of the tiles that have custom
        // collisions set.
        for (const tileIndex in this.map.tilesets[0].tileData) {
            // Add this tile to the list of tiles which will have a
            // custom collision box.
            this.customCollisionTilesIndexes.push(parseInt(tileIndex) + 1);

            // Get the collision boxes on this tile.
            const walls = this.map.tilesets[0].tileData[tileIndex].objectgroup.objects;
            
            // Find tiles with this index.
            this.map.forEachTile((tile) => {
                if (tile.index === (parseInt(tileIndex) + 1)) {

                    // Create the collision boxes for this tile.
                    walls.forEach((wall) => {
                        // Create a static sprite for collisions.
                        let staticSprite = this.walls.create(wall.x + tile.x * TILES.width,
                            wall.y + tile.y * TILES.height);

                        staticSprite.setOrigin(0, 0);
                        staticSprite.displayWidth = wall.width;
                        staticSprite.displayHeight = wall.height;
                        staticSprite.visible = false;
                        
                        // Update the body after changing it. A static
                        // body won't update automatically.
                        staticSprite.refreshBody();
                    });
                }
            }, undefined, undefined, undefined, undefined, undefined, undefined, this.collidersLayer);
        }

        // The player will collide with this layer. Don't collide with
        // tiles that have an index of -1, as there is nothing there.
        // Also, collision for the custom collision tiles is done
        // separately by using static sprites.
        this.collidersLayer.setCollisionByExclusion([-1].concat(this.customCollisionTilesIndexes));

        // Physics world boudary.
        this.physics.world.bounds.x = 0;
        this.physics.world.bounds.y = 0;
        this.physics.world.bounds.width = this.map.widthInPixels;
        this.physics.world.bounds.height = this.map.heightInPixels;
        // The player will handle world boundary collisions itself. The
        // player will be able to pass through the top and bottom world
        // boundary but not the left or right sides.
        this.physics.world.setBoundsCollision(false, false, false, false);

        // Set bounds so the camera won't go outside the game world.
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Set the background color of the camera.
        this.cameras.main.setBackgroundColor(COLORS.background);

        // Draw the world boundary in yellow. It won't be seen unless
        // the level isn't big enough to take up the entire screen.
        let graphics;
        let strokeWidth = 10;
        graphics = this.add.graphics();
        graphics.lineStyle(strokeWidth, 0xffff00, 1);

        // 32px radius at the corners.
        graphics.strokeRect(0 - strokeWidth / 2, 0 - strokeWidth / 2,
            this.map.widthInPixels + strokeWidth, this.map.heightInPixels + strokeWidth);
    }

    gameOver() {
        // Stop the HUD scene from running.
        this.scene.stop(SCENE_KEYS.hud);
        // Switch to the game over screen.
        this.scene.start(SCENE_KEYS.gameover);
    }
}
