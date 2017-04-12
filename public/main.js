var scene = new THREE.Scene();
var animationId;
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xffffff, 100 );
document.body.appendChild( renderer.domElement );
camera.position.set(0, 1.6, 500);
camera.lookAt(new THREE.Vector3(0, 1.6, 0));