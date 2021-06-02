import { SCENE_KEYS, BASE_PLAYER } from '../constants.js';

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
        // Start the loading screen.
        this.scene.start(SCENE_KEYS.preloader);
    }
};
