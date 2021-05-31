import config from './config.js';
import { SCENE_KEYS } from './constants.js';
import BootScene from './scenes/BootScene.js';
import CreditsScene from './scenes/CreditsScene.js';
import GameScene from './scenes/GameScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import PreloaderScene from './scenes/PreloaderScene.js';
import TitleScene from './scenes/TitleScene.js';

class Game extends Phaser.Game {
    constructor() {
        super(config);
        this.scene.add(SCENE_KEYS.boot, BootScene);
        this.scene.add(SCENE_KEYS.credits, CreditsScene);
        this.scene.add(SCENE_KEYS.game, GameScene);
        this.scene.add(SCENE_KEYS.options, OptionsScene);
        this.scene.add(SCENE_KEYS.preloader, PreloaderScene);
        this.scene.add(SCENE_KEYS.title, TitleScene);
        // this.scene.start(SCENE_KEYS.game);
        this.scene.start(SCENE_KEYS.boot);
    }
}

const game = new Game();

// Track events here so that they will apply to all scenes.

// Resize the game to fit the parent container when the window gets
// resized.
window.addEventListener('resize', () => {
    let rect = game.scale.parent.getBoundingClientRect();
    game.scale.resize(rect.width, rect.height);
});

// The F key can be used to toggle fullscreen.
window.addEventListener('keypress', (key) => {
    if (key.code === 'KeyF') {
        if (game.scale.isFullscreen) {
            game.scale.stopFullscreen();
        } else {
            game.scale.startFullscreen();
        }
    }
});
