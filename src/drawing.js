var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
camera.position.set(13, 25, 38);
camera.lookAt(scene.position);
var canvas = document.getElementById('threecanvas');

var renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: canvas
});


var controls = new THREE.OrbitControls(camera, renderer.domElement);

var fsr_1_geometry = new THREE.CylinderBufferGeometry(2, 5, 5, 16, 4, false);
var fsr_2_geometry = new THREE.CylinderBufferGeometry(2, 5, 0, 16, 4, false);
fsr_1_geometry.computeBoundingBox();
fsr_2_geometry.computeBoundingBox();
var material = new THREE.ShaderMaterial({
    uniforms: {
        color1: {
            value: new THREE.Color("green")
        },
        color2: {
            value: new THREE.Color("red")
        },
        bboxMin: {
            value: fsr_1_geometry.boundingBox.min
        },
        bboxMax: {
            value: fsr_1_geometry.boundingBox.max
        }
    },
    vertexShader: `
    uniform vec3 bboxMin;
    uniform vec3 bboxMax;
  
    varying vec2 vUv;

    void main() {
      vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 color1;
    uniform vec3 color2;
  
    varying vec2 vUv;
    
    void main() {
      
      gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
    }
  `,
    wireframe: true
});
var fsr_1_mesh = new THREE.Mesh(fsr_1_geometry, material);
var fsr_2_mesh = new THREE.Mesh(fsr_2_geometry, material);
fsr_1_mesh.position.set(-10, 0, -10);
fsr_2_mesh.position.set(10, 0, 10);
scene.add(fsr_1_mesh);
scene.add(fsr_2_mesh);


render();

function resize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    if (resize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}