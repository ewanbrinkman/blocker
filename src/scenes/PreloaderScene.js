import { COLORS, FONT } from '../constants/style.js';
import { TILES } from '../constants/maps.js';
import { SCENE_KEYS, PRELOADER_SCENE } from '../constants/scenes.js';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.preloader);
    }

    preload() {
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
        this.background = this.add.image(width / 2, height, 'backgroundPreloader');
        this.background.setOrigin(0.5, 1);
        // Add the logo image.
        this.logo = this.add.image(width / 2, PRELOADER_SCENE.logo.offset.y, 'logo');
        this.logo.setScale(0.4, 0.4);

        // The box around the progress bar.
        this.progressBox = this.add.rectangle(
            width / 2,
            height / 2,
            PRELOADER_SCENE.progressBox.width,
            PRELOADER_SCENE.progressBox.height,
            PRELOADER_SCENE.progressBox.color,
            PRELOADER_SCENE.progressBox.alpha);
        // Create the progress bar.
        this.progressBar = this.add.rectangle(
            width / 2 - PRELOADER_SCENE.progressBar.width / 2,
            height / 2,
            PRELOADER_SCENE.progressBar.width,
            PRELOADER_SCENE.progressBar.height,
            PRELOADER_SCENE.progressBar.color,
            PRELOADER_SCENE.progressBar.alpha
        )
        // The loading bar should load from left to right, so it has to
        // be placed where the x position is its left side.
        this.progressBar.setOrigin(0, 0.5);
        
        // Add text to display loading information.
        this.loadingText = this.add.text(
            width / 2,
            height / 2 + PRELOADER_SCENE.loadingText.offset.y + FONT[this.font].offset.y,
            'Loading...',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.loadingText.setOrigin(0.5, 0.5);

        this.percentText = this.add.text(
            width / 2,
            height / 2 + FONT[this.font].offset.y,
            '0%',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.percentText.setOrigin(0.5, 0.5);

        this.assetText = this.add.text(
            width / 2,
            height / 2 + PRELOADER_SCENE.assetText.offset.y + FONT[this.font].offset.y,
            '',
            { font: '48px ' + this.font, fill: COLORS.text});
        this.assetText.setOrigin(0.5, 0.5);

        this.readyText = this.add.text(
            width / 2,
            height / 2 + FONT[this.font].offset.y,
            'Press Any Key To Start',
            { font: '72px ' + this.font, fill: COLORS.text});
        this.readyText.setOrigin(0.5, 0.5);
        this.readyText.visible = false;

        // Update the progress bar.
        this.load.on('progress', value => {
            // Set the loading percentage value and progress bar size.
            this.percentText.setText(parseInt(value * 100) + '%');
            this.progressBar.displayWidth = 300 * value;
        });

        // Update file progress text.
        this.load.on('fileprogress', file => {
            // Show the current file being loaded.
            this.assetText.setText('Loading Asset: ' + file.key);
        });

        this.load.on('complete', () => {
            // Destroy the objects shown when loading assets when all
            // assets are loaded. This is done because the timer for
            // keeping the logo on screen may not be done yet. 
            this.destroyLoadingObjects();

            // Show text to prompt the user to click any key.
            this.readyText.visible = true;
            // Make the text flash.
            this.readyTextTween = this.tweens.add({
                targets: this.readyText,
                alpha: 0,
                duration: 1000,
                ease: Phaser.Math.Easing.Linear,
                yoyo: true,
                loop: -1,
            });
        });

        // To extrude a tileset using tile-extruder on the command line:
        // tile-extruder --tileWidth 70 --tileHeight 70 --spacing 2 --input ./tiles.png --output ./tiles-extruded.png
        // To load into tiled, use a margin of 1px (1px plus the original 0px) and a spacing of 4px (2px plus the original 2px).
        // Load maps made with Tiled in JSON format.
        this.registry.levels.forEach((filename) => {
            this.load.tilemapTiledJSON(filename, 'assets/maps/levels/' + filename + '.json');
        });
        // Tiles in spritesheet.
        this.load.spritesheet('tiles', 'assets/images/spritesheets/tiles.png', {frameWidth: TILES.width, frameHeight: TILES.height, margin: 1, spacing: 4});
        // Player images.
        this.load.atlas('players', 'assets/images/players/players.png', 'assets/images/players/players.json')
        this.load.atlas('selectedPlayers', 'assets/images/players/selectedPlayers.png', 'assets/images/players/selectedPlayers.json')

        // Load user interface assets.
        this.load.image('greenButtonUp', 'assets/images/ui/greenButtonUp.png');
        this.load.image('greenButtonDown', 'assets/images/ui/greenButtonDown.png');
        this.load.image('greenboxCheckmark', 'assets/images/ui/greenboxCheckmark.png');
        this.load.image('emptyBox', 'assets/images/ui/emptyBox.png')

        // Load background images.
        this.registry.titleBackgrounds.forEach((filename) => {
            this.load.image(filename, 'assets/images/backgrounds/title/' + filename + '.png');
        });
        this.load.image('backgroundOptions', 'assets/images/backgrounds/options/backgroundOptions.png');
        this.load.image('backgroundCredits', 'assets/images/backgrounds/credits/backgroundCredits.png');

        // For testing the loading bar.
        // for (let i = 0; i<300; i++) {
        //     this.load.tilemapTiledJSON('mapTest'+i, 'assets/maps/map2.json');
        // }
    }

    create() {
        // Now that all assets are loaded, any key can be pressed
        // to start the game.
        this.input.keyboard.on('keydown', () => {
            this.startTitleScene();
        });
        this.input.on('pointerdown', () => {
            this.startTitleScene();
        });
    }

    startTitleScene() {
        this.scene.start(SCENE_KEYS.title);
    }

    destroyLoadingObjects() {
        this.progressBar.destroy();
        this.progressBox.destroy();
        this.loadingText.destroy();
        this.percentText.destroy();
        this.assetText.destroy();
    }

    resize() {
        // The current size of the screen.
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Set objects to be in the correct position with the new
        // screen size.
        this.background.setPosition(width / 2, height);
        this.logo.setPosition(width / 2, PRELOADER_SCENE.logo.offset.y);
        this.progressBox.setPosition(width / 2, height / 2);
        this.progressBar.setPosition(width / 2 - PRELOADER_SCENE.progressBar.width / 2, height / 2);
        this.loadingText.setPosition(width / 2, height / 2 + PRELOADER_SCENE.loadingText.offset.y + FONT[this.font].offset.y);
        this.percentText.setPosition(width / 2, height / 2 + FONT[this.font].offset.y);
        this.assetText.setPosition(width / 2, height / 2 + PRELOADER_SCENE.assetText.offset.y + FONT[this.font].offset.y);
        this.readyText.setPosition(width / 2, height / 2 + FONT[this.font].offset.y);
    }
};
