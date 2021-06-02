import Button from '../objects/Button.js';
import { SCENE_KEYS, COLORS, TITLE_SCENE } from '../constants.js';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.title);
    }

    addBackground() {
        // Get the screen size of the game.
        const height = this.cameras.main.height;
        
        let startX, tweenDuration, beforeBackground;

        // Get the starting position of the background image.
        if (this.backgrounds.length === 0) {
            startX = 0;
        } else {
            beforeBackground = this.backgrounds[this.backgrounds.length - 1];
            // Multiply by the chosen constant decimal in order to stop
            // gaps from appearing between the background images.
            startX = beforeBackground.getTopRight().x - (0.0336 * TITLE_SCENE.backgroundSpeed);
        }

        let background = this.add.image(startX, height, Phaser.Math.RND.pick(this.registry.titleBackgrounds));
        background.setOrigin(0, 1);
        // Place the background image behind everything else.
        background.setDepth(-1);

        if (this.backgrounds.length === 0) {
            tweenDuration = (background.displayWidth / TITLE_SCENE.backgroundSpeed) * 1000;
        } else {
            tweenDuration = ((background.displayWidth + beforeBackground.getTopRight().x) / TITLE_SCENE.backgroundSpeed) * 1000;
        }

        this.tweens.add({
            targets: background,
            x: -background.displayWidth,
            ease: Phaser.Math.Easing.Linear,
            // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
            duration: tweenDuration,
            onComplete: () => {
                this.backgrounds.shift();
                background.destroy();
                // Add another background to the scrolling backgrounds.
                this.addBackground();
            },
        });

        this.backgrounds.push(background);
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

        // Add backgrounds to the scrolling backgrounds.
        this.backgrounds = []
        this.addBackground();
        this.addBackground();

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
            SCENE_KEYS.game,
            {levelKey: 'level1'});

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
        this.backgrounds.forEach(background => {
            background.setY(height);
        }) 
        // this.background.setY(height);
        this.logo.setPosition(width / 2, TITLE_SCENE.logo.offset.y);
        this.gameButton.setPosition(width / 2, height / 2 + TITLE_SCENE.gameButton.offset.y);
        this.backButton.setPosition(width / 2, height / 2 + TITLE_SCENE.backButton.offset.y);
        this.optionsButton.setPosition(width / 2 + TITLE_SCENE.optionsButton.offset.x, height / 2,);
        this.creditsButton.setPosition(width / 2 + TITLE_SCENE.creditsButton.offset.x, height / 2);
    }
};
