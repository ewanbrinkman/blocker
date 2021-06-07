import { COLORS, FONT } from '../constants/style.js';

export default class Button extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);

        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        
        // If a certain key is not set in the config, it will be
        // "undefined".
        this.targetScene = config.targetScene;
        this.sceneData = config.sceneData;
        // An optional function to execute when the button is pressed.
        this.targetFunction = config.targetFunction;

        this.font = FONT.main;

        this.button = this.scene.add.sprite(0, 0, config.imageUp).setInteractive();
        this.text = this.scene.add.text(0, 0, config.text, { font: '32px ' + this.font, fill: COLORS.text });
        Phaser.Display.Align.In.Center(this.text, this.button);

        // Add a slight offset to the text, so it looks like it is
        // actually in the center.
        this.text.setY(this.text.y + FONT[this.font].offset.y);

        this.setScale(1.5);

        this.add(this.button);
        this.add(this.text);

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
            this.button.setTexture(config.imageDown);
        });

        this.button.on('pointerout', () => {
            this.button.setTexture(config.imageUp);
        });

        this.scene.add.existing(this);
    }
}