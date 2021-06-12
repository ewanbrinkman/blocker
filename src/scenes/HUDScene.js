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

        // Add text to display time information.
        this.timeText = this.add.text(
            HUD_SCENE.timeText.offset.x,
            HUD_SCENE.timeText.offset.y + FONT[this.font].offset.y,
            'Time:',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.timeText.setOrigin(0, 0.5);
    }

    update() {
        // Round times (in seconds) to 1 decimal place.
        if (this.registry.gamemode === 'normal') {
            let remainingSeconds = this.gameScene.endTimer.getRemainingSeconds();
            this.timeText.text = 'Time Left: ' + remainingSeconds.toFixed(LEVELS.normal.timeDigitsGame);
        } else {
            let currentTime = (this.time.now - this.registry.game.speedrun.startTime) / 1000;
            this.timeText.text = 'Time: ' + currentTime.toFixed(LEVELS.normal.timeDigitsGame);
        }
    }

    resize() {
        this.timeText.setPosition(
            HUD_SCENE.timeText.offset.x,
            HUD_SCENE.timeText.offset.y + FONT[this.font].offset.y
        );  
    }
}
