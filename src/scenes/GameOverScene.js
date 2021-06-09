import Button from '../objects/Button.js';
import { COLORS, FONT } from '../constants/style.js';
import { LEVELS } from '../constants/levels.js';
import { SCENE_KEYS, GAME_OVER_SCENE } from '../constants/scenes.js';

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

        // Background color.
        this.cameras.main.setBackgroundColor(COLORS.background);
        // The background image of world tiles.
        this.background = this.add.image(width / 2, height, 'backgroundGameOver');
        this.background.setOrigin(0.5, 1);

        this.titleText = this.add.text(
            width / 2,
            50 + FONT[this.font].offset.y,
            'Game Results',
            { font: '72px ' + this.font, fill: COLORS.text});
        this.titleText.setOrigin(0.5, 0.5);

        // Add text to display levels completed.
        this.levelsCompletedText = this.add.text(
            width / 2,
            height / 2 - GAME_OVER_SCENE.resultsTextSpacing + FONT[this.font].offset.y,
            'Levels Completed: ' + this.registry.game.completedLevelsCount,
            { font: '48px ' + this.font, fill: COLORS.text});
        this.levelsCompletedText.setOrigin(0.5, 0.5);

        // Add text to display total time.
        // Add text to display levels completed.
        this.elapsedTimeText = this.add.text(
            width / 2,
            height / 2 + FONT[this.font].offset.y,
            'Total Time: ' + this.registry.game.totalTimeElapsed + ' seconds',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.elapsedTimeText.setOrigin(0.5, 0.5);

        // Add text to display total time.
        // Add text to display levels completed.
        this.timePerLevelText = this.add.text(
            width / 2,
            height / 2 + GAME_OVER_SCENE.resultsTextSpacing + FONT[this.font].offset.y,
            'Average Time Per Level: ' + (this.registry.game.totalTimeElapsed / this.registry.game.completedLevelsCount).toFixed(LEVELS.normal.timeDigitsResults) + ' seconds',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.timePerLevelText.setOrigin(0.5, 0.5);

        this.backButton = new Button({
            scene: this,
            x: width / 2,
            y: height + GAME_OVER_SCENE.backButton.offset.y,
            imageUp: 'greenButtonUp',
            imageDown: 'greenButtonDown',
            text: 'Return To Title',
            targetScene: SCENE_KEYS.title,
        });
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.background.setPosition(width / 2, height);
        this.titleText.setPosition(width / 2, 50 + FONT[this.font].offset.y);
        this.levelsCompletedText.setPosition(width / 2, height / 2 - GAME_OVER_SCENE.resultsTextSpacing + FONT[this.font].offset.y);
        this.elapsedTimeText.setPosition(width / 2, height / 2 + FONT[this.font].offset.y);
        this.timePerLevelText.setPosition(width / 2, height / 2 + GAME_OVER_SCENE.resultsTextSpacing + FONT[this.font].offset.y);
        this.backButton.setPosition(width / 2, height + GAME_OVER_SCENE.backButton.offset.y);
    }
}
