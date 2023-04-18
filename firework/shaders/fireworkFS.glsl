#version 300 es

precision mediump float;

uniform sampler2D u_texture;

in vec3 pos;
in vec4 vColor;

out vec4 fragColor;

void main() {
    fragColor = vColor;
}