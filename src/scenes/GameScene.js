import Player from '../sprites/Player.js';
import { SCENE_KEYS, TILES, BASE_PLAYER } from '../constants.js';

// Start position.
const startX = 3 * TILES.width;
const startY = 1 * TILES.height;

export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.game);
    }

    create() {
        // Load the map.
        this.map = this.make.tilemap({key: 'map'});
        
        // Tiles for the block layer.
        this.tiles = this.map.addTilesetImage('tiles', 'tiles', TILES.width, TILES.height, 1, 4);
        // Create the block layer.
        this.collidersLayer = this.map.createLayer('Colliders', this.tiles, 0, 0);
        this.decorationsLayer = this.map.createLayer('Decorations', this.tiles, 0, 0);

        this.customCollisionTilesIndexes = [];

        // SET FOR EACH TO USE A SPECIFIC LAYER, INSTEAD OF THE MOST RECENT ONE!!!

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
            this.map.forEachTile(tile => {
                if (tile.index === (parseInt(tileIndex) + 1)) {

                    // Create the collision boxes for this tile.
                    walls.forEach(wall => {
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
            frame: BASE_PLAYER.playerType,
            playerType: BASE_PLAYER.playerType,
        });

        // Set bounds so the camera won't go outside the game world.
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        // Make the camera follow the player.
        this.cameras.main.startFollow(this.player);
        // Set the background color of the camera.
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Get the cursor keys for player movement.
        this.cursors = this.input.keyboard.createCursorKeys();

        // Draw world boundary.
        let graphics;
        let strokeWidth = 10;
        graphics = this.add.graphics();
        graphics.lineStyle(strokeWidth, 0xffff00, 1);

        // 32px radius at the corners.
        graphics.strokeRect(0 - strokeWidth / 2, 0 - strokeWidth / 2,
            this.map.widthInPixels + strokeWidth, this.map.heightInPixels + strokeWidth);
    }

    update(time, delta) {
        // Update the player.
        this.player.update(this.cursors, time, delta);
    }
}
