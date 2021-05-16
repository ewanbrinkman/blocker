const parent = document.getElementById('game').getBoundingClientRect();

const config = {
    type: Phaser.AUTO,
    width: parent.width,
    height: parent.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
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
    rect = game.scale.parent.getBoundingClientRect();
    game.scale.resize(rect.width, rect.height);
});

let map;
let player;
let cursors;
let blockLayer, coinLayer;
let text;
let playerScale;

function preload() {
    // To extrude a tileset.
    // tile-extruder --tileWidth 70 --tileHeight 70 --spacing 2 --input ./tiles.png --output ./tiles-extruded.png
    // Load maps made with Tiled in JSON format.
    this.load.tilemapTiledJSON('map', 'assets/images/maps/map.json');
    // Tiles in spritesheet.
    this.load.spritesheet('tiles', 'assets/images/spritesheets/tiles.png', {frameWidth: 70, frameHeight: 70, margin: 1, spacing: 4});
    // Player animations.
    // this.load.atlas('player', 'assets/images/player/player.png', 'assets/images/player/player.json');
    // Player images.
    this.load.image('player', 'assets/images/player/rabbit.png')
    // this.load.atlas('player', 'assets/images/player/square.png', 'assets/images/player/square.xml')
}

function create() {
    // Load the map.
    map = this.make.tilemap({key: 'map'});
    // Tiles for the block layer.
    const blockTiles = map.addTilesetImage('tiles', 'tiles', 70, 70, 1, 4);
    // Create the block layer.
    blockLayer = map.createLayer('Blocks', blockTiles, 0, 0);
    // The player will collide with this layer.
    blockLayer.setCollisionByExclusion([-1]);

    // Set the boundaries of the game world.
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // Create the player sprite.
    player = this.physics.add.sprite(200, 200, 'player');
    playerScale = 0.25;
    player.setBounce(0.2);
    // Don't go out of the map.
    player.setCollideWorldBounds(true);
    // Change player collision detection box.
    player.body.setSize(256, 256)
    player.body.setOffset(0, 130)
    // Change the player size.
    player.setScale(playerScale);
    console.log(player.body.width, player.body.height)
    // console.log(player.body)
    // player.body.setSize(player.width, player.height)

    this.physics.add.collider(blockLayer, player);

    // Get the cursor keys for player movement.
    cursors = this.input.keyboard.createCursorKeys();

    // The F key can be used to toggle fullscreen.
    this.input.keyboard.on('keydown-F', () => {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    });

    // Set bounds so the camera won't go outside the game world.
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // Make the camera follow the player.
    this.cameras.main.startFollow(player);

    // Set the background color of the camera.
    this.cameras.main.setBackgroundColor('#87CEEB');

    // this.anims.create({
    //     key: 'walk',
    //     frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
    //     frameRate: 10,
    //     repeat: -1
    // })

    // this.anims.create({
    //     key: 'idle',
    //     frames: [{key: 'player', frame: 'p1_stand'}],
    //     frameRate: 10
    // });

    // Draw world boundary.
    let graphics;
    let strokeWidth = 10;
    graphics = this.add.graphics();
    graphics.lineStyle(strokeWidth, 0xffff00, 1);

    // 32px radius at the corners.
    graphics.strokeRect(0 - strokeWidth / 2, 0 - strokeWidth / 2,
        map.widthInPixels + strokeWidth, map.heightInPixels + strokeWidth);
}

function update(time, delta) {
    if (cursors.left.isDown) {
        player.body.setVelocityX(-200);
        // player.anims.play('walk', true);
        // Flip the sprite to the left.
        // player.flipX = true;
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(200);
        // player.anims.play('walk', true);
        // Make sure the sprite is facing its original right.
        // player.flipX = false;
    } else {
        player.body.setVelocityX(0);
        // player.anims.play('idle', true);
    }
    if ((cursors.space.isDown || cursors.up.isDown) && player.body.onFloor()) {
        player.body.setVelocityY(-500);
    } 
}
