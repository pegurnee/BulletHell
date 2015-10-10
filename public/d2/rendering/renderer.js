"use strict";

define(function() {

  var Renderer = function(gl, shaderProgram) {
    this.gl = gl;
    this.arrayAttributes = [];
    this.uniforms = [];

    if (gl) {
      this.initialize(gl, shaderProgram);
    }
  };

  Renderer.prototype.setImage = function(image) {
    if (image !== this.currentImage) {
      var gl = this.gl;
      this.currentImage = image;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    }
  };

  Renderer.prototype.clear = function(numArrayAttributes) {
    numArrayAttributes = numArrayAttributes || 0;

    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i < this.arrayAttributes.length; i++) {
      this.arrayAttributes[i].clear(numArrayAttributes);
    }
  };

  Renderer.prototype.draw = function(numAttributes) {
    this.bindUniforms();
    this.bindArrayAttributes();

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * numAttributes);
  };

  Renderer.prototype.initialize = function(gl, program) {

    //var texCoordBuffer = gl.createBuffer();
    this.texture = gl.createTexture();

    // blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set the parameters so we can render any size image.
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.useProgram(program);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  };

  Renderer.prototype.bindArrayAttributes = function() {
    var gl = this.gl;
    for (var i = 0; i < this.arrayAttributes.length; i++) {
      // var arrayAttribute = this.arrayAttributes[i];
      // gl.bindBuffer(gl.ARRAY_BUFFER, arrayAttribute.buffer);
      // gl.enableVertexAttribArray(arrayAttribute.location);
      // gl.vertexAttribPointer(
      //   arrayAttribute.location, 2, gl.FLOAT, false, 0, 0
      // );
      this.arrayAttributes[i].bind(this);
      //gl.bufferData(gl.ARRAY_BUFFER, arrayAttribute.data, gl.STATIC_DRAW);
    }
  };

  Renderer.prototype.bindUniforms = function() {
    var gl = this.gl;
    for (var i = 0; i < this.uniforms.length; i++) {
      var uniform = this.uniforms[i];
      gl.uniform2f(uniform.location, uniform.x, uniform.y);
    }
  };

  Renderer.prototype.addArrayAttribute = function(attribute) {
    this.arrayAttributes.push(attribute);
  };

  Renderer.prototype.addUniform2d = function(uniform) {
    this.uniforms.push(uniform);
  };


  return Renderer;
});
