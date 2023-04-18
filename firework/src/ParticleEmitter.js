import {Particle} from "./Particle";
import {Vector} from "./vector";
class ParticleEmitter {

    constructor (x, y, rate, amount, lifetime, gravityVec, direction) {
        this.pos = new Vector(x, y, -1);

        this.rate = rate;
        this.lastEmit = 0;

        this.amount = amount;

        this.lifetime = lifetime;
        this.created = Date.now();
        this.alive = true;

        this.gravity = gravityVec ? gravityVec : new Vector(0, 0, 0);

        this.direction = direction ? direction : new Vector(1, 0, 0);
        this.direction.normalize();


        this.options = {
            lifetime: 1000,
            lifeScatter: 800,

            angleScatter: Math.PI * 7,

            power: 2.5,
            powerScatter: 1,

            minSize: 2.0,
            maxSize: 4.0,

            minR: Math.round(Math.random()),
            minG: Math.round(Math.random()),
            minB: Math.round(Math.random()),
            minA: 1.0,

            maxR: Math.round(Math.random()),
            maxG: Math.round(Math.random()),
            maxB: Math.round(Math.random()),
            maxA: 1.0
        };

    };

    setPosition = function (x, y, z) {
        this.pos.set(x, y, z);
    };

    move = function (d) {
        this.pos.add(d);
    };


    update = function (particleSystem, dt) {
        if (Date.now() > this.lastEmit + this.rate) {
            for (let i = 0; i < this.amount; i++) {
                let newParticle = particleSystem.pool.pop();

                if (typeof newParticle === "undefined") {
                    newParticle = new Particle(0, 0, null, null, 0);
                    particleSystem.particles.push(newParticle);
                }


                const power = rand(this.options.power - this.options.powerScatter / 2, this.options.power + this.options.powerScatter / 2),
                    angleScatter = rand(-this.options.angleScatter / 2, this.options.angleScatter / 2),
                    newVel = this.direction.clone().rotate(angleScatter).mul(power),
                    size = rand(this.options.minSize, this.options.maxSize),
                    life = rand(this.options.lifetime - this.options.lifeScatter / 2, this.options.lifetime + this.options.lifeScatter / 2),
                    color = [
                        rand(this.options.minR, this.options.maxR),
                        rand(this.options.minG, this.options.maxG),
                        rand(this.options.minB, this.options.maxB),
                        rand(this.options.minA, this.options.maxA)
                    ];

                newParticle.revive(this.pos.clone(), newVel, life, this.gravity, color, size);
            }

            this.lastEmit = Date.now();
        }
    }
}

function rand(min, max) {
    if (min > max) {
        const tmp = min;
        min = max;
        max = tmp;
    }

    return min + (max - min) * Math.random();
}

export {ParticleEmitter}