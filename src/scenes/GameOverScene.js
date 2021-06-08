import { COLORS, FONT } from '../constants/style.js';
import { SCENE_KEYS } from '../constants/scenes.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.gameover);
    }

    init(data) {
        this.data = data;
        // Get the results of the game.
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

        // Add text to display levels completed.
        this.resultsText = this.add.text(
            width / 2,
            height / 2,
            'Levels Completed:',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.resultsText.setOrigin(0.5, 0.5);

        // Add text to display total time.
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.resultsText.setPosition(width / 2, height / 2);
    }
}
