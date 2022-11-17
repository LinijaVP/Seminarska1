import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Node } from './Node.js';

export class Upgrade extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
    }

    

}
