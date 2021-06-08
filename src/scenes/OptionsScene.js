import Button from '../objects/Button.js';
import { getSquareCenter } from '../utils.js';
import { PLAYER_TYPES, BASE_PLAYER } from '../constants/player.js';
import { SCENE_KEYS, OPTIONS_SCENE } from '../constants/scenes.js';
import { COLORS, FONT } from '../constants/style.js';

export default class OptionsScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.options);
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
        this.background = this.add.image(width / 2, height, 'backgroundOptions');
        this.background.setOrigin(0.5, 1);

        this.titleText = this.add.text(
            width / 2,
            OPTIONS_SCENE.titleText.offset.y + FONT[this.font].offset.y,
            'Choose Your Character',
            { font: '72px ' + this.font, fill: COLORS.text});
        this.titleText.setOrigin(0.5, 0.5);

        this.backButton = new Button({
            scene: this,
            x: width / 2,
            y: height + OPTIONS_SCENE.backButton.offset.y,
            imageUp: 'greenButtonUp',
            imageDown: 'greenButtonDown',
            text: 'Back',
            targetScene: SCENE_KEYS.title,
        });

        this.gamemodeButton = new Button({
            scene: this,
            x: OPTIONS_SCENE.gamemodeButton.offset.x,
            y: height + OPTIONS_SCENE.gamemodeButton.offset.y,
            imageUnselected: 'emptyBox',
            imageSelected: 'greenboxCheckmark',
            selectionFunction: (updateTargetVariable) => {
                // The function is called when the selection button is
                // pressed. The returned value is if the button is
                // currently selected.
                if (this.registry.gamemode === 'normal') {
                    if (updateTargetVariable) {
                        this.registry.gamemode = 'speedrun';
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (updateTargetVariable) {
                        this.registry.gamemode = 'normal';
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        });

        this.gamemodeText = this.add.text(
            this.gamemodeButton.x + this.gamemodeButton.button.width + OPTIONS_SCENE.gamemodeText.offset.x,
            this.gamemodeButton.y + FONT[this.font].offset.y,
            'Speedrun Mode',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.gamemodeText.setOrigin(0, 0.5);

        // Store all of the player buttons. The key will be the player
        // type and the value will be the button.
        this.playerButtons = {}

        // Add all of the player selection buttons.
        PLAYER_TYPES.forEach((playerType, index) => {
            // There will be 5 images per row. Therefore, there will be
            // 2 rows, since there are 10 images (the player type
            // images).
            let row = Math.floor(index / 5);
            // The x offset will start at 10% of the screen, and
            // continue in steps of 20%. After the 5th one, a new row
            // will start. To get the x offset on this new row,
            // subtract 1 * the number of rows down, which is just the
            // row variable.
            let position = {
                x: (0.1 + (index * 0.2) - (row)) * width,
                y: OPTIONS_SCENE.playerButton.offsetStart.y + OPTIONS_SCENE.playerButton.offsetBetween.y * row
            }

            let [ positionX, positionY ] = getSquareCenter(
                position.x, position.y, playerType, BASE_PLAYER.scale * 1.25, false);
            
            let imageUp;
            if (playerType === this.registry.player.playerType) {
                imageUp = 'selectedPlayers';
            } else {
                imageUp = 'players';
            }

            this.playerButtons[playerType] = new Button({
                scene: this,
                x: positionX,
                y: positionY,
                imageUp: imageUp,
                frameUp: playerType,
                imageDown: 'selectedPlayers',
                frameDown: playerType,
                scaleUp: BASE_PLAYER.scale * 1.25,
                scaleDown: BASE_PLAYER.scale * 1.35,
                targetScene: SCENE_KEYS.title,
                targetFunction: () => {
                    this.registry.player.playerType = playerType;
                }
            });
        });
    }

    resize() {
        // Get the screen size of the game.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.background.setPosition(width / 2, height);
        this.backButton.setPosition(width / 2, height + OPTIONS_SCENE.backButton.offset.y);
        this.gamemodeButton.setPosition(OPTIONS_SCENE.gamemodeButton.offset.x, height + OPTIONS_SCENE.gamemodeButton.offset.y);
        this.gamemodeText.setPosition(
            this.gamemodeButton.x + this.gamemodeButton.button.width + OPTIONS_SCENE.gamemodeText.offset.x,
            this.gamemodeButton.y + FONT[this.font].offset.y
        )
        this.titleText.setPosition(width / 2, OPTIONS_SCENE.titleText.offset.y + FONT[this.font].offset.y);

        // Add all of the player selection buttons.
        PLAYER_TYPES.forEach((playerType, index) => {
            // There will be 5 images per row. Therefore, there will be
            // 2 rows, since there are 10 images (the player type
            // images).
            let row = Math.floor(index / 5);
            // The x offset will start at 10% of the screen, and
            // continue in steps of 20%. After the 5th one, a new row
            // will start. To get the x offset on this new row,
            // subtract 1 * the number of rows down, which is just the
            // row variable.
            let position = {
                x: (0.1 + (index * 0.2) - (row)) * width,
                y: OPTIONS_SCENE.playerButton.offsetStart.y + OPTIONS_SCENE.playerButton.offsetBetween.y * row
            }

            let [ positionX, positionY ] = getSquareCenter(
                position.x, position.y, playerType, BASE_PLAYER.scale * 1.25, false);

            this.playerButtons[playerType].setPosition(positionX, positionY);
        });
    }
};
