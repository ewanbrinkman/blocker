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
        this.background = this.add.image(width / 2, height, 'backgroundCredits');
        this.background.setOrigin(0.5, 1);
        // Add the logo image.
        // this.logo = this.add.image(width / 2, TITLE_SCENE.logo.offset.y, 'logo');
        // this.logo.setScale(0.4, 0.4);

        this.introCreditsText = this.add.text(0, 0, 'Credits', { font: '72px ' + this.font, fill: COLORS.text });
        this.mainCreditsTextTitle = this.add.text(0, 0, 'Creator', { font: '64px ' + this.font, fill: COLORS.text });
        this.mainCreditsTextBody = this.add.text(0, 0, 'Ewan Brinkman', { font: '48px ' + this.font, fill: COLORS.text });

        this.assetsCreditsTextTitle = this.add.text(0, 0, 'Assets', { font: '64px ' + this.font, fill: COLORS.text });
        let assetsText = 'Tile Images: Kenney (https://www.kenney.nl/)'
        assetsText += '\nPlayer Images: Kenney (https://www.kenney.nl/)'
        assetsText += '\nUser Interface Images: Kenney (https://www.kenney.nl/)'
        assetsText += '\nFont: Kenney (https://www.kenney.nl/)'
        this.assetsCreditsTextBody = this.add.text(0, 0, assetsText, { font: '48px ' + this.font, fill: COLORS.text });

        this.creditsTexts = [
            this.introCreditsText,
            this.mainCreditsTextTitle,
            this.mainCreditsTextBody,
            this.assetsCreditsTextTitle,
            this.assetsCreditsTextBody]
        
        this.zone = this.add.zone(width / 2, height / 2, width, height);

        this.creditsTexts.forEach(creditsText => {
            Phaser.Display.Align.In.Center(
                creditsText,
                this.zone
            );
        })

        this.mainCreditsTextBody.setY(height);

        this.tweens.add({
            targets: this.introCreditsText,
            y: -this.introCreditsText.displayHeight,
            ease: Phaser.Math.Easing.Linear,
            // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
            duration: ((height / 2 + 100) / CREDITS_SCENE.textSpeed) * 1000,
            delay: CREDITS_SCENE.startDelay,
        });

        this.tweens.add({
            targets: this.mainCreditsTextBody,
            y: -this.mainCreditsTextBody.displayHeight,
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
        this.background.setPosition(width / 2, height);
    }
};
