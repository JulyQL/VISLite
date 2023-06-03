
// Eoap

import Eoap from '../../src/Eoap'

let eoap = new Eoap()
window.JSLitmus.test('Eoap', function () {
    eoap.use(45, 45)
})

// Mercator

import Mercator from '../../src/Mercator'

let mercator = new Mercator()
window.JSLitmus.test('Mercator', function () {
    mercator.use(45, 45)
})

// rotate

import rotate from "../../src/rotate"

window.JSLitmus.test('rotate', function () {
    rotate(0, 0, Math.PI, 1, 0)
})

// Matrix4

import Matrix4 from "../../src/Matrix4/index"

let matrix1 = new Matrix4()
window.JSLitmus.test('Matrix4 / rotate', function () {
    matrix1.rotate(Math.PI / 2, 2, 1)
})

let matrix2 = new Matrix4()
window.JSLitmus.test('Matrix4 / scale', function () {
    matrix2.scale(1, 2, 7, 3, 4, 1)
})

let matrix3 = new Matrix4()
window.JSLitmus.test('Matrix4 / move', function () {
    matrix3.move(5, 3, 4)
})

window.JSLitmus.test('Matrix4 / 新建+value()', function () {
    new Matrix4().value()
})

// assemble

import assemble from "../../src/common/assemble"

let assembleFun1 = assemble(0, 1, 0.2, 3)
window.JSLitmus.test('assemble 0-1', function () {
    assembleFun1()
})

let assembleFun2 = assemble(0, 255, 1, 3)
window.JSLitmus.test('assemble 0-255', function () {
    assembleFun2()
})

// WebGL相关

import ShaderObject from '../../src/common/webgl/shader'
import getWebGLContext from '../../src/common/webgl/getWebGLContext'

let vertexShader = `
attribute vec4 a_position;

uniform mat4 u_matrix_world;
uniform mat4 u_matrix_mesh;
uniform mat4 u_matrix_proporion;

attribute vec2 a_textcoord;
varying vec2 v_textcoord;

void main(){
    gl_Position = u_matrix_world * u_matrix_proporion * u_matrix_mesh * a_position;

    v_textcoord = a_textcoord;
}
`

let fragmentShader = `
precision mediump float;

uniform samplerCube u_texture;

uniform sampler2D u_sampler;varying vec2 v_textcoord;

void main(){
    gl_FragColor = texture2D(u_sampler,v_textcoord);
}
`;

let gl = getWebGLContext(document.getElementById('mywebgl') as HTMLCanvasElement, 4)

window.JSLitmus.test('WebGL / 着色器', function () {
    new ShaderObject(gl).compile(vertexShader, fragmentShader).use()
})

let shader = new ShaderObject(gl).compile(vertexShader, fragmentShader)

window.JSLitmus.test('WebGL / 着色器.use()', function () {
    shader.use()
})

window.JSLitmus.test('WebGL / new Float32Array()', function () {
    new Float32Array([
        0.7, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.7, 0, 0.7
    ])
})

import BufferObject from '../../src/common/webgl/buffer'
window.JSLitmus.test('WebGL / new BufferObject()', function () {
    new BufferObject(gl)
})

import TextureObject from '../../src/common/webgl/texture'

window.JSLitmus.test('WebGL / new TextureObject(gl,"cube")', function () {
    new TextureObject(gl, 'cube')
})
window.JSLitmus.test('WebGL / new TextureObject(gl,"2d")', function () {
    new TextureObject(gl, '2d')
})