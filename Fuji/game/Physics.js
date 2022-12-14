import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Upgrade } from './Upgrade.js';


export class Physics {
    constructor(scene) {
        this.scene = scene;
        this.gr = 0;
    }

    update(dt) {
        this.gr = 0;
        this.scene.traverse(node => {
            // Move every node with defined velocity.
            if (node.velocity) {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateMatrix();


                
                // After moving, check for collision with every other node.
                this.scene.traverse(other => {
                    if (node !== other) {
                        this.resolveCollision(node, other);
                    }
                });


        
            }
        });

        
        if(this.gr > 0)
            document.getElementById('ground').setAttribute("value", "true");
        else 
            document.getElementById('ground').setAttribute("value", "false");

    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.getGlobalTransform();
        const { min, max } = node.aabb;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    resolveCollision(a, b) {
        // Get global space AABBs.
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);

        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);
        
        if (!isColliding) {
            return;
        } 
        this.gr++;


        //upgrades
        var trenutna = document.getElementById('upgrade').getAttribute("value");
        if(trenutna != "konec" && (a instanceof Upgrade || b instanceof Upgrade)) {
            if(trenutna == "zero")
                document.getElementById('upgrade').setAttribute("value", "one");
            else if(trenutna == "one")
                document.getElementById('upgrade').setAttribute("value", "two");
            else if(trenutna == "two")
                document.getElementById('upgrade').setAttribute("value", "three");
            else if(trenutna == "three")
                document.getElementById('upgrade').setAttribute("value", "four");
            else if(trenutna == "four") {
                document.getElementById('upgrade').setAttribute("value", "konec");
            }

        
            if(a instanceof Upgrade) {
                a.translation[1] = 200;
                b.jumpTime = 0;
                a.updateMatrix();
            } else if(b instanceof Upgrade ){
                b.translation[1] = 200;
                a.jumpTime = 0;
                b.updateMatrix();
            }

        }
       
        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), bBox.max, aBox.min);
        const diffb = vec3.sub(vec3.create(), aBox.max, bBox.min);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);
        a.updateMatrix();
    }

}

