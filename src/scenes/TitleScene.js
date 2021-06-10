import Button from '../objects/Button.js';
import Checkbox from '../objects/Checkbox.js';
import { COLORS, FONT } from '../constants/style.js';
import { SCENE_KEYS, TITLE_SCENE } from '../constants/scenes.js';

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

        this.font = FONT.main;

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

        this.splashText = this.add.text(
            this.logo.getBottomRight().x + TITLE_SCENE.splashText.offset.x,
            this.logo.getBottomRight().y + TITLE_SCENE.splashText.offset.y + FONT[this.font].offset.y,
            this.registry.splash,
            { font: '36px ' + this.font, fill: COLORS.text});
        this.splashText.setOrigin(0.5, 0.5);
        this.splashText.setAngle(-15);

        this.tweens.add({
            targets: this.splashText,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.In,
            yoyo: true,
            loop: -1,
            scale: 1.1
        });

        this.gameButton = new Button({
            scene: this,
            x: width / 2,
            y: height / 2,
            imageUp: 'greenButtonUp',
            imageDown: 'greenButtonDown',
            text: 'Play',
            targetScene: SCENE_KEYS.game
        });

        this.quitButton = new Button({
            scene: this,
            x: width / 2,
            y: height + TITLE_SCENE.quitButton.offset.y,
            imageUp: 'greenButtonUp',
            imageDown: 'greenButtonDown',
            text: 'Quit',
            targetScene: SCENE_KEYS.preloader
        });

        this.charactersButton = new Button({
            scene: this,
            x: width / 2 + TITLE_SCENE.charactersButton.offset.x,
            y: height / 2,
            imageUp: 'greenButtonUp',
            imageDown: 'greenButtonDown',
            text: 'Characters',
            targetScene: SCENE_KEYS.characters
        });

        this.creditsButton = new Button({
            scene: this,
            x: width / 2 + TITLE_SCENE.creditsButton.offset.x,
            y: height / 2,
            imageUp: 'greenButtonUp',
            imageDown: 'greenButtonDown',
            text: 'Credits',
            targetScene: SCENE_KEYS.credits
        });

        this.gamemodeCheckbox = new Checkbox(this, width / 2, height / 2, 'Speedrun Mode');
        let s = this.gamemodeCheckbox.getBounds();
        let r = this.add.rectangle(s.x, s.y, s.width, s.height, 0xffff00, 0.3);
        r.setOrigin(0, 0);
        let c = this.add.rectangle(width / 2, height / 2, 50, 50, 0xff00ff, 0.5);
        c.setOrigin(0.5, 0.5);
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.backgrounds.forEach((background) => {
            background.setY(height);
        });
        // this.background.setY(height);
        this.logo.setPosition(width / 2, TITLE_SCENE.logo.offset.y);
        this.splashText.setPosition(
            this.logo.getBottomRight().x + TITLE_SCENE.splashText.offset.x,
            this.logo.getBottomRight().y + TITLE_SCENE.splashText.offset.y + FONT[this.font].offset.y
        );
        this.gamemodeCheckbox.setPosition(width / 2, height / 2);
        // this.gamemodeButton.setPosition(width / 2, height / 2 + TITLE_SCENE.gamemodeButton.offset.y);
        // this.gamemodeText.setPosition(
        //     this.gamemodeButton.x + this.gamemodeButton.button.width + TITLE_SCENE.gamemodeText.offset.x,
        //     this.gamemodeButton.y + FONT[this.font].offset.y
        // );
        this.gameButton.setPosition(width / 2, height / 2);
        this.quitButton.setPosition(width / 2, height + TITLE_SCENE.quitButton.offset.y);
        this.charactersButton.setPosition(width / 2 + TITLE_SCENE.charactersButton.offset.x, height / 2,);
        this.creditsButton.setPosition(width / 2 + TITLE_SCENE.creditsButton.offset.x, height / 2);
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
};
