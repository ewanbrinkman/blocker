import Button from '../objects/Button.js';
import { SCENE_KEYS, COLORS, TITLE_SCENE } from '../constants.js';

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.title);
    }

    addBackground() {
        console.log('Adding background.');

        // Get the screen size of the game.
        const height = this.cameras.main.height;
        
        let startX, tweenDuration, beforeBackground;

        if (this.backgrounds.length === 0) {
            startX = 0;
        } else {
            beforeBackground = this.backgrounds[this.backgrounds.length - 1];
            startX = beforeBackground.getTopRight().x - (0.0336 * TITLE_SCENE.backgroundSpeed);
        }

        let backgroundNumber = Phaser.Math.Between(1, 2).toString();
        let background = this.add.image(startX, height, 'backgroundTitle' + backgroundNumber);
        background.setOrigin(0, 1);
        // Place the background image behind everything else.
        background.setDepth(-1);

        if (this.backgrounds.length === 0) {
            tweenDuration = (background.displayWidth / TITLE_SCENE.backgroundSpeed) * 1000;
        } else {
            tweenDuration = ((background.displayWidth + beforeBackground.getTopRight().x) / TITLE_SCENE.backgroundSpeed) * 1000;

            // Make sure the background image is connected correctly after a bit of time.
            // this.time.delayedCall(200, () => {
            //     background.setX(beforeBackground.getTopRight().x);
            //     console.log('delayed', background.x, beforeBackground.getTopRight().x);
            // }, [], this);

            // this.time.delayedCall(300, () => {
            //     console.log('delayed 2', background.x, beforeBackground.getTopRight().x);
            // }, [], this);
        }

        let backgroundTween = this.tweens.add({
            targets: background,
            x: -background.displayWidth,
            ease: Phaser.Math.Easing.Linear,
            // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
            duration: tweenDuration,
            // speed: TITLE_SCENE.backgroundSpeed,
            // completeDelay: 1000,
            onComplete: () => {
                this.backgrounds.shift();
                background.destroy();

                // Add another background to the scrolling backgrounds.
                this.addBackground();
            },
        });

        // if (this.backgrounds.length !== 0) {
        //     this.time.delayedCall(200, () => {
        //         console.log(backgroundTween.elapsed);
        //         backgroundTween.elapsed += (background.getTopLeft().x - beforeBackground.getTopRight().x) / TITLE_SCENE.backgroundSpeed;
        //         console.log(backgroundTween.elapsed);
        //     }, [], this);
        // }

        this.backgrounds.push(background);



        // let beforeBackground = this.backgrounds[0];

        // let newBackground = this.add.image(beforeBackground.displayWidth, height, 'backgroundTitle2');
        // newBackground.setOrigin(0, 1);

        // let tweenDuration = ((newBackground.displayWidth + beforeBackground.displayWidth) / TITLE_SCENE.backgroundSpeed) * 1000;
        // this.tweens.add({
        //     targets: newBackground,
        //     x: -newBackground.displayWidth,
        //     ease: Phaser.Math.Easing.Linear,
        //     // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
        //     duration: tweenDuration,
        //     onComplete: () => {
        //         this.backgrounds.shift();
        //         newBackground.destroy();

        //         // Add another background to the scrolling backgrounds.
        //         this.addBackground();
        //     },
        // });
        // this.backgrounds.push(newBackground);
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
        // this.background = this.add.image(width / 2, height, 'backgroundTitle');
        // this.background.setOrigin(0.5, 1);

        // The background image of world tiles.
        // this.backgrounds = []
        // let startBackground = this.add.image(0, height, 'backgroundTitle1');
        // startBackground.setOrigin(0, 1);

        // let tweenDuration = (startBackground.displayWidth / TITLE_SCENE.backgroundSpeed) * 1000;
        // this.tweens.add({
        //     targets: startBackground,
        //     x: -startBackground.displayWidth,
        //     ease: Phaser.Math.Easing.Linear,
        //     // Time = distance / speed. Multiply by 1000 to go from seconds to milliseconds.
        //     duration: tweenDuration,
        //     onComplete: () => {
        //         // Remove the finished background.
        //         this.backgrounds.shift();
        //         startBackground.destroy();

        //         // Add another background to the scrolling backgrounds.
        //         this.addBackground();
        //     },
        // });
        // this.backgrounds.push(startBackground);

        // Add another background to the scrolling backgrounds.
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

        this.keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    }

    update(time, delta) {
        if (Phaser.Input.Keyboard.JustDown(this.keyB)) {
            console.log('Delta:', delta);
        }
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
