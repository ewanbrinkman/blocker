import Player from '../sprites/Player.js';
import { SCENE_KEYS } from '../constants.js';

// Start position.
const startX = 210;
const startY = 70;
// const startX = 70;
// const startY = 1085;
// Player properties.
let playerType = 'elephant';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.game
        });
    }

    preload() {
        // To extrude a tileset using tile-extruder on the command line:
        // tile-extruder --tileWidth 70 --tileHeight 70 --spacing 2 --input ./tiles.png --output ./tiles-extruded.png
        // To load into tiled, use a margin of 1px (1px plus the original 0px) and a spacing of 4px (2px plus the original 2px).
        // Load maps made with Tiled in JSON format.
        this.load.tilemapTiledJSON('map', 'assets/maps/map2.json');
        // Tiles in spritesheet.
        this.load.spritesheet('tiles', 'assets/images/spritesheets/tiles.png', {frameWidth: 70, frameHeight: 70, margin: 1, spacing: 4});
        // Player images.
        this.load.atlas('players', 'assets/images/player/spritesheet.png', 'assets/images/player/spritesheet.json')

        // Particles.
        this.load.image('grass', 'assets/images/particles/grass.png');
    }

    create() {
        // Load the map.
        this.map = this.make.tilemap({key: 'map'});
        
        // Tiles for the block layer.
        this.tiles = this.map.addTilesetImage('tiles', 'tiles', 70, 70, 1, 4);
        // Create the block layer.
        this.blockLayer = this.map.createLayer('Blocks', this.tiles, 0, 0);
        this.decorationsLayer = this.map.createLayer('Decorations', this.tiles, 0, 0);
        // The player will collide with this layer.
        this.blockLayer.setCollisionByExclusion([-1]);

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
            frame: playerType,
            playerType: playerType,
        });

        // Set bounds so the camera won't go outside the game world.
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        // Make the camera follow the player.
        this.cameras.main.startFollow(this.player);
        // Set the background color of the camera.
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Get the cursor keys for player movement.
        this.cursors = this.input.keyboard.createCursorKeys();

        // The F key can be used to toggle fullscreen.
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

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
