export default {
    type: Phaser.AUTO,
    width: document.getElementById('game').getBoundingClientRect().width,
    height: document.getElementById('game').getBoundingClientRect().height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000
            },
            debug: false,
        }
    },
    // scene: [
    //     GameScene
    // ],
    scale: {
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
