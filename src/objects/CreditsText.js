import { COLORS, FONT } from '../constants/style.js';
import { CREDITS_TEXT_SIZES } from '../constants/scenes.js'

export default class CreditsText {
    constructor(scene, textType, text) {
        this.scene = scene;

        this.font = FONT.main;
        this.color = COLORS.text;

        this.textType = textType;

        this.createText(text, CREDITS_TEXT_SIZES[textType]);
    }

    createText(text, size) {
        this.text = this.scene.add.text(0, 0, text, { font: size + ' ' + this.font, fill: this.color });
        this.text.setOrigin(0.5, 0.5);
    }
}
