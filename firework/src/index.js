import sparkFS from '../shaders/fireworkFS.glsl'
import sparkVS from '../shaders/fireworkVS.glsl'
import {ParticleSystem} from "./ParticleSystem";
import {Rocket} from "./Rocket";
import {mat4} from "gl-matrix";

let canvas = document.querySelector('canvas'), ctx;
let gl;

let particleVertexPosBuffer;
let particleVertexColorBuffer;
let particleVertexSizeBuffer;

const mvMatrix = mat4.create();
const pMatrix = mat4.create();

let vertexPositionAttribute;
let vertexColorAttribute;
let vertexSizeAttribute;
let pMatrixUniform;
let mvMatrixUniform;

let shaderProgram;

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    gl.useProgram(shaderProgram);

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(vertexColorAttribute);

    vertexSizeAttribute = gl.getAttribLocation(shaderProgram, "aVertexSize");
    gl.enableVertexAttribArray(vertexSizeAttribute);

    pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initBuffers() {
    particleVertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);

    particleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);

    particleVertexSizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(), gl.DYNAMIC_DRAW);
}

function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0, 0, -2.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexPosBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexSizeBuffer);
    gl.vertexAttribPointer(vertexSizeAttribute, 1, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.POINTS, 0, particleSystem.vertices.length / 3);
}

const particleSystem = new ParticleSystem();

let rockets = [];
let rocketInterval = 1000;
let lastRocket = 0;

let lastT = 0;
let dt;

function run(t) {
    dt = t - lastT;
    lastT = t;

    window.requestAnimationFrame(run);

    if (Date.now() > lastRocket + rocketInterval) {
        let x = -2 + 4 * Math.random(),

            r = Math.random() > 0.5,
            g = Math.random() > 0.5,
            b = Math.random() > 0.5,

            speed = 0.7 + 0.7 * Math.random(),

            life = 3000 + 2000 * Math.random();

        rockets.push(new Rocket(x, -3, speed, life, particleSystem, r, g, b));

        rocketInterval = 600 + 800 * Math.random();

        lastRocket = Date.now();
    }
    for (let i = 0; i < rockets.length; i++) {
        rockets[i].update(dt);
    }

    particleSystem.update(dt, ctx);
    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleSystem.vertices), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleSystem.colors), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexSizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(particleSystem.sizes), gl.DYNAMIC_DRAW);

    draw();
}

function flushRockets() {
    rockets = rockets.filter(function(elem) {
        return elem.alive;
    });
}

window.setInterval(flushRockets, 1000);

gl = canvas.getContext("webgl2");
if (!gl) {
    return;
}

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

initShaderProgram(gl, sparkVS, sparkFS);
initBuffers();

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

window.requestAnimationFrame(run);