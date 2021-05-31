import Button from '../objects/Button.js';
import { SCENE_KEYS, TITLE_SCENE } from '../constants.js';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.title);
    }

    create() {
        // Reposition objects when the screen is resized.
        this.scale.on('resize', this.resize, this);

        // Remove the resize event for this scene when the scene stops.
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.resize);
        });

        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.gameButton = new Button(
            this,
            width / 2,
            height / 2 + TITLE_SCENE.gameButton.offset.y,
            'greenbuttonup',
            'greenbuttondown',
            'Play',
            SCENE_KEYS.game);
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.gameButton.setPosition(width / 2, height / 2 + TITLE_SCENE.gameButton.offset.y);
    }
};
