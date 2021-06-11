import Button from '../objects/Button.js';
import { COLORS, FONT, CHECKBOX } from '../constants/style.js';

export default class Checkbox extends Phaser.GameObjects.Container {
    constructor(config) {
        super(config.scene);

        this.scene = config.scene;

        this.setX(config.x);
        this.setY(config.y);

        this.font = FONT.main

        this.checkbox = new Button({
            scene: this.scene,
            x: 0,
            y: 0,
            silentOver: true, // Don't make a sound when the mouse goes over the button.
            imageUnselected: 'emptyBox',
            imageSelected: 'greenboxCheckmark',
            selectionFunction: (updateTargetVariable) => {
                // The function is called when the selection button is
                // pressed. The returned value is if the button is
                // currently selected.
                if (this.scene.registry.gamemode === 'normal') {
                    if (updateTargetVariable) {
                        this.scene.registry.gamemode = 'speedrun';
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (updateTargetVariable) {
                        this.scene.registry.gamemode = 'normal';
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        });

        this.text = this.scene.add.text(
            this.checkbox.button.displayWidth + CHECKBOX.text.offset.x,
            this.checkbox.y + FONT[this.font].offset.y,
            config.text,
            { font: '48px ' + this.font, fill: COLORS.text});
        this.text.setOrigin(0, 0.5);

        this.add(this.checkbox);
        this.add(this.text);
        this.scene.add.existing(this);
        
        this.bounds = this.getBounds();

        if (config.center) {
            this.setCenter(config.x, config.y);
        }
    }

    setCenter(x, y) {
        this.setX(x + this.checkbox.button.displayWidth / 2 + 10 - this.bounds.width / 2);
        this.setY(y);
    }
}
