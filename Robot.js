const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

// shaders
const vertexShaderSource = `
attribute vec4 aPosition;
attribute vec2 aTexCoord;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying highp vec2 vTexCoord;
void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
  vTexCoord = aTexCoord;
}
`;

const fragmentShaderSource = `
precision mediump float;
varying highp vec2 vTexCoord;
uniform sampler2D uSampler;
void main(void) {
  gl_FragColor = texture2D(uSampler, vTexCoord);
}
`;

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    console.error(gl.getShaderInfoLog(shader));
  return shader;
}
const vs = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fs = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create program
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);


let isIsometric = false;
function getCameraMatrix() {
  let mvMatrix = mat4.create();
  if (isIsometric)
    mat4.rotateX(mvMatrix, mvMatrix, 45 * Math.PI / 180),
    mat4.rotateY(mvMatrix, mvMatrix, 45 * Math.PI / 180),
    mat4.rotateZ(mvMatrix, mvMatrix, 45 * Math.PI / 180);
  return mvMatrix;
}


function drawCube(x, y, z, scale, texture) {
 
}

let textures = [];
let currentTexture = 0;

function loadTexture(url) {
  const tex = gl.createTexture();
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  img.src = url;
  return tex;
}

textures.push(loadTexture("textures/metal.jpg"));
textures.push(loadTexture("textures/rust.jpg"));
textures.push(loadTexture("textures/chrome.jpg"));

// ====== Key Controls ======
document.addEventListener("keydown", (e) => {
  if (e.key === "c" || e.key === "C") {
    currentTexture = (currentTexture + 1) % textures.length;
  } else if (e.key === "v" || e.key === "V") {
    isIsometric = !isIsometric;
  }
});

function drawScene() {
  gl.clearColor(0.1, 0.1, 0.1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, 45, canvas.width / canvas.height, 0.1, 100.0);

  const mvMatrix = getCameraMatrix();
  mat4.translate(mvMatrix, mvMatrix, [0, 0, -6]);

  gl.bindTexture(gl.TEXTURE_2D, textures[currentTexture]);

  drawCube(0, 0, 0, 1.0);   // chest
  drawCube(0, 1.2, 0, 0.6); // head
  drawCube(-0.8, 0, 0, 0.4); // left arm
  drawCube(0.8, 0, 0, 0.4);  // right arm
  drawCube(-0.3, -1.2, 0, 0.4); // left leg
  drawCube(0.3, -1.2, 0, 0.4);  // right leg

  requestAnimationFrame(drawScene);
}
drawScene();
