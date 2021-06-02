import { SCENE_KEYS, BASE_PLAYER, MAPS } from '../constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super(SCENE_KEYS.boot);
    }

    preload() {
        this.load.image('logo', 'assets/images/ui/logo.png');
        this.load.image('backgroundPreloader', 'assets/images/backgrounds/preloader/backgroundPreloader.png');
    }

    create() {
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

        // Start the loading screen.
        this.scene.start(SCENE_KEYS.preloader);
    }
};
