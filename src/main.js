import config from './config.js';
import { SCENE_KEYS } from './constants.js';
import GameScene from './scenes/GameScene.js';

class Game extends Phaser.Game {
    constructor() {
        super(config);
        this.scene.add(SCENE_KEYS.game, GameScene);
        this.scene.start(SCENE_KEYS.game);
    }
}

const game = new Game();

// Resize the game to fit the parent container when the window gets
// resized.
window.addEventListener('resize', () => {
    let rect = game.scale.parent.getBoundingClientRect();
    game.scale.resize(rect.width, rect.height);
});
