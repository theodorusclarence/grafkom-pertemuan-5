// https://github.com/cg2021c/learn-webgl-hadziq/blob/main/main.js

function main() {
  // Access the canvas through DOM: Document Object Model
  /**
   * @type {HTMLCanvasElement} canvas
   */
  const canvas = document.getElementById('myCanvas'); // The paper

  /**
   * @type {WebGLRenderingContext} gl
   */
  const gl = canvas.getContext('webgl'); // The brush and the paints

  // Define vertices data for three points
  /**
   * A (-0.5,  0.5), Red   (1.0, 0.0, 0.0)
   * B ( 0.5,  0.5), Green (0.0, 1.0, 0.0)
   * C ( 0.5, -0.5), Blue  (0.0, 0.0, 1.0)
   * D (-0.5, -0.5), Blue  (0.0, 0.0, 1.0)
   */
  // prettier-ignore
  const vertices = [
    -0.5,  0.5, 1.0, 0.0, 0.0, // Point A
     0.5,  0.5, 0.0, 1.0, 0.0,  // Point B
     0.5, -0.5, 0.0, 0.0, 1.0, // Point C
    -0.5, -0.5, 0.0, 0.0, 1.0, // Point D
  ];

  // Create a linked-list for storing the vertices data
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const vertexShaderSource = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;
    uniform float uChange;
    void main() {
      gl_Position = vec4(aPosition + uChange, 0.0, 1.0);
      vColor = aColor;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  // Create .c in GPU
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);

  // Compile .c into .o
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  // Prepare a .exe shell (shader program)
  const shaderProgram = gl.createProgram();

  // Put the two .o files into the shell
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);

  // Link the two .o files, so together they can be a runnable program/context.
  gl.linkProgram(shaderProgram);

  // Start using the context (analogy: start using the paints and the brushes)
  gl.useProgram(shaderProgram);

  // Teach the computer how to collect
  //  the positional values from ARRAY_BUFFER
  //  to each vertex being processed
  const aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
  gl.vertexAttribPointer(
    aPosition,
    2,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.enableVertexAttribArray(aPosition);
  const aColor = gl.getAttribLocation(shaderProgram, 'aColor');
  gl.vertexAttribPointer(
    aColor,
    3,
    gl.FLOAT,
    false,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(aColor);

  let freeze = false;
  // Interactive graphics with mouse
  function onMouseClick(event) {
    freeze = !freeze;
  }
  document.addEventListener('click', onMouseClick);
  // Interactive graphics with keyboard
  function onKeydown(event) {
    if (event.keyCode == 32) freeze = true;
  }
  function onKeyup(event) {
    if (event.keyCode == 32) freeze = false;
  }
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('keyup', onKeyup);

  const speedRaw = 1;
  let speed = speedRaw / 600;
  let change = 0;
  const uChange = gl.getUniformLocation(shaderProgram, 'uChange');

  function render() {
    if (!freeze) {
      // If it is not freezing, then animate the rectangle
      if (change >= 0.5 || change <= -0.5) speed = -speed;
      change = change + speed;
      gl.uniform1f(uChange, change);
    }
    gl.clearColor(0.13, 0.13, 0.13, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const primitive = gl.TRIANGLE_FAN;
    const offset = 0;
    const nVertex = 4;
    gl.drawArrays(primitive, offset, nVertex);
    requestAnimationFrame(render);
  }

  // setInterval(render, 1000 / 60);
  requestAnimationFrame(render);
}

main();
