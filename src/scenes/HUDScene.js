import { COLORS, FONT } from '../constants/style.js';
import { SCENE_KEYS, HUD_SCENE } from '../constants/scenes.js';
import { LEVELS } from '../constants/levels.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.hud);
    }

    init(data) {
        this.data = data;
        this.gameScene = data.gameScene;
    }

    create() {
        // Reposition objects when the screen is resized.
        this.scale.on('resize', this.resize, this);

        // Remove the resize event for this scene when the scene stops.
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.resize);
        });

        this.font = FONT.main;

        // Add text to display loading information.
        this.timeLeftText = this.add.text(
            HUD_SCENE.timeLeftText.offset.x,
            HUD_SCENE.timeLeftText.offset.y + FONT[this.font].offset.y,
            'Time Left:',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.timeLeftText.setOrigin(0, 0.5);

        // Add text to display loading information.
        this.timeElapsedText = this.add.text(
            HUD_SCENE.timeElapsedText.offset.x,
            HUD_SCENE.timeElapsedText.offset.y + FONT[this.font].offset.y,
            'Time Elapsed:',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.timeElapsedText.setOrigin(0, 0.5);
    }

    update() {
        // Round times (in seconds) to 1 decimal place.
        let remainingSeconds = this.gameScene.endTimer.getRemainingSeconds().toFixed(LEVELS.normal.timeDigitsGame);
        this.timeLeftText.text = 'Time Left: ' + remainingSeconds;

        let elapsedSeconds = this.gameScene.endTimer.getElapsedSeconds().toFixed(LEVELS.normal.timeDigitsGame);
        this.timeElapsedText.text = 'Time Elapsed : ' + elapsedSeconds;
    }

    resize() {
        this.timeLeftText.setPosition(
            HUD_SCENE.timeLeftText.offset.x,
            HUD_SCENE.timeLeftText.offset.y + FONT[this.font].offset.y
        );
        this.timeElapsedText.setPosition(
            HUD_SCENE.timeElapsedText.offset.x,
            HUD_SCENE.timeElapsedText.offset.y + FONT[this.font].offset.y
        );
    }
}
