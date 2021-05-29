import GameScene from './scenes/GameScene.js';

// The container that will hold the game.
const parent = document.getElementById('game').getBoundingClientRect();

const config = {
    type: Phaser.AUTO,
    width: parent.width,
    height: parent.height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000
            },
            debug: false,
        }
    },
    scene: [
        GameScene
    ],
    scale: {
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// Resize the game to fit the parent container when the window gets
// resized.
window.addEventListener('resize', () => {
    let rect = game.scale.parent.getBoundingClientRect();
    game.scale.resize(rect.width, rect.height);
});
