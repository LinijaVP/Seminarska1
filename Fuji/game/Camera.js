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
        this.groundLevel = 0;
        this.groundChecker = 0;
        this.jumpTime = 0;
    
        this.jumpLimit = 0.5;
        this.kite = true;
    
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    update(dt) {
        const c = this;

        
        if(document.getElementById('ground').getAttribute("value") == "true") {
            this.grounded = true;
        } else 
           this.grounded = false;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));
        const up = vec3.set(vec3.create(),
            0, 10, 0);
        const down = vec3.set(vec3.create(),
            0, -7, 0);
        const downKite = vec3.set(vec3.create(),
            0, -3, 0);


        
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
            c.maxSpeed = 10;
        } else {
            c.maxSpeed = 5;
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
            this.jumpTime += dt;
            if(this.jumpTime < this.jumpLimit) {
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

        


        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

    
    }



    Jump(acc) {

        return acc;
    }
    

    jumpCooldown() {
        if(this.jumpC < 0.4 && this.doubleJ == 0) {
            return true;
            this.jumpC = 0;
            this.doubleJ = 1;
        }
        if(this.jumpC < 0.4 && this.doubleJ == 1) {
            return true;
        }
        if(this.jumpC > 1) {
            this.jumpC = 0;
            this.doubleJ = 0;
        }
        return false;
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
