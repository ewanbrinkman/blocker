const parent = document.getElementById('game').getBoundingClientRect();

let moveX, moveY;
let map;
let player;
let cursors;
let blockLayer, coinLayer;
let text;
const gravity = 1000;
// Start position.
const startX = 70;
// const startY = 0;
const startY = 1085;
// Player properties.
let playerType = 'rabbit'
let playerScale = 0.25;
// let playerScale = 0.25;
const playerBounce = 0;
// const playerJumpVel = 5000;
const playerJumpVel = 570;
// const playerJumpVel = 450;
const playerMaxVelX = 250;
const playerMaxVelY = 750;
const playerAcc = 1000;
const playerDragX = 1500;
const playerDragY = 10;

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
    rect = game.scale.parent.getBoundingClientRect();
    game.scale.resize(rect.width, rect.height);
});

function centerOfAnimalSquare(x, y) {
    // Given an x and y position, move the coordinates so that the
    // center is at the middle of the animal square, not the middle of
    // the image.
    switch (playerType) {
        case 'hippo': {
            return [x, y - (34 - 24) / 2 * playerScale] // 34 px top, 24 px bottom.
        }
        case 'monkey': {
            return [x, y] // The center of the image is also the centre of the square.
        }
        case 'rabbit': {
            return [x, y - 130 / 2 * playerScale]; //  130 px top.
        }
        case 'pig': {
            return [x, y - 21 / 2 * playerScale]; // 21 px top.
        }
    }
}

function getAnimalBodyOffset() {
    switch (playerType) {
        case 'hippo': {
            return [23, 34]
        }
        case 'monkey': {
            return [54, 0]
        }
        case 'rabbit': {
            return [0, 130];
        }
        case 'pig': {
            return [37, 21];
        }
    }
}

function preload() {
    // To extrude a tileset using tile-extruder on the command line:
    // tile-extruder --tileWidth 70 --tileHeight 70 --spacing 2 --input ./tiles.png --output ./tiles-extruded.png
    // To load into tiled, use a margin of 1px (1px plus the original 0px) and a spacing of 4px (2px plus the original 2px).
    // Load maps made with Tiled in JSON format.
    this.load.tilemapTiledJSON('map', 'assets/images/maps/map2.json');
    // Tiles in spritesheet.
    this.load.spritesheet('tiles', 'assets/images/spritesheets/tiles.png', {frameWidth: 70, frameHeight: 70, margin: 1, spacing: 4});
    // Player images.
    this.load.atlasXML('players', 'assets/images/player/players.png', 'assets/images/player/players.xml')
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
    // this.physics.world.bounds.width = map.widthInPixels;
    // this.physics.world.bounds.height = map.heightInPixels;

    // this.physics.world.bounds.x = 0;
    // this.physics.world.bounds.y = 0;
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    this.physics.world.setBoundsCollision(true, true, false, false);

    // Create the player sprite.
    // let playerAtlasTexture = this.textures.get('players');
    // let playerFrames = playerAtlasTexture.getFrameNames();
    // player = this.physics.add.sprite(200, 200, 'players', playerFrames[8]);

    // Create the player sprite.
    let [x, y] = centerOfAnimalSquare(startX, startY)
    player = this.physics.add.sprite(x, y, 'players', playerType);

    player.body.setDrag(playerDragX, playerDragY);
    player.body.setMaxVelocity(playerMaxVelX, playerMaxVelY);
    player.setBounce(playerBounce);
    
    // Change the player's hitbox (body) size.
    player.body.setSize(256, 256)
    // Adjust the hitbox location to overlap with the square body section of
    // the animal.
    const [ bodyOffsetX, bodyOffsetY ] = getAnimalBodyOffset();
    player.body.setOffset(bodyOffsetX, bodyOffsetY);
    // Change the player size.
    player.setScale(playerScale);

    // Don't go out of the map.
    player.setCollideWorldBounds(true);
    // Collide with the blocks of the map.
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

    this.input.on('pointerdown', function(pointer, pos){
        if (pointer.downY > this.game.scale.height / 2) {
            if (pointer.downX > this.game.scale.width / 2) {
                moveX = 'right';
            } else {
                moveX = 'left';
            }
        }

        if (pointer.downY < this.game.scale.height / 2) {
            moveY = 'up';
        }
    }, this);

    this.input.on('pointerup', function(){
        moveX = false;
        moveY = false;
    }, this);

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
    if (cursors.left.isDown || moveX === 'left') {
        player.body.setAccelerationX(-playerAcc);
        // player.anims.play('walk', true);
        // Flip the sprite to the left.
        // player.flipX = true;
    } else if (cursors.right.isDown || moveX === 'right') {
        player.body.setAccelerationX(playerAcc);
        // player.anims.play('walk', true);
        // Make sure the sprite is facing its original right.
        // player.flipX = false;
    } else {
        player.body.setAccelerationX(0);
        // player.anims.play('idle', true);
    }
    if ((cursors.space.isDown || cursors.up.isDown || moveY === 'up') && player.body.onFloor()) {
        player.body.setVelocityY(-playerJumpVel);
    } 

    if (player.body.y > map.heightInPixels) {
        player.body.x = startX;
        player.body.y = startY;
        player.body.setVelocity(0, 0);
    }
}
