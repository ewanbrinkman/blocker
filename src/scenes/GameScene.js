import Player from '../sprites/Player.js';
import FrictionParticles from '../particles/FrictionParticles.js';
import { COLORS } from '../constants/style.js';
import { TILES } from '../constants/maps.js';
import { SCENE_KEYS } from '../constants/scenes.js';
import { LEVELS } from '../constants/levels.js';
import { BASE_PLAYER, PLAYER_SQUARE } from '../constants/player.js';

// Start position.
const startX = 3 * TILES.width + 0.5 * TILES.width;
const startY = 1 * TILES.height + 0.5 * TILES.height;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.game);
    }

    create() {
        this.registry.music.stop();
        this.registry.music = this.sound.add('grasslands', {
            loop: true,
            volume: 0.1
        });
        this.registry.music.play();

        // Reset the data needed for when playing the game.
        this.registry.game = {
            lastLevel: null,
            totalTimeElapsed: 0,
            possibleLevels: [],
            completedLevelsCount: 0,
            speedrun: {
                startTime: 0,
            }
        }

        // The chosen starting position of a level.
        this.spawnPoint = {
            x: 0,
            y: 0
        }
        // Keep track of colliders.
        this.colliders = {}
        this.overlaps = {}

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
        this.frictionParticles.setDepth(2);

        // Create the player.
        this.player = new Player({
            scene: this,
            position: {
                x: this.spawnPoint.x,
                y: this.spawnPoint.y
            },
            scale: BASE_PLAYER.scale,
            texture: 'players',
            frame: this.registry.player.playerType,
            playerType: this.registry.player.playerType,
        });
        this.player.respawn(false);

        // Make the camera follow the player.
        this.cameras.main.startFollow(this.player);

        // The game timer.
        if (this.registry.gamemode === 'normal') {
            this.endTimer = this.time.addEvent({
                delay: LEVELS.normal.startTime * 1000,
                callback: this.gameOver,
                args: [],
                callbackScope: this,
            });
        }

        // Start the HUD scene for the game. It will run at the same
        // time as the game.
        this.scene.launch(SCENE_KEYS.hud, {gameScene: this});

        // Only start the time once. Keep track if it has been started
        // yet or not.
        this.timeStarted = false;

        // If the game has ended yet. Once it has, a new level can't be started.
        this.gameEnded = false;

        // Quit to the title scene (main menu).
        this.input.keyboard.on('keydown-ESC', () => {
            this.gameOver();
        });

        this.keys = {
            r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            t: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)
        }
        // Create the keys for player movement.
        this.keys.cursors = this.input.keyboard.createCursorKeys();;
        this.keys.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Place keys for the same purpose in a list together.
        this.keyGroups = {
            up: [this.keys.cursors.up, this.keys.wasd.up, this.keys.cursors.space],
            left: [this.keys.cursors.left, this.keys.wasd.left],
            down: [this.keys.cursors.down, this.keys.wasd.down],
            right: [this.keys.cursors.right, this.keys.wasd.right],
            respawn: [this.keys.r],
            test: [this.keys.t]
        }

        // The types of key input the game needs.
        this.keyInputTypes = ['isDown', 'justDown'];
    }

    update() {
        // Start the timer if it hasn't started yet.
        if (!this.timeStarted) {
            this.registry.game.speedrun.startTime = this.time.now;
            this.timeStarted = true;
        }

        // Get which keys are pressed and just pressed.
        this.currentInput = this.getActiveKeys();

        // Update the player.
        this.player.update(this.currentInput);
    }

    isActive(keys, inputType) {
        let activeKeys;

        // Get a list of all keys that pass the filter (if the key is
        // down or just got pressed).
        if (inputType === 'isDown') {
            activeKeys = keys.filter(key => key.isDown);
        } else if (inputType === 'justDown') {
            activeKeys = keys.filter(key => Phaser.Input.Keyboard.JustDown(key));
        }

        // If no keys are active, the length of the list will be 0,
        // which will return false.
        return Boolean(activeKeys.length);
    }

    getActiveKeys() {
        // Get current key inputs.
        let currentInput = {}
        // Get all input types (isDown, justDown).
        Object.keys(this.keyGroups).forEach(keyGroupType => {
            currentInput[keyGroupType] = {}
            this.keyInputTypes.forEach(keyInputType => {
                currentInput[keyGroupType][keyInputType] = this.isActive(this.keyGroups[keyGroupType], keyInputType);
            });
        });

        return currentInput;
    }

    refillLevels() {
        this.registry.game.possibleLevels = [...this.registry.levels[this.registry.difficulty]]; 
    }

    randomLevel(omitLevel) {
        let possibleLevels = [...this.registry.game.possibleLevels];

        // Make sure the new level wasn't just completed.
        if (omitLevel && this.registry.game.possibleLevels.length > 1) {
            possibleLevels = possibleLevels.filter((element) => (element !== omitLevel));
        }
        // Choose a random level.
        this.currentLevel = Phaser.Utils.Array.RemoveRandomElement(possibleLevels);

        // Update possible levels that can be chosen next by taking out
        // the level that was just chosen.
        this.registry.game.possibleLevels = this.registry.game.possibleLevels.filter((element) => (element !== this.currentLevel));

        // The level that was just chosen can't be chosen again in the
        // next level. This will only matter if the list of levels was
        // just refilled.
        this.registry.game.lastLevel = this.currentLevel;
    }

    nextLevel() {
        if (this.gameEnded) {
            return;
        }

        this.registry.sounds.complete.play();
        this.registry.game.completedLevelsCount ++;

        // If all levels have been completed, refill the uncompleted levels list.
        if (this.registry.game.possibleLevels.length === 0) {
            if (this.registry.gamemode === 'normal') {
                this.refillLevels();
            } else {
                this.gameOver();
                return;
            }
        }

        // In the future, might want to add an option for the scene
        // data to pass in current player effects. That way, effects
        // can continue throughout levels.

        // Add a little bit of time to the timer.
        if (this.registry.gamemode === 'normal') {
            this.endTimer.delay += LEVELS.normal.completeTime * 1000;
        }

        // Destroy the current level.
        this.destroyLevel();

        // Choose a random level. Make sure the last level that was
        // just completed isn't chosen again.
        this.randomLevel(this.registry.game.lastLevel);
        // Create the level.
        this.createLevel();

        // Update the player's collisions.
        this.player.addCollisions();

        this.player.spawnPoint.x = this.spawnPoint.x;
        this.player.spawnPoint.y = this.spawnPoint.y;
        this.player.respawn(false);

        // Recreate the friction particle emitter. This prevents it
        // from putting friction particles in the wrong place after a
        // new level starts.
        this.frictionParticles.destroy();
        // Particle when moving agaisnt surfaces.
        this.frictionParticles = this.add.particles('tiles');
        // Render on top.
        this.frictionParticles.setDepth(2);
        this.player.frictionParticles = new FrictionParticles(this, this.player);
    }

    destroyLevel() {
        // Destroy the tilemap.
        this.map.destroy();

        this.graphics.destroy();

        // Pass in "true" to destroy everything in the group.
        this.walls.destroy(true);
        this.exitDoors.destroy(true);

        // Remove the player's colliders.
        this.colliders['collidersLayer'].destroy();
        this.colliders['walls'].destroy();
        this.overlaps['exitDoors'].destroy();

        // Kill all of the friction particles.
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
        this.doorsStartLayer = this.map.createLayer('Doors/Start', this.tiles, 0, 0);
        this.doorsExitLayer = this.map.createLayer('Doors/Exit', this.tiles, 0, 0);

        // Get a list of all starting door coordinates (the bottom part
        // of the door).
        let startDoorBottoms = this.doorsStartLayer.filterTiles(tile => tile.index === 58);

        // Get a list of all layers.
        let layerNames = [];
        this.map.layers.forEach((layerData) => {
            layerNames.push(layerData.name)
        });

        // The map might have a preset start door for speedruns to
        // avoid randomness.
        let speedrunStartDoorBottoms;
        if (layerNames.includes('Doors/SpeedrunStart')) {
            this.doorsSpeedrunStartLayer = this.map.createLayer('Doors/SpeedrunStart', this.tiles, 0, 0);
            speedrunStartDoorBottoms = this.doorsSpeedrunStartLayer.filterTiles(tile => tile.index === 58);

            // If there are any speedrun start doors, add them to the start doors list.
            startDoorBottoms = startDoorBottoms.concat(speedrunStartDoorBottoms);
        }

        let startDoorBottom;
        // Choose the player's starting door.
        if (this.registry.gamemode === 'normal') {
            // Choose a random starting door to start at.
            startDoorBottom = Phaser.Math.RND.pick(startDoorBottoms);
        } else if (this.registry.gamemode === 'speedrun') {
            try {
                // Choose a random speedrun starting door to start at.
                // There should only be one per level if the speedrun start
                // doors layer exists.
                startDoorBottom = Phaser.Math.RND.pick(speedrunStartDoorBottoms);
            } catch {
                // Always choose the first door in the list if no
                // speedrun start door was set.
                startDoorBottom = startDoorBottoms[0];
            }
        }

        // Add half a tile size to the coordinates to get the center.
        this.spawnPoint = {
            x: startDoorBottom.pixelX + 0.5 * TILES.width,
            y: startDoorBottom.pixelY + 0.5 * TILES.height
        }

        this.customCollisionTilesIndexes = [];

        // Don't use static sprites for the walls in order to do
        // collision detection for wall jumping.
        this.walls = this.physics.add.group();
        // Create custom collision boxes as static sprites.
        this.exitDoors = this.physics.add.staticGroup();

        this.addCustomCollisions(this.walls, this.collidersLayer);
        this.addCustomCollisions(this.exitDoors, this.doorsExitLayer);

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
        let strokeWidth = 10;
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(strokeWidth, 0xffff00, 1);

        // 32px radius at the corners.
        this.graphics.strokeRect(0 - strokeWidth / 2, 0 - strokeWidth / 2,
            this.map.widthInPixels + strokeWidth, this.map.heightInPixels + strokeWidth);
    }

    addCustomCollisions(group, layer) {
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
                        let sprite = group.create(wall.x + tile.x * TILES.width,
                            wall.y + tile.y * TILES.height);

                        // If the wall is flipped along the y axis. The
                        // walls also have a rotation and flipX
                        // property.
                        if (tile.rotation === Math.PI) {
                            let distanceY = TILES.height - (wall.y + wall.height);
                            sprite.setY(distanceY + tile.y * TILES.height);
                        }

                        sprite.setOrigin(0, 0);
                        sprite.displayWidth = wall.width;
                        sprite.displayHeight = wall.height;
                        sprite.visible = false;
                        
                        if (group.type === 'StaticPhysicsGroup') {
                            // If the sprite is static, the body won't
                            // update automatically.
                            sprite.refreshBody();
                        } else {
                            // If the sprite is not static, make it so
                            // it can't move.
                            sprite.body.allowGravity = false;
                            sprite.body.immovable = true;
                        }
                    });
                }
            }, undefined, undefined, undefined, undefined, undefined, undefined, layer);
        }
    }

    gameOver() {
        this.gameEnded = true;

        this.registry.music.stop();
        this.registry.music = this.sound.add('intro', {
            loop: true,
            volume: 0.05
        });
        this.registry.music.play();
        // Get the total time.
        if (this.registry.gamemode === 'normal') {
            this.registry.game.totalTimeElapsed = this.endTimer.getElapsedSeconds();
        } else {
            this.registry.game.totalTimeElapsed = (this.time.now - this.registry.game.speedrun.startTime) / 1000;
        }
        // Stop the HUD scene from running.
        this.scene.stop(SCENE_KEYS.hud);
        // Switch to the game over screen.
        this.scene.start(SCENE_KEYS.gameover);
    }
}
