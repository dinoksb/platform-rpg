import { Controls } from "../../utils/Controls";

export abstract class BaseScene extends Phaser.Scene{
    protected controls: Controls;

    constructor(config){
        super(config);
        if(this.constructor === BaseScene){
            throw new Error('BaseScene is an abstract class cannot be instantiated directly.');
        }
    }

    init(data){
        if(data){
            this.log(`[${this.constructor.name}:init] invoked, data provied: ${JSON.stringify(data)}`);
            return;
        }
        this.log(`[${this.constructor.name}:init] invoked`);
    }

    preload(){
        this.log(`[${this.constructor.name}:preload] invoked`);
    }

    create(){
        this.log(`[${this.constructor.name}:create] invoked`);

        this.controls = new Controls(this);
        this.events.on(Phaser.Scenes.Events.RESUME, this.handleSceneResume, this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneCleanup, this);

        this.scene.bringToTop();
    }

    update(){
        super.update();
    }

    handleSceneResume(sys: Phaser.Scenes.Systems, data: any | undefined){
        this.controls.lockInput = false;
        if(data){
            this.log(`[${this.constructor.name }: handleSceneResume] invoked, data provied: ${JSON.stringify(data)}`);
            return;
        }
        this.log(`[${this.constructor.name }: handleSceneResume] invoked`);
    }

    handleSceneCleanup(): void{
        this.log(`[${this.constructor.name }: handleSceneCleanup] invoked`);
        this.events.off(Phaser.Scenes.Events.RESUME, this.handleSceneCleanup, this);
    }

    protected log(message: string){
        console.log(`%c${message}`, 'color: orange; background: black;');
    }
}