import sparkFS from '../shaders/sparkFS.glsl'
import sparkVS from '../shaders/sparkVS.glsl'
import tracksFS from '../shaders/tracksFS.glsl'
import tracksVS from '../shaders/tracksVS.glsl'
import spark_texture from "../textures/spark.png"
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
Spark.sparksCount = 200;



function main() {
    Spark.prototype.init = function () {
        // время создания искры
        this.timeFromCreation = performance.now();

        // задаём направление полёта искры в градусах, от 0 до 360
        const angle = Math.random() * 360;
        // радиус - это расстояние, которое пролетит искра
        const radius = Math.random();
        // отмеряем точки на окружности - максимальные координаты искры
        this.xMax = Math.cos(angle) * radius;
        this.yMax = Math.sin(angle) * radius;

        // dx и dy - приращение искры за вызов отрисовки, то есть её скорость,
        // у каждой искры своя скорость. multiplier подобран экспериментально
        const multiplier = 125 + Math.random() * 125;
        this.dx = this.xMax / multiplier;
        this.dy = this.yMax / multiplier;

        // Для того, чтобы не все искры начинали движение из начала координат,
        // делаем каждой искре свой отступ, но не более максимальных значений.
        this.x = (this.dx * 1000) % this.xMax;
        this.y = (this.dy * 1000) % this.yMax;
    };

    Spark.prototype.move = function (time) {
        // находим разницу между вызовами отрисовки, чтобы анимация работала
        // одинаково на компьютерах разной мощности
        const timeShift = time - this.timeFromCreation;
        this.timeFromCreation = time;

        // приращение зависит от времени между отрисовками
        const speed = timeShift;
        this.x += this.dx * speed;
        this.y += this.dy * speed;

        // если искра достигла конечной точки, запускаем её заново из начала координат
        if (Math.abs(this.x) > Math.abs(this.xMax) || Math.abs(this.y) > Math.abs(this.yMax)) {
            this.init();
        }
    };
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // gl.SRC_ALPHA - рисуемая искра умножается на прозрачный канал, чтобы убрать фон
    // изображения. gl.ONE - уже нарисованные искры остаются без изменений
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let programTrack = initShaderProgram(gl, tracksVS, tracksFS);

    // инициализация программы следов искр

    const positionAttributeLocationTrack = gl.getAttribLocation(programTrack, "a_position");
    const colorAttributeLocationTrack = gl.getAttribLocation(programTrack, "a_color");
    const pMatrixUniformLocationTrack = gl.getUniformLocation(programTrack, "u_pMatrix");
    const mvMatrixUniformLocationTrack = gl.getUniformLocation(programTrack, "u_mvMatrix");

    // инициализация программы искр
    let programSpark = initShaderProgram(gl, sparkVS, sparkFS);

    const positionAttributeLocationSpark = gl.getAttribLocation(programSpark, "a_position");
    const textureLocationSpark = gl.getUniformLocation(programSpark, "u_texture");
    const pMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_pMatrix");
    const mvMatrixUniformLocationSpark = gl.getUniformLocation(programSpark, "u_mvMatrix");

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

    function drawTracks(positions) {
        const colors = [];
        const positionsFromCenter = [];
        for (let i = 0; i < positions.length; i += 3) {
            // для каждой координаты добавляем точку начала координат, чтобы получить след искры
            positionsFromCenter.push(0, 0, 0);
            positionsFromCenter.push(positions[i], positions[i + 1], positions[i + 2]);

            // цвет в начале координат будет белый (горячий), а дальше будет приближаться к оранжевому
            colors.push(1, 1, 1, 0.47, 0.31, 0.24);
        }

        gl.useProgram(programTrack);

        gl.uniformMatrix4fv(pMatrixUniformLocationTrack, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationTrack, false, mvMatrix);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionsFromCenter), gl.STATIC_DRAW);

        gl.vertexAttribPointer(positionAttributeLocationTrack, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocationTrack);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        gl.vertexAttribPointer(colorAttributeLocationTrack, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorAttributeLocationTrack);

        gl.drawArrays(gl.LINES, 0, positionsFromCenter.length / 3);
    }

    function drawSparks(positions) {
        gl.useProgram(programSpark);

        gl.uniformMatrix4fv(pMatrixUniformLocationSpark, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniformLocationSpark, false, mvMatrix);

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
            positions.push(0);
        });

        drawTracks(positions);
        drawSparks(positions);

        requestAnimationFrame(drawScene);
    }
}

main();