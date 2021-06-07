import { COLORS, FONT } from '../constants/style.js';

export default class Button extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);

        this.config = config;

        this.scene = config.scene;
        this.setX(config.x);
        this.setY(config.y);
        
        // If a certain key is not set in the config, it will be
        // "undefined".
        this.targetScene = config.targetScene;
        this.sceneData = config.sceneData;
        // An optional function to execute when the button is pressed.
        this.targetFunction = config.targetFunction;

        this.font = FONT.main;

        this.button = this.scene.add.sprite(0, 0, config.imageUp, config.frameUp).setInteractive();
        if (config.text) {
            this.text = this.scene.add.text(0, 0, config.text, { font: '32px ' + this.font, fill: COLORS.text });
            Phaser.Display.Align.In.Center(this.text, this.button);

            // Add a slight offset to the text, so it looks like it is
            // actually in the center.
            this.text.setY(this.text.y + FONT[this.font].offset.y);
        }

        if (config.scaleUp) {
            this.setScale(config.scaleUp);
        } else {
            this.setScale(1.5);
        }

        this.add(this.button);

        if (config.text) {
            this.add(this.text);
        }

        this.button.on('pointerdown', () => {
            // If there is a target scene set, start that scene. It
            // doesn't matter of any sceneData was actually passed in
            // or not. If this.sceneData is "undefined", it won't cause
            // any errors.
            if (this.targetScene) {
                this.scene.scene.start(this.targetScene, this.sceneData);
            }
            // Execute this button's target function if it has one.
            if (this.targetFunction) {
                this.targetFunction();
            }
        });

        this.button.on('pointerover', () => {
            // It doesn't matter if no frame was passed into the config.
            this.button.setTexture(this.config.imageDown, this.config.frameDown);
            if (this.config.scaleDown) {
                this.setScale(this.config.scaleDown);
            }
        });

        this.button.on('pointerout', () => {
            // It doesn't matter if no frame was passed into the config.
            this.button.setTexture(this.config.imageUp, this.config.frameUp);
            if (this.config.scaleUp) {
                this.setScale(this.config.scaleUp);
            }
        });

        this.scene.add.existing(this);
    }
}