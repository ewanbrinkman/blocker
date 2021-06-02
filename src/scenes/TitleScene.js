import Button from '../objects/Button.js';
import { getSquareCenter } from '../utils.js';
import { SCENE_KEYS, COLORS, TITLE_SCENE, BASE_PLAYER } from '../constants.js';

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

        // Background color.
        this.cameras.main.setBackgroundColor(COLORS.background);

        // The background image of world tiles.
        // this.background = this.add.image(width / 2, height, 'backgroundTitle');
        // this.background.setOrigin(0.5, 1);

        // The background image of world tiles.
        this.background = this.add.image(0, height, 'backgroundTitle')
        this.background.setOrigin(0, 1);
        this.backgroundTween = this.tweens.add({
            targets: this.background,
            x: -this.background.displayWidth,
            ease: Phaser.Math.Easing.Linear,
            // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
            duration: (this.background.displayWidth / TITLE_SCENE.backgroundSpeed) * 1000,
            onComplete: () => {
                console.log('Done!');
            },
        });

        // Add the logo image.
        this.logo = this.add.image(width / 2, TITLE_SCENE.logo.offset.y, 'logo');
        this.logo.setScale(0.4, 0.4);

        this.gameButton = new Button(
            this,
            width / 2,
            height / 2 + TITLE_SCENE.gameButton.offset.y,
            'greenbuttonup',
            'greenbuttondown',
            'Play',
            SCENE_KEYS.game);

        this.backButton = new Button(
            this,
            width / 2,
            height / 2 + TITLE_SCENE.backButton.offset.y,
            'greenbuttonup',
            'greenbuttondown',
            'Quit',
            SCENE_KEYS.preloader);

        this.optionsButton = new Button(
            this,
            width / 2 + TITLE_SCENE.optionsButton.offset.x,
            height / 2,
            'greenbuttonup',
            'greenbuttondown',
            'Options',
            SCENE_KEYS.options);

        this.creditsButton = new Button(
            this,
            width / 2 + TITLE_SCENE.creditsButton.offset.x,
            height / 2,
            'greenbuttonup',
            'greenbuttondown',
            'Credits',
            SCENE_KEYS.credits);
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.background.setY(height);
        this.logo.setPosition(width / 2, TITLE_SCENE.logo.offset.y);
        this.gameButton.setPosition(width / 2, height / 2 + TITLE_SCENE.gameButton.offset.y);
        this.backButton.setPosition(width / 2, height / 2 + TITLE_SCENE.backButton.offset.y);
        this.optionsButton.setPosition(width / 2 + TITLE_SCENE.optionsButton.offset.x, height / 2,);
        this.creditsButton.setPosition(width / 2 + TITLE_SCENE.creditsButton.offset.x, height / 2);
    }
};
