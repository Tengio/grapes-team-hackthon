
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();

function initObjects() {
    // Ground
    pos.set( 0, - 0.5, 0 );
    quat.set( 0, 0, 0, 1 );
    var ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    ground.castShadow = true;
    ground.receiveShadow = true;
    textureLoader.load( "img/grid.png", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 40, 40 );
        ground.material.map = texture;
        ground.material.needsUpdate = true;
    } );
    createTable();
}


function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {
    var threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( margin );
    createRigidBody( threeObject, shape, mass, pos, quat );
    return threeObject;
}

function createRigidBody( threeObject, physicsShape, mass, pos, quat ) {
    threeObject.position.copy( pos );
    threeObject.quaternion.copy( quat );
    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    var motionState = new Ammo.btDefaultMotionState( transform );
    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    physicsShape.calculateLocalInertia( mass, localInertia );
    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );
    threeObject.userData.physicsBody = body;
    scene.add( threeObject );
    if ( mass > 0 ) {
        rigidBodies.push( threeObject );
        // Disable deactivation
        body.setActivationState( 4 );
    }
    physicsWorld.addRigidBody( body );
    return body;
}

function createTable () {
    // var manager = new THREE.LoadingManager();
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('dae/table2.dae', function(collada) {
        dae = collada.scene;
        dae.castShadow = true;
        dae.receiveShadow = true;

        dae.position.set(10, 0, 0);
           //dae.rotation.y = 45;
        dae.scale.set(3, 3, 3);
        scene.add(dae);

    }, onProgress, onError );

    loader.load('dae/table2.dae', function(collada) {
        dae1 = collada.scene;
        dae1.castShadow = true;
        dae1.receiveShadow = true;
        dae1.position.set(6, 0, 0);
        dae1.scale.set(3, 3, 3);
        scene.add(dae1);
    });
}

var onProgress = function( xhr ) {
    console.log(xhr);
};

var onError = function( xhr ) {
    console.log(xhr);
};


