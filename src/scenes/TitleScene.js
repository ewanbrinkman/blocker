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
        this.background = this.add.image(width / 2, height, 'backgroundTitle');
        this.background.setOrigin(0.5, 1);
        // Add the logo image.
        this.logo = this.add.image(width / 2, TITLE_SCENE.logo.offset.y, 'logo');
        this.logo.setScale(0.4, 0.4);

        // Add the selected player image. Also find the offset to place the player directly on the ground.
        let [ x, y ] = getSquareCenter(
            width / 2 - 350, height - 245, this.registry.player.playerType, BASE_PLAYER.scale, true);
        this.playerImage = this.add.sprite(x, y, 'players', this.registry.player.playerType);
        this.playerImage.setScale(BASE_PLAYER.scale);

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
        this.background.setPosition(width / 2, height);
        this.logo.setPosition(width / 2, TITLE_SCENE.logo.offset.y);
        this.gameButton.setPosition(width / 2, height / 2 + TITLE_SCENE.gameButton.offset.y);
        this.backButton.setPosition(width / 2, height / 2 + TITLE_SCENE.backButton.offset.y);
        this.optionsButton.setPosition(width / 2 + TITLE_SCENE.optionsButton.offset.x, height / 2,);
        this.creditsButton.setPosition(width / 2 + TITLE_SCENE.creditsButton.offset.x, height / 2);
        let [ x, y ] = getSquareCenter(
            width / 2 - 350, height - 245, BASE_PLAYER.playerType, BASE_PLAYER.scale, true);
        this.playerImage.setPosition(x, y);
    }
};
