uniform vec2 u_resolution;
uniform vec2 u_magnification;
uniform vec2 u_offset;

attribute vec3 a_vertex;
attribute vec2 a_texCoord;
attribute vec2 a_position;
attribute vec2 a_scale;

varying vec2 v_texCoord;

void main() {

  vec2 clipspace = (a_vertex.xy * a_scale + u_offset + a_position)
      * u_magnification / u_resolution * 2.0 - 1.0;
  gl_Position = vec4(clipspace * vec2(1, -1), a_vertex.z, 1);

  v_texCoord = a_texCoord;
}
