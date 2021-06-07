import Button from '../objects/Button.js';
import { PLAYER_TYPES } from '../constants/player.js';
import { SCENE_KEYS, OPTIONS_SCENE } from '../constants/scenes.js';
import { COLORS } from '../constants/style.js';

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

        this.backButton = new Button({
            scene: this,
            x: width / 2,
            y: height + OPTIONS_SCENE.backButton.offset.y,
            imageUp: 'greenbuttonup',
            imageDown: 'greenbuttondown',
            text: 'Back',
            targetScene: SCENE_KEYS.title,
            // targetFunction: () => {
            //     this.registry.player.playerType = 'parrot';
            // }
        });

        // Add all of the player selection buttons.
        PLAYER_TYPES.forEach((playerType, index) => {
            console.log(playerType, index);
            // There will be 5 images per row. Therefore, there will be
            // 2 rows, since there are 10 images (the player type
            // images).
            let row = Math.floor(index / 5);
            // The x offset will start at 10% of the screen, and
            // continue in steps of 20%. After the 5th one, a new row
            // will start. To get the x offset on this new row,
            // subtract 1 * the number of rows down, which is just the
            // row variable.
            let offsetX = (0.1 + (index * 0.2) - (row)) * width;
        });
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
