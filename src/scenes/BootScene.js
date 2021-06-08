import { BASE_PLAYER } from '../constants/player.js';
import { SCENE_KEYS } from '../constants/scenes.js';
import { MAPS } from '../constants/maps.js';
import { SPLASHES } from '../constants/splashes.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.boot);
    }

    preload() {
        this.load.image('logo', 'assets/images/ui/logo.png');
        this.load.image('backgroundPreloader', 'assets/images/backgrounds/preloader/backgroundPreloader.png');
    }

    create() {
        // Since the boot scene is only ever started once (at the very
        // start), set up any registry variables here.
        // Create the player object in the registry.
        this.registry.player = {
            playerType: BASE_PLAYER.playerType
        }
        // Create a list of all background title files.
        this.registry.titleBackgrounds = []
        for (let i = 1; i <= (MAPS.titleAmount); i++) {
            this.registry.titleBackgrounds.push('backgroundTitle' + i);
        }
        // Create a list of all level files.
        this.registry.levels = []
        for (let i = 1; i <= (MAPS.levelAmount); i++) {
            this.registry.levels.push('level' + i);
        }
        // Choose a random splash text.
        this.registry.splash = Phaser.Math.RND.pick(SPLASHES);
        // The current game mode.
        this.registry.gamemode = 'normal';
        // Data needed for when playing the game.
        this.registry.game = {
            lastLevel: null,
            startTime: 0,
            endTime: 0,
            possibleLevels: [],
            completedLevelsCount: 0
        }

        // Start the loading screen.
        this.scene.start(SCENE_KEYS.preloader);
    }
};
