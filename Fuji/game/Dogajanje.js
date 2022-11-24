import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

export class Dogajanje {

    constructor(upgrades) {
        this.upgrades = upgrades;
    }

    update(dt) {
        for (var i = 0; i < 5; i++) {
            vec3.scaleAndAdd(this.upgrades[i].rotation, this.upgrades[i].rotation, [0,1,0], dt);
            this.upgrades[i].updateMatrix();
        }
    }




}