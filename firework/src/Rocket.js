import {ParticleEmitter} from "./ParticleEmitter";
import {Vector} from "./vector";
class Rocket {
    constructor(x, y, speed, lifetime, particleSystem, r, g, b) {
        this.particleSystem = particleSystem;

        this.pos = new Vector(x, y, -1);
        this.vel = new Vector(0, speed, 0);

        this.lastTurn = Math.random() < 0.5 ? -1 : 1;

        this.lifetime = lifetime;
        this.created = Date.now();
        this.alive = true;

        this.r = r ? r : false;
        this.g = g ? g : false;
        this.b = b ? b : false;

        // this.sparks = new ParticleEmitter(x, y, 10, 2, -1, null, this.vel.clone().reverse());
        // this.sparks.pos = this.pos;
        //
        // particleSystem.addEmitter(this.sparks);
    };

    move = function (vel) {
        this.pos.add(vel);
        //this.sparks.pos = this.pos.clone();
    };

    update = function (dt) {
        if (!this.alive) {
            return;
        }

        let turn = -this.lastTurn * 0.1 + -this.lastTurn * 0.2 * Math.random();
        this.vel.rotate(turn);

        this.lastTurn = turn < 0 ? -1 : 1;
        if (this.vel.j < 0) {
            this.vel.j = this.vel.j * -1;
        }

        this.pos.add(this.vel.clone().mul(dt / 1000));
        //
        // this.sparks.pos = this.pos.clone();
        // this.sparks.direction = this.vel.clone().reverse().normalize();

        if (Date.now() > this.created + this.lifetime) {
            //this.sparks.alive = false;

            const amount = 10 + 190 * Math.random();

            const explosion = new ParticleEmitter(this.pos.i, this.pos.j, 0, amount, 1, null, null, {
                lifetime: 400,
                lifeScatter: 300,

                power: 2,
                powerScatter: 3 * Math.random(),

                minSize: 1.0,
                maxSize: 3.0,

                minR: this.r ? 1.0 : 0,
                minG: this.g ? 1.0 : 0,
                minB: this.b ? 1.0 : 0,

                maxR: 1.0,
                maxG: 1.0,
                maxB: 1.0
            });
            this.particleSystem.addEmitter(explosion);

            this.alive = false;

        }
    };
}

export {Rocket}