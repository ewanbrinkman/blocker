import Button from '../objects/Button.js';
import { SCENE_KEYS, COLORS, OPTIONS_SCENE } from '../constants.js';

export default class OptionsScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.options);
    }

    create() {
        // Reposition objects when the screen is resized.
        this.scale.on('resize', this.resize, this);

        // Remove the resize event for this scene when the scene stops.
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.resize);
        });

        this.input.keyboard.on('keydown-B', () => {
            let x1right = this.backgrounds[0].getTopRight().x;
            let x2left = this.backgrounds[1].getTopLeft().x;
            console.log('Space Between:', x2left - x1right);
        })

        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background color.
        this.cameras.main.setBackgroundColor(COLORS.background);
        // The background image of world tiles.
        this.background = this.add.image(width / 2, height, 'backgroundOptions');
        this.background.setOrigin(0.5, 1);

        this.backButton = new Button(
            this,
            width / 2,
            height + OPTIONS_SCENE.backButton.offset.y,
            'greenbuttonup',
            'greenbuttondown',
            'Back',
            SCENE_KEYS.title);
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.background.setPosition(width / 2, height);
        this.backButton.setPosition(width / 2, height + OPTIONS_SCENE.backButton.offset.y);
    }
};
