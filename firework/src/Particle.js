import {Vector} from "./vector";
class Particle {
    constructor (x, y, initialVel, gravityVec, lifetime, color, size) {
        this.pos = new Vector(x, y, -1);
        this.vel = initialVel ? initialVel : new Vector(0, 0, 0);

        this.lifetime = lifetime;
        this.created = Date.now();

        this.gravity = gravityVec ? gravityVec : new Vector(0, 0, 0);

        this.alive = true;

        this.color = color ? color : [1.0, 1.0, 1.0, 1.0];
        this.size = size ? size : 1.0;
    };

    revive = function (pos, vel, lifetime, gravity, color, size) {
        this.pos = pos ? pos : new Vector(0, 0, 0);
        this.vel = vel ? vel : new Vector(0, 0, 0);

        this.lifetime = lifetime;
        this.created = Date.now();

        this.gravity = gravity ? gravity : new Vector(0, 0, 0);

        this.color = color ? color : [1.0, 1.0, 1.0, 1.0];

        this.size = size ? size : 1.0;

        this.alive = true;
    };

    update = function (dt) {
        this.vel.add(this.gravity.clone().mul(dt / 1000));
        this.pos.add(this.vel.clone().mul(dt / 1000));
    };

    draw = function (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(this.pos.i, this.pos.j, 1, 1);
    };
}

export {Particle}