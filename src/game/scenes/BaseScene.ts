import { Controls } from "../../utils/Controls";

export abstract class BaseScene extends Phaser.Scene{
    protected controls: Controls;

    constructor(config){
        super(config);
        if(this.constructor === BaseScene){
            throw new Error('BaseScene is an abstract class cannot be instantiated directly.');
        }
    }

    init(){
        this.log(`[${this.constructor.name}:init] invoked`);
    }

    preload(){
        this.log(`[${this.constructor.name}:preload] invoked`);
    }

    create(){
        this.log(`[${this.constructor.name}:create] invoked`);

        this.controls = new Controls(this);
    }

    update(){

    }

    protected log(message: string){
        console.log(`%c${message}`, 'color: orange; background: black;');
    }
}