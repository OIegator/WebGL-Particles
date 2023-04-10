import snowflakeFS from '../shaders/snowflakeFS.glsl'
import snowflakeVS from '../shaders/snowflakeVS.glsl'
import spark_texture from "../textures/snowflake.png"
import {mat4} from "gl-matrix";

const canvas = document.querySelector('canvas');
let gl;

// function initWebGL(canvas) {
//     gl = null
//     const names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
//     for (let ii = 0; ii < names.length; ++ii) {
//         try {
//             gl = canvas.getContext(names[ii]);
//         } catch (e) {
//         }
//         if (gl) {
//             break;
//         }
//     }
//
//     if (!gl) {
//         alert("Unable to initialize WebGL. Your browser may not support it.");
//         gl = null;
//     }
//     return gl;
// }
//
//
// function main() {
//     gl = initWebGL(canvas);
//
//     gl.enable(gl.BLEND);
//     gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
//
//     const sparkTexture = loadTexture(gl, spark_texture);
//
//     let trackProgram = initShaderProgram(gl, tracksVS, tracksFS);
//     let sparkProgram = initShaderProgram(gl, sparkVS, sparkFS);
//
//     const programInfo = {
//         track_program: trackProgram,
//         spark_program: sparkProgram,
//         attribLocations: {
//             positionAttributeLocationTrack:
//                 gl.getAttribLocation(trackProgram, "a_position"),
//             colorAttributeLocationTrack:
//                 gl.getAttribLocation(trackProgram, "a_color"),
//             positionAttributeLocationSpark:
//                 gl.getAttribLocation(sparkProgram, "a_position"),
//         },
//         uniformLocations: {
//             pMatrixUniformLocationTrack:
//                 gl.getUniformLocation(trackProgram, "u_pMatrix"),
//             mvMatrixUniformLocationTrack:
//                 gl.getUniformLocation(trackProgram, "u_mvMatrix"),
//             textureLocationSpark:
//                 gl.getUniformLocation(sparkProgram, "u_texture"),
//             pMatrixUniformLocationSpark:
//                 gl.getUniformLocation(sparkProgram, "u_pMatrix"),
//             mvMatrixUniformLocationSpark:
//                 gl.getUniformLocation(sparkProgram, "u_mvMatrix"),
//         },
//
//     };
//
//     const mvMatrix = mat4.create();
//     const pMatrix = mat4.create();
//
//     const sparks = [];
//     for (let i = 0; i < Spark.sparksCount; i++) {
//         sparks.push(new Spark());
//     }
//
//     let now = new Date();
//     function render(now) {
//
//         gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
//
//         gl.clearColor(0, 0, 0, 1);
//         gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//
//         mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
//         mat4.identity(mvMatrix);
//         mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);
//
//         for (let i = 0; i < sparks.length; i++) {
//             sparks[i].move(now);
//         }
//
//         const positions = [];
//         sparks.forEach(function (item, i, arr) {
//             positions.push(item.x);
//             positions.push(item.y);
//             // искры двигаются только в одной плоскости xy
//             positions.push(0);
//         });
//
//         drawTracks(gl, programInfo, positions, pMatrix, mvMatrix);
//         drawSparks(gl, programInfo, sparkTexture, positions, pMatrix, mvMatrix);
//
//         requestAnimationFrame(render);
//     }
//
//     requestAnimationFrame(render);
// }
//

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
    return shaderProgram;

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

function Spark() {
    this.init();
}

// количество искр
Spark.sparksCount = 1000;

Spark.prototype.init = function () {
    // время создания снежинки
    this.timeFromCreation = performance.now();

    // задаем начальные координаты
    const startX = Math.random() * 8 - 4;// генерируем случайное значение по ширине окна
    const startY = Math.random() * (4 - 2) + 2; // снежинка падает сверху, поэтому стартовое значение по y должно быть отрицательным

    // задаем максимальное значение по y, которое может достигнуть снежинка
    const yMax = -2;

    // скорость падения снежинки
    const speed = -0.001 - Math.random() * 0.002;

    // максимальное смещение по оси x
    const xMaxOffset = 0.001 + Math.random() * 0.001;

    // скорость изменения смещения по оси x
    const xChangeSpeed = Math.random() * -0.000002;

    this.size = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
    // начальное смещение по оси x
    this.xOffset = 0;

    // сохраняем стартовые координаты
    this.x = startX;
    this.y = startY;

    // сохраняем максимальное значение по y
    this.yMax = yMax;

    // сохраняем скорость
    this.speed = speed;

    // сохраняем максимальное смещение по оси x
    this.xMaxOffset = xMaxOffset;

    // сохраняем скорость изменения смещения по оси x
    this.xChangeSpeed = xChangeSpeed;
};

Spark.prototype.move = function (time) {
    // находим разницу между вызовами отрисовки, чтобы анимация работала
    // одинаково на компьютерах разной мощности
    const timeShift = time - this.timeFromCreation;
    this.timeFromCreation = time;

    // приращение по y зависит от времени между отрисовками и скорости снежинки
    const ySpeed = this.speed;
    this.y += ySpeed;

    // изменение смещения по оси x
    const xOffsetSpeed = this.xChangeSpeed;
    this.xOffset += xOffsetSpeed;
    if (Math.abs(this.xOffset) > this.xMaxOffset) {
        this.xOffset = -this.xOffset;
    }
    const x = this.x + this.xOffset;

    // если снежинка достигла конечной точки по y, начинаем падать вновь
    if (this.y < this.yMax) {
        this.init();
    }

    // сохраняем новые координаты
    this.x = x;
    this.y = this.y;
};



function main() {

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // gl.SRC_ALPHA - рисуемая искра умножается на прозрачный канал, чтобы убрать фон
    // изображения. gl.ONE - уже нарисованные искры остаются без изменений
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let programSnowflake = initShaderProgram(gl, snowflakeVS, snowflakeFS);

    const positionAttributeLocationSpark = gl.getAttribLocation(programSnowflake, "a_position");
    const textureLocationSpark = gl.getUniformLocation(programSnowflake, "u_texture");
    const pMatrixUniformLocationSpark = gl.getUniformLocation(programSnowflake, "u_pMatrix");
    const mvMatrixUniformLocationSpark = gl.getUniformLocation(programSnowflake, "u_mvMatrix");
    const spriteSize = gl.getUniformLocation(programSnowflake, "u_pSize");
    const texture = gl.createTexture();

    const image = new Image();
    image.src = spark_texture;
    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(drawScene);
    });

    const mvMatrix = mat4.create();
    const pMatrix = mat4.create();

    function drawSparks(positions, size) {
        gl.useProgram(programSnowflake);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);
        gl.uniform1f(spriteSize, size);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocationSpark, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        gl.vertexAttribPointer(positionAttributeLocationSpark, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(positionAttributeLocationSpark);

        gl.drawArrays(gl.POINTS, 0, positions.length / 3);
    }

    const sparks = [];
    for (let i = 0; i < Spark.sparksCount; i++) {
        sparks.push(new Spark());
    }

    function drawScene(now) {
        // обновляем размер canvas на случай, если он растянулся или сжался вслед за страницей

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(pMatrix, 45, gl.canvas.width / gl.canvas.height, 0.1, 100.0);
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -3.5]);

        for (let i = 0; i < sparks.length; i++) {
            sparks[i].move(now);
        }

        const positions = [];
        sparks.forEach(function(item, i, arr) {
            positions.push(item.x);
            positions.push(item.y);
            // искры двигаются только в одной плоскости xy
            positions.push(item.size);
        });

        drawSparks(positions, 4.0);

        requestAnimationFrame(drawScene);
    }
}

main();