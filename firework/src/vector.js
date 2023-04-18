class Vector {

    constructor(i, j, k) {
        this.i = i ? i : 0;
        this.j = j ? j : 0;
        this.k = k ? k : 0;
    };

    set = function (i, j, k) {
        this.i = i ? i : 0;
        this.j = j ? j : 0;
        this.k = k ? k : 0;

        return this;
    };

    div = function (scalar) {
        this.i /= scalar;
        this.j /= scalar;
        this.k /= scalar;

        return this;
    };

    mul = function (scalar) {
        this.i *= scalar;
        this.j *= scalar;
        this.k *= scalar;

        return this;
    };

    add = function (vec) {
        this.i += vec.i;
        this.j += vec.j;
        this.k += vec.k;

        return this;
    };

    sub = function (vec) {
        this.i -= vec.i;
        this.j -= vec.j;
        this.k -= vec.k;

        return this;
    };

    length = function () {
        return Math.sqrt(this.i * this.i + this.j * this.j + this.k * this.k);
    };

    normalize = function () {
        this.div(this.length());

        return this;
    };

    dot = function (vec) {
        return this.i * vec.i + this.j * vec.j + this.k * vec.k;
    };

    reverse = function () {
        this.mul(-1);

        return this;
    };

    rotate = function (angle) {
        const tmpI = this.i,
            tmpJ = this.j,
            cos = Math.cos(angle),
            sin = Math.sin(angle);

        this.i = tmpI * cos - tmpJ * sin;
        this.j = tmpI * sin + tmpJ * cos;

        return this;
    };

    clone = function (vec) {
        return new Vector(this.i, this.j, this.k);
    };

    toString = function () {
        return "[" + this.i + ", " + this.j + ", " + this.k + "]";
    };

    toArray = function () {
        return [this.i, this.j, this.k];
    };

    angle = function (vec1, vec2) {
        return Math.acos(vec1.dot(vec2) / (vec1.length() * vec2.length()));
    }

}

export {Vector}