#version 300 es

in vec3 aVertexPosition;
in vec4 aVertexColor;
in float aVertexSize;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

out vec4 vColor;
out vec3 pos;

void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    gl_PointSize = aVertexSize;
    vColor = aVertexColor;
}