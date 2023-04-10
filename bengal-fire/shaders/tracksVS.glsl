#version 300 es

in vec3 a_position;
in vec3 a_color;

out vec3 v_color;

uniform mat4 u_mvMatrix;
uniform mat4 u_pMatrix;

void main() {
    v_color = a_color;
    gl_Position = u_pMatrix * u_mvMatrix * vec4(a_position, 1.0);
}