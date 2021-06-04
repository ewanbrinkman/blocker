import CreditsText from '../objects/CreditsText.js';
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
        // The background images made of tiles.
        this.backgroundLeft = this.add.image(0, height, 'backgroundCredits');
        this.backgroundLeft.setOrigin(0, 1);
        this.backgroundRight = this.add.image(width, height, 'backgroundCredits');
        this.backgroundRight.setOrigin(1, 1);
        // Add the logo image.
        // this.logo = this.add.image(width / 2, TITLE_SCENE.logo.offset.y, 'logo');
        // this.logo.setScale(0.4, 0.4);

        // Create the credits text.
        this.credits = [];
        // Title.
        this.addCreditsText('title', 'Credits');
        // Creator.
        this.addCreditsText('header', 'Creator');
        this.addCreditsText('body', 'Ewan Brinkman');
        // Assets.
        this.addCreditsText('header', 'Assets');
        this.addCreditsText('body', 'Tile Images: Kenney (https://www.kenney.nl/)');
        this.addCreditsText('body', 'Player Images: Kenney (https://www.kenney.nl/)');
        this.addCreditsText('body', 'User Interface Images: Kenney (https://www.kenney.nl/)');
        this.addCreditsText('body', 'Font: Kenney (https://www.kenney.nl/)');

        // Keep track of the current y offset to keep adding text
        // further and further down.
        this.currentOffsetY = 0;

        this.creditsTweens = [];

        this.credits.forEach((creditsText, index, array) => {
            // Move the text to the center of the screen.
            creditsText.text.setX(width / 2);

            // Add the spacing for this text type.
            if (creditsText.textType === 'title') {
                this.currentOffsetY += height / 2;
            } else {
                // Make the text spacing go all the way to the top of
                // the text.
                this.currentOffsetY += creditsText.text.displayHeight / 2;

                // If the previous item was some title text, it would
                // have set the offset to off the screen, so no extra
                // offset needs to be added. Only add extra offset if
                // the previous text type was a title.
                if (array[index - 1].textType !== 'title') {
                    this.currentOffsetY += CREDITS_SCENE.spacingBefore[creditsText.textType]
                }
            }
            // Set the correct position of the text.
            creditsText.text.setY(this.currentOffsetY);

            // Add the scroll animation for this text.
            this.creditsTweens.push(this.tweens.add({
                targets: creditsText.text,
                y: -creditsText.text.displayHeight / 2,
                ease: Phaser.Math.Easing.Linear,
                // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
                duration: (this.currentOffsetY / CREDITS_SCENE.textSpeed) * 1000,
                delay: CREDITS_SCENE.startDelay,
                onComplete: () => {
                    // If the last bit of text left the screen, return
                    // to the title screen.
                    if (index === array.length - 1) {
                        this.scene.start(SCENE_KEYS.title);
                    }
                }
            }));

            if (creditsText.textType === 'title') {
                this.currentOffsetY += height / 2;
            } else {
                // Make the next text offset start from the bottom of this text.
                this.currentOffsetY += creditsText.text.displayHeight / 2
            }
        });
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.backgroundLeft.setPosition(0, height);
        this.backgroundRight.setPosition(width, height);

        this.creditsTweens.forEach((tween) => {
            tween.stop();
        });
        this.creditsTweens = [];

        this.credits.forEach((creditsText, index, array) => {
            // Move the text to the new center of the screen.
            creditsText.text.setX(width / 2);

            // Redo the scroll animation for this text with the new position.
            this.creditsTweens.push(this.tweens.add({
                targets: creditsText.text,
                y: -creditsText.text.displayHeight / 2,
                ease: Phaser.Math.Easing.Linear,
                // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
                duration: (creditsText.text.y / CREDITS_SCENE.textSpeed) * 1000,
                onComplete: () => {
                    // If the last bit of text left the screen, return
                    // to the title screen.
                    if (index === array.length - 1) {
                        this.scene.start(SCENE_KEYS.title);
                    }
                }
            }));
        });
    }

    addCreditsText(textType, text) {
        this.credits.push(new CreditsText(this, textType, text));
    }
};
