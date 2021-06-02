import { SCENE_KEYS, FONT, COLORS, CREDITS_SCENE } from '../constants.js';

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.credits);
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
        // The background image of world tiles.
        this.background = this.add.image(width / 2, height, 'backgroundTitle');
        this.background.setOrigin(0.5, 1);
        // Add the logo image.
        // this.logo = this.add.image(width / 2, TITLE_SCENE.logo.offset.y, 'logo');
        // this.logo.setScale(0.4, 0.4);

        this.creditsText = this.add.text(0, 0, 'Credits', { font: '64px ' + this.font, fill: COLORS.text });
        this.madeByText = this.add.text(0, 0, 'Created By: Ewan Brinkman', { font: '48px ' + this.font, fill: COLORS.text });
        
        this.zone = this.add.zone(width / 2, height / 2, width, height);

        Phaser.Display.Align.In.Center(
            this.creditsText,
            this.zone
        );

        Phaser.Display.Align.In.Center(
            this.madeByText,
            this.zone
        );

        this.madeByText.setY(height);

        this.creditsTextTween = this.tweens.add({
            targets: this.creditsText,
            y: -this.creditsText.displayHeight,
            ease: Phaser.Math.Easing.Linear,
            // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
            duration: ((height / 2 + 100) / CREDITS_SCENE.textSpeed) * 1000,
            delay: CREDITS_SCENE.startDelay,
        });

        console.log

        this.madeByTextTween = this.tweens.add({
            targets: this.madeByText,
            y: -this.madeByText.displayHeight,
            ease: Phaser.Math.Easing.Linear,
            // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
            duration: ((height + 100) / CREDITS_SCENE.textSpeed) * 1000,
            delay: CREDITS_SCENE.startDelay,
            onComplete: () => {
                this.scene.start(SCENE_KEYS.title);
            }
        });
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
    }
};
