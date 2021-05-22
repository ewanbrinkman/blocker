import Player from './sprites/player.js';

// The container that will hold the game.
const parent = document.getElementById('game').getBoundingClientRect();

// Gravity.
const gravity = 1000;
// Start position.
const startX = 70;
const startY = 1085;

// Player properties.
let playerType = 'rabbit';
let playerScale = 0.25;

const config = {
    type: Phaser.AUTO,
    width: parent.width,
    height: parent.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false,
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTh
    }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    let rect = game.scale.parent.getBoundingClientRect();
    game.scale.resize(rect.width, rect.height);
});

function preload() {
    // To extrude a tileset using tile-extruder on the command line:
    // tile-extruder --tileWidth 70 --tileHeight 70 --spacing 2 --input ./tiles.png --output ./tiles-extruded.png
    // To load into tiled, use a margin of 1px (1px plus the original 0px) and a spacing of 4px (2px plus the original 2px).
    // Load maps made with Tiled in JSON format.
    this.load.tilemapTiledJSON('map', 'assets/maps/map2.json');
    // Tiles in spritesheet.
    this.load.spritesheet('tiles', 'assets/images/spritesheets/tiles.png', {frameWidth: 70, frameHeight: 70, margin: 1, spacing: 4});
    // Player images.
    this.load.atlasXML('players', 'assets/images/player/players.png', 'assets/images/player/players.xml')
    // this.load.atlas('player', 'assets/images/player/square.png', 'assets/images/player/square.xml')
}

function create() {
    // Load the map.
    this.map = this.make.tilemap({key: 'map'});
    
    // Tiles for the block layer.
    const blockTiles = this.map.addTilesetImage('tiles', 'tiles', 70, 70, 1, 4);
    // Create the block layer.
    this.blockLayer = this.map.createLayer('Blocks', blockTiles, 0, 0);
    // The player will collide with this layer.
    this.blockLayer.setCollisionByExclusion([-1]);

    // Physics world boudary.
    this.physics.world.bounds.x = 0;
    this.physics.world.bounds.y = 0;
    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;
    this.physics.world.setBoundsCollision(true, true, false, false);

    // Create the player.
    this.player = new Player({
        scene: this,
        x: startX,
        y: startY,
        texture: 'players',
        frame: playerType,
        playerType: playerType,
        playerScale: playerScale
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

function update(time, delta) {
    // Update the player.
    this.player.update(this.cursors, time, delta);
}
