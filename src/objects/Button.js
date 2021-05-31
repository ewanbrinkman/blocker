import { FONT } from "../constants.js";

export default class Button extends Phaser.GameObjects.Container {
    constructor(scene, x, y, imageUp, imageDown, text, targetScene) {
        super(scene);

        this.scene = scene;
        this.x = x;
        this.y = y;

        this.font = FONT.main;

        this.button = this.scene.add.sprite(0, 0, imageUp).setInteractive();
        this.text = this.scene.add.text(0, 0, text, { font: '32px ' + this.font, fill: '#bc8142' });
        Phaser.Display.Align.In.Center(this.text, this.button);

        // Add a slight offset to the text, so it looks like it is
        // actually in the center.
        this.text.setY(this.text.y + FONT[this.font].offset.y);

        this.setScale(1.5);

        this.add(this.button);
        this.add(this.text);

        this.button.on('pointerdown', () => {
            this.scene.scene.start(targetScene);
        });

        this.button.on('pointerover', () => {
            this.button.setTexture(imageDown);
        });

        this.button.on('pointerout', () => {
            this.button.setTexture(imageUp);
        });

        this.scene.add.existing(this);
    }
}