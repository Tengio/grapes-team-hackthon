
var pos = new THREE.Vector3();
var quat = new THREE.Quaternion();

function initObjects() {
    // Ground
    pos.set( 0, - 0.5, 0 );
    quat.set( 0, 0, 0, 1 );
    
    var ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    ground.castShadow = true;
    ground.receiveShadow = true;
    textureLoader.load( "img/floor.png", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 40, 40 );
        ground.material.map = texture;
        ground.material.needsUpdate = true;
    } );
    createSofa();
    createWalls();
    createTopTables();
    createBottomTables();
    createTopMonitors();
    createBottomMonitors();
    createSoftBall();
    
}

function createSoftBall() {
    var volumeMass = 15;

    var sphereGeometry = new THREE.SphereBufferGeometry( 1.5, 40, 25 );
    sphereGeometry.translate( 5, 5, 0 );
    createSoftVolume( sphereGeometry, volumeMass, 250 );
}

function createSoftVolume( bufferGeom, mass, pressure ) {

    processGeometry( bufferGeom );

    var volume = new THREE.Mesh( bufferGeom, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    volume.castShadow = true;
    volume.receiveShadow = true;
    volume.frustumCulled = false;
    scene.add( volume );

    textureLoader.load( "img/colors.png", function( texture ) {
        volume.material.map = texture;
        volume.material.needsUpdate = true;
    } );

    // Volume physic object

    var volumeSoftBody = softBodyHelpers.CreateFromTriMesh(
        physicsWorld.getWorldInfo(),
        bufferGeom.ammoVertices,
        bufferGeom.ammoIndices,
        bufferGeom.ammoIndices.length / 3,
        true );

    var sbConfig = volumeSoftBody.get_m_cfg();
    sbConfig.set_viterations( 40 );
    sbConfig.set_piterations( 40 );

    // Soft-soft and soft-rigid collisions
    sbConfig.set_collisions( 0x11 );

    // Friction
    sbConfig.set_kDF( 0.1 );
    // Damping
    sbConfig.set_kDP( 0.01 );
    // Pressure
    sbConfig.set_kPR( pressure );
    // Stiffness
    volumeSoftBody.get_m_materials().at( 0 ).set_m_kLST( 0.9 );
    volumeSoftBody.get_m_materials().at( 0 ).set_m_kAST( 0.9 );

    volumeSoftBody.setTotalMass( mass, false )
    Ammo.castObject( volumeSoftBody, Ammo.btCollisionObject ).getCollisionShape().setMargin( margin );
    physicsWorld.addSoftBody( volumeSoftBody, 1, -1 );
    volume.userData.physicsBody = volumeSoftBody;
    // Disable deactivation
    volumeSoftBody.setActivationState( 4 );

    softBodies.push( volume );

}

function processGeometry( bufGeometry ) {

    // Obtain a Geometry
    var geometry = new THREE.Geometry().fromBufferGeometry( bufGeometry );

    // Merge the vertices so the triangle soup is converted to indexed triangles
    var vertsDiff = geometry.mergeVertices();

    // Convert again to BufferGeometry, indexed
    var indexedBufferGeom = createIndexedBufferGeometryFromGeometry( geometry );

    // Create index arrays mapping the indexed vertices to bufGeometry vertices
    mapIndices( bufGeometry, indexedBufferGeom );

}

function mapIndices( bufGeometry, indexedBufferGeom ) {

    // Creates ammoVertices, ammoIndices and ammoIndexAssociation in bufGeometry

    var vertices = bufGeometry.attributes.position.array;
    var idxVertices = indexedBufferGeom.attributes.position.array;
    var indices = indexedBufferGeom.index.array;

    var numIdxVertices = idxVertices.length / 3;
    var numVertices = vertices.length / 3;

    bufGeometry.ammoVertices = idxVertices;
    bufGeometry.ammoIndices = indices;
    bufGeometry.ammoIndexAssociation = [];

    for ( var i = 0; i < numIdxVertices; i++ ) {

        var association = [];
        bufGeometry.ammoIndexAssociation.push( association );

        var i3 = i * 3;

        for ( var j = 0; j < numVertices; j++ ) {

            var j3 = j * 3;
            if ( isEqual( idxVertices[ i3 ], idxVertices[ i3 + 1 ],  idxVertices[ i3 + 2 ],
                        vertices[ j3 ], vertices[ j3 + 1 ], vertices[ j3 + 2 ] ) ) {
                association.push( j3 );
            }

        }

    }

}

function createIndexedBufferGeometryFromGeometry( geometry ) {

    var numVertices = geometry.vertices.length;
    var numFaces = geometry.faces.length;

    var bufferGeom = new THREE.BufferGeometry();
    var vertices = new Float32Array( numVertices * 3 );
    var indices = new ( numFaces * 3 > 65535 ? Uint32Array : Uint16Array )( numFaces * 3 );

    for ( var i = 0; i < numVertices; i++ ) {

        var p = geometry.vertices[ i ];

        var i3 = i * 3;

        vertices[ i3 ] = p.x;
        vertices[ i3 + 1 ] = p.y;
        vertices[ i3 + 2 ] = p.z;

    }

    for ( var i = 0; i < numFaces; i++ ) {

        var f = geometry.faces[ i ];

        var i3 = i * 3;

        indices[ i3 ] = f.a;
        indices[ i3 + 1 ] = f.b;
        indices[ i3 + 2 ] = f.c;

    }

    bufferGeom.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    bufferGeom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

    return bufferGeom;
}

function isEqual( x1, y1, z1, x2, y2, z2 ) {

    var delta = 0.000001;
    return Math.abs( x2 - x1 ) < delta &&
        Math.abs( y2 - y1 ) < delta &&
        Math.abs( z2 - z1 ) < delta;

}


function createWalls() {
    pos.set( 0, 5, 20 );
    var wall = createParalellepiped( 40, 10, 1, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    pos.set( 0, 5, -20 );
    var wall1 = createParalellepiped( 40, 10, 1, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    pos.set( 20, 5, 0 );
    var wall2 = createParalellepiped( 1, 10, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    pos.set( -20, 5, 0 );
    var wall3 = createParalellepiped( 1, 10, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    textureLoader.load( "img/wall.jpg", function( texture ) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 20, 5 );
        wall.material.map = texture;
        wall.material.needsUpdate = true;
        wall1.material.map = texture;
        wall1.material.needsUpdate = true;
        wall2.material.map = texture;
        wall2.material.needsUpdate = true;
        wall3.material.map = texture;
        wall3.material.needsUpdate = true;
    } );
    pos.set( 0, - 0.5, 0 );
    quat.set( 0, 0, 0, 1 );
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


