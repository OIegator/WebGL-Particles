class ParticleSystem {

    constructor() {
        this.pool = [];
        this.particles = [];

        this.emitters = [];

        this.vertices = [];
        this.colors = [];
        this.sizes = [];
    };

    addEmitter = function (emitter) {
        this.emitters.push(emitter);
    };

    update = function (dt) {
        this.vertices = [];
        this.colors = [];
        this.sizes = [];

        for (let i = 0; i < this.emitters.length; i++) {
            this.emitters[i].update(this, dt);

            if (this.emitters[i].lifetime >= 0 && Date.now() > this.emitters[i].created + this.emitters[i].lifetime) {
                this.emitters[i].alive = false;
            }
        }

        this.emitters = this.emitters.filter(function (elem) {
            return elem.alive;
        });

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            if (!particle.alive) {
                continue;
            }

            particle.update(dt);

            if (Date.now() > (particle.created + particle.lifetime)) {
                this.pool.push(particle);
                particle.alive = false;
            } else {
                this.vertices = this.vertices.concat(particle.pos.toArray());
                this.colors = this.colors.concat(particle.color);
                this.sizes.push(particle.size);
            }


        }
    };
}

export {ParticleSystem}