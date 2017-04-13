// if ( ! Detector.webgl ) {
    // Detector.addGetWebGLMessage();
    // document.getElementById('container').innerHTML = "";
// }


var container, stats;
var camera, controls, scene, renderer;
var textureLoader;
var margin = 0.05;
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var physicsWorld;
var gravityConstant = -9.8;
var mouseCoords = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var clickRequest = false;
var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );
var rigidBodies = [];
var softBodies = [];
var transformAux1 = new Ammo.btTransform();
var softBodyHelpers = new Ammo.btSoftBodyHelpers();

function init() {
    initGraphics();
	initPhysics();
	initObjects();
	initInput();
}

function initPhysics() {
    collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    broadphase = new Ammo.btDbvtBroadphase();
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
    physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
    physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
}

function initInput() {
    window.addEventListener( 'mousedown', function( event ) {
        if ( ! clickRequest ) {
            mouseCoords.set(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1
            );
            clickRequest = true;
        }
    }, false );
}

function processClick() {
    if ( clickRequest ) {
        var pos = new THREE.Vector3();
        raycaster.setFromCamera( mouseCoords, camera );
        // Creates a ball
        var ballMass = 3;
        var ballRadius = 0.4;
        var ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 18, 16 ), ballMaterial );
        ball.castShadow = true;
        ball.receiveShadow = true;
        var ballShape = new Ammo.btSphereShape( ballRadius );
        ballShape.setMargin( margin );
        pos.copy( raycaster.ray.direction );
        pos.add( raycaster.ray.origin );
        quat.set( 0, 0, 0, 1 );
        var ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );
        ballBody.setFriction( 0.5 );
        pos.copy( raycaster.ray.direction );
        pos.multiplyScalar( 14 );
        ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        clickRequest = false;
    }
}

function initGraphics() {
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );
    scene = new THREE.Scene();

    camera.position.x = -7;
    camera.position.y = 5;
    camera.position.z =  8;

    controls = new THREE.OrbitControls( camera );
    controls.target.y = 2;

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    textureLoader = new THREE.TextureLoader();

    var ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add( ambientLight );

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( -10, 10, 5 );
    light.castShadow = true;
    var d = 20;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    scene.add( light );

    //container.innerHTML = "";
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}


function render() {
    var deltaTime = clock.getDelta();
    updatePhysics( deltaTime );
    processClick();
    controls.update( deltaTime );
    renderer.render( scene, camera );
}

function checkForSuccess(volume) {
    var position = volume.geometry.center()
    console.log(position);
    if(position.x > 14 && position.x<16) {
        if(position.z > 14 && position.z<16) {
            console.log("success");
            document.getElementById( 'score-board' ).innerHTML = "YOU WIN!";
        }
    }
    if(position.x < -14 && position.x > -16) {
        if(position.z < -14 && position.z > -16) {
            console.log("success");
            document.getElementById( 'score-board' ).innerHTML = "YOU WIN!";
        }
    }
    if(position.x > 14 && position.x<16) {
        if(position.z < -14 && position.z > -16) {
            console.log("success");
            document.getElementById( 'score-board' ).innerHTML = "YOU WIN!";
        }
    }
    if(position.x < -14 && position.x > -16) {
        if(position.z > 14 && position.z < 16) {
            console.log("success");
            document.getElementById( 'score-board' ).innerHTML = "YOU WIN!";
        }
    }
}

function updatePhysics(deltaTime) {
    // Step world
	physicsWorld.stepSimulation( deltaTime, 10 );

    checkForSuccess(softBodies[0]);
    

    // Update soft volumes
    for ( var i = 0, il = softBodies.length; i < il; i++ ) {
        var volume = softBodies[ i ];
        var geometry = volume.geometry;
        var softBody = volume.userData.physicsBody;
        var volumePositions = geometry.attributes.position.array;
        var volumeNormals = geometry.attributes.normal.array;
        var association = geometry.ammoIndexAssociation;
        var numVerts = association.length;
        var nodes = softBody.get_m_nodes();
        for ( var j = 0; j < numVerts; j ++ ) {

            var node = nodes.at( j );
            var nodePos = node.get_m_x();
            var x = nodePos.x();
            var y = nodePos.y();
            var z = nodePos.z();
            var nodeNormal = node.get_m_n();
            var nx = nodeNormal.x();
            var ny = nodeNormal.y();
            var nz = nodeNormal.z();

            var assocVertex = association[ j ];

            for ( var k = 0, kl = assocVertex.length; k < kl; k++ ) {
                var indexVertex = assocVertex[ k ];
                volumePositions[ indexVertex ] = x;
                volumeNormals[ indexVertex ] = nx;
                indexVertex++;
                volumePositions[ indexVertex ] = y;
                volumeNormals[ indexVertex ] = ny;
                indexVertex++;
                volumePositions[ indexVertex ] = z;
                volumeNormals[ indexVertex ] = nz;
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;

    }

    // Update rigid bodies
    for ( var i = 0, il = rigidBodies.length; i < il; i++ ) {
        var objThree = rigidBodies[ i ];
        var objPhys = objThree.userData.physicsBody;
        var ms = objPhys.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( transformAux1 );
            var p = transformAux1.getOrigin();
            var q = transformAux1.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

init();
animate();