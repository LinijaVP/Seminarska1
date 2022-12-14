import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';

var Grou = false;

export class Camera extends Node {


    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};

        this.jumpC = 0;
        this.grounded = false;
        this.groundLevel = false;
        this.prejsnji = 0;
        this.stGround = 0;
        this.jumpTime = 0;
    
        this.jumpLimit = 0.5;
        this.kite = true;

        this.upgrades = 0;

        
        this.bar = document.querySelector('.bar')
        
        
    
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;


        const zdaj = Math.round(c.translation[1] * 100) / 100;
        if(this.prejsnji == zdaj) {
            this.stGround++;
        }
        //grounded check ŠE DODAJ CHECK ZA SPREMINJANJE VISINE SI ZE MEL
        if(document.getElementById('ground').getAttribute("value") == "true") {
            if(this.stGround > 10) {
                this.grounded = true;
            }
        } else {
            this.grounded = false;
            this.stGround = 0;
        }

        this.prejsnji = zdaj;
        

        //jump bar manipulation
        const barValue = (this.jumpLimit-this.jumpTime) / 1.1 * 100;
        var barText = "%";
        barText = barValue.toString() + barText;
        this.bar.style.width = barText;

        //upgrades jump boost
        var trenutna = document.getElementById('upgrade').getAttribute("value");
        if(trenutna == "one")
            this.upgrades = 1;
        else if(trenutna == "two")
            this.upgrades = 2;
        else if(trenutna == "three")
            this.upgrades = 3;
        else if(trenutna == "four")
            this.upgrades = 4;
        else if(trenutna == "konec")
            location.href = '../index.html';
            
        this.jumpLimit = 0.5 + 0.15 * this.upgrades;


        //reset camera
        if (c.translation[1] < -6) {
            c.translation = [0, 5, 0]
            c.updateMatrix();
            
        }


        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
        const up = vec3.set(vec3.create(),
            0, 10, 0);
        const down = vec3.set(vec3.create(),
            0, -8, 0);
        const downKite = vec3.set(vec3.create(),
            0, -5, 0);


        
        // 1: add movement acceleration
        const acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }
        
       


        //1.1 sprint
        if(this.keys['ShiftLeft']) {
            vec3.add(acc, acc, forward);
            c.maxSpeed = 15;
        } else {
            c.maxSpeed = 7;
        }

        

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
        

        // 5: jump
        if(this.keys['Space']) {
            if(this.jumpTime == 0)
                this.grounded = false;
                
            

            if(this.jumpTime < this.jumpLimit) {
                this.jumpTime += dt;
                vec3.add(acc, acc, up);
            } 
        }

        //6: gravity
        if((!this.keys['Space'] || this.jumpTime > this.jumpLimit) && !this.grounded ) {
            if(!this.keys['KeyE']) {
                vec3.add(acc, acc, down);
            } else {
                if (this.kite == true) {
                    vec3.add(acc, acc, downKite);
                }
            }
        }

        if (this.grounded) {
            this.jumpTime = 0;
        }

        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration)


        // fov change with speed
        c.fov = 1.5 + c.maxSpeed / c.velocity;
    
    }



    Jump(acc) {

        return acc;
    }
    




    enable() {
        document.addEventListener('pointermove', this.pointermoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('pointermove', this.pointermoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (const key in this.keys) {
            this.keys[key] = false;
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.pointerSensitivity;
        c.rotation[1] -= dx * c.pointerSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

Camera.defaults = {
    aspect           : 1,
    fov              : 3,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    pointerSensitivity : 0.004,
    maxSpeed         : 5,
    friction         : 0.2,
    acceleration     : 20
};
