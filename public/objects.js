
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
    createTopTables();
    createBottomTables();
    createTopMonitors();
    createBottomMonitors();
    createSofa();
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

function createTopTables () {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('dae/table2.dae', function(collada) {
        dae = collada.scene;
        dae.castShadow = true;
        dae.receiveShadow = true;
        dae.position.set(-16, 0, -7);
        dae.scale.set(5, 3, 4);
        scene.add(dae);

    }, onProgress, onError );

    loader.load('dae/table2.dae', function(collada) {
        dae1 = collada.scene;
        dae1.castShadow = true;
        dae1.receiveShadow = true;
        dae1.position.set(-10, 0, -7);
        dae1.scale.set(5, 3, 4);
        scene.add(dae1);
    });

    loader.load('dae/table2.dae', function(collada) {
        dae2 = collada.scene;
        dae2.castShadow = true;
        dae2.receiveShadow = true;
        dae2.position.set(-4, 0, -7);
        dae2.scale.set(5, 3, 4);
        scene.add(dae2);
    });

    loader.load('dae/table2.dae', function(collada) {
        dae3 = collada.scene;
        dae3.castShadow = true;
        dae3.receiveShadow = true;
        dae3.position.set(2, 0, -7);
        dae3.scale.set(5, 3, 4);
        scene.add(dae3);
    });
}

function createBottomTables () {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('dae/table2.dae', function(collada) {
        dae = collada.scene;
        dae.castShadow = true;
        dae.receiveShadow = true;
        dae.position.set(16, 0, 7);
        dae.scale.set(5, 3, 4);
        scene.add(dae);

    }, onProgress, onError );

    loader.load('dae/table2.dae', function(collada) {
        dae1 = collada.scene;
        dae1.castShadow = true;
        dae1.receiveShadow = true;
        dae1.position.set(10, 0, 7);
        dae1.scale.set(5, 3, 4);
        scene.add(dae1);
    });

    loader.load('dae/table2.dae', function(collada) {
        dae2 = collada.scene;
        dae2.castShadow = true;
        dae2.receiveShadow = true;
        dae2.position.set(4, 0, 7);
        dae2.scale.set(5, 3, 4);
        scene.add(dae2);
    });
}

function createTopMonitors () {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('dae/monitor2.dae', function(collada) {
        dae = collada.scene;
        dae.castShadow = true;
        dae.receiveShadow = true;
        dae.position.set(-15, 1.53, -6);
        dae.rotation.y = Math.PI;
        dae.scale.set(3, 3, 3);
        scene.add(dae);
    }, onProgress, onError );

    loader.load('dae/monitor2.dae', function(collada) {
        dae1 = collada.scene;
        dae1.castShadow = true;
        dae1.receiveShadow = true;
        dae1.position.set(-9, 1.53, -6);
        dae1.rotation.y = Math.PI;
        dae1.scale.set(3, 3, 3);
        scene.add(dae1);
    });

    loader.load('dae/monitor2.dae', function(collada) {
        dae2 = collada.scene;
        dae2.castShadow = true;
        dae2.receiveShadow = true;
        dae2.position.set(-3, 1.53, -6);
        dae2.rotation.y = Math.PI;
        dae2.scale.set(3, 3, 3);
        scene.add(dae2);
    });

    loader.load('dae/monitor2.dae', function(collada) {
        dae3 = collada.scene;
        dae3.castShadow = true;
        dae3.receiveShadow = true;
        dae3.position.set(3, 1.53, -6);
        dae3.rotation.y = Math.PI;
        dae3.scale.set(3, 3, 3);
        scene.add(dae3);
    });
}

function createBottomMonitors () {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('dae/monitor2.dae', function(collada) {
        dae = collada.scene;
        dae.castShadow = true;
        dae.receiveShadow = true;
        dae.position.set(15, 1.53, 6);
        dae.scale.set(3, 3, 3);
        scene.add(dae);
    }, onProgress, onError );

    loader.load('dae/monitor2.dae', function(collada) {
        dae1 = collada.scene;
        dae1.castShadow = true;
        dae1.receiveShadow = true;
        dae1.position.set(9, 1.53, 6);
        dae1.scale.set(3, 3, 3);
        scene.add(dae1);
    });

    loader.load('dae/monitor2.dae', function(collada) {
        dae2 = collada.scene;
        dae2.castShadow = true;
        dae2.receiveShadow = true;
        dae2.position.set(3, 1.53, 6);
        dae2.scale.set(3, 3, 3);
        scene.add(dae2);
    });
}

function createSofa () {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('dae/sofa.dae', function(collada) {
        dae = collada.scene;
        dae.castShadow = true;
        dae.receiveShadow = true;
        dae.rotation.y = Math.PI / 2;
        dae.position.set(-17, 0, 17);
        dae.scale.set(0.9, 0.9, 0.9);
        scene.add(dae);
    }, onProgress, onError );

}

var onProgress = function( xhr ) {
    console.log(xhr);
};

var onError = function( xhr ) {
    console.log(xhr);
};


