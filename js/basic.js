import * as THREE from 'https://cdn.skypack.dev/three@0.129';
//import * as THREE from 'three';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import { BufferGeometryUtils } from "//cdn.skypack.dev/three@0.129.0/examples/jsm/utils/BufferGeometryUtils?min";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129/examples/jsm/loaders/GLTFLoader";
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const canvasContainer = document.querySelector('.yachtCanvas');
const scoreboardContainer = document.querySelector(".scoreboard");
const rollBtn = document.querySelector("#roll-btn");

const gltfLoader = new GLTFLoader();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

//const scoreResult = document.querySelector('#score-result');
//const rollBtn = document.querySelector('#roll-btn');

let renderer, scene, camera, diceMesh, physicsWorld;

const params = {
    numberOfDice: 5,
    segments: 40,
    edgeRadius: .07,
    notchRadius: .12,
    notchDepth: .1,
};

const diceArray = [];
let numArray = [];
let boxMeshs = [];

initPhysics();
initScene();

window.addEventListener('resize', updateSceneSize);
window.addEventListener( 'click', onMouseClick );

//window.addEventListener('dblclick', throwDice);
//rollBtn.addEventListener('click', throwDice);

function initScene() {

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: canvasContainer
    });
    renderer.setSize(canvasContainer.clientWidth, scoreboardContainer.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 1000)

    camera.position.set(0, 20, -30);

    const orbit = new OrbitControls(camera, renderer.domElement);

    orbit.update();

    updateSceneSize();

    const ambientLight = new THREE.AmbientLight(0xffffff,0.8);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, 1.1);
    topLight.position.set(10, 15, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 5;
    topLight.shadow.camera.far = 400;

    scene.add(topLight);

    createFloor();
    //createDiceBox();
    diceMesh = createDiceMesh();
    for (let i = 0; i < params.numberOfDice; i++) {
        diceArray.push(createDice());
        addDiceEvents(diceArray[i],i);
    }

    //throwDice();

    gltfLoader.load('models/YachtBox2.glb', function (gltf) {
        const box = gltf.scene.children[0];

        gltf.scene.position.set(0,-2,0);
        box.scale.set(2,2,2);
        box.castShadow = true;

        console.log(gltf);
        scene.add(gltf.scene);
    });


    //const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFF00, wireframe : false, transparent : false, opacity : 0});
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF});
    const boxWall1 = new THREE.Mesh(new THREE.BoxGeometry(13,0,13), new THREE.MeshStandardMaterial({ color: 0xFFFFFF})); // 바닥
    const boxWall2 = new THREE.Mesh(createBoxWallGeometry(), new THREE.MeshStandardMaterial({ color: 0xFFFFFF})); // 왼쪽벽
    const boxWall3 = new THREE.Mesh(createBoxWallGeometry(), new THREE.MeshStandardMaterial({ color: 0xFFFFFF})); // 오른쪽벽
    const boxWall4 = new THREE.Mesh(createBoxWallGeometry(), new THREE.MeshStandardMaterial({ color: 0xFFFFFF})); // 위쪽벽
    const boxWall5 = new THREE.Mesh(createBoxWallGeometry(), new THREE.MeshStandardMaterial({ color: 0xFFFFFF})); // 아래쪽벽

    boxWall2.rotation.y = Math.PI / 2;
    boxWall3.rotation.y = Math.PI / 2;
    boxWall2.position.x = 7;
    boxWall3.position.x = -7;
    boxWall4.position.z = 5.6;
    boxWall5.position.z = -5.6;

    /*boxMeshs = new THREE.Group();
    boxMeshs.add(boxWall1, boxWall2, boxWall3, boxWall4,boxWall5);
    scene.add(boxMeshs);*/

    scene.add(boxWall1);
    scene.add(boxWall2);
    scene.add(boxWall3);
    scene.add(boxWall4);
    scene.add(boxWall5);


    const boxBody1 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(13,0,13)),
    });
    const boxBody2 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(12,10,1)),
    });
    const boxBody3 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(12,10,1)),
    });
    const boxBody4 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(12,10,1)),
    });
    const boxBody5 = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Box(new CANNON.Vec3(12,10,1)),
    });
    boxBody1.position.copy(boxWall1.position);
    boxBody1.quaternion.copy(boxWall1.quaternion);
    boxBody2.position.copy(boxWall2.position);
    boxBody2.quaternion.copy(boxWall2.quaternion);
    boxBody3.position.copy(boxWall3.position);
    boxBody3.quaternion.copy(boxWall3.quaternion);
    boxBody4.position.copy(boxWall4.position);
    boxBody4.quaternion.copy(boxWall4.quaternion);
    boxBody5.position.copy(boxWall5.position);
    boxBody5.quaternion.copy(boxWall5.quaternion);

    physicsWorld.addBody(boxBody1);
    physicsWorld.addBody(boxBody2);
    physicsWorld.addBody(boxBody3);
    physicsWorld.addBody(boxBody4);
    physicsWorld.addBody(boxBody5);


    render();

}

function onMouseClick( event ) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (( event.clientX / window.innerWidth)) * 2 - 1;
    pointer.y = - (( event.clientY / window.innerHeight )) * 2 + 1;


    raycaster.setFromCamera( pointer, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);
    intersects.forEach( obj => obj.object.position.x = 10 );


    for ( var i = 0; i < intersects.length; i++ ) {
        console.log( intersects[ i ] );

    }

    //console.log(pointer);

}


function initPhysics() {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -50, 0),
    })
    physicsWorld.defaultContactMaterial.restitution = 0.3;
    physicsWorld.defaultContactMaterial.friction = 0.5;
}

function createFloor() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(500, 500),
        new THREE.MeshStandardMaterial({
            color : 0x808080,

        })
    )
    floor.receiveShadow = true;
    floor.position.y = -1;
    floor.position.z = -5;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
    scene.add(floor);

    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);
}


function createBoxWallGeometry() {
    const boxWidth = 12;
    const boxHeight = 5;
    const boxDepth = 2;
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    return boxGeometry;
}



function createDiceMesh() {
    const boxMaterialOuter = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
    })
    const boxMaterialInner = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0,
        metalness: 1,
        side: THREE.DoubleSide
    })

    const diceMesh = new THREE.Group();
    const innerMesh = new THREE.Mesh(createInnerGeometry(), boxMaterialInner);
    const outerMesh = new THREE.Mesh(createBoxGeometry(), boxMaterialOuter);
    outerMesh.castShadow = true;
    diceMesh.add(innerMesh, outerMesh);

    return diceMesh;
}

function createDice() {
    const mesh = diceMesh.clone();
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
        sleepTimeLimit: .1
    });
    physicsWorld.addBody(body);

    return {mesh, body};
}

function createBoxGeometry() {

    let boxGeometry = new THREE.BoxGeometry(1, 1, 1, params.segments, params.segments, params.segments);

    const positionAttr = boxGeometry.attributes.position;
    const subCubeHalfSize = .5 - params.edgeRadius;


    for (let i = 0; i < positionAttr.count; i++) {

        let position = new THREE.Vector3().fromBufferAttribute(positionAttr, i);

        const subCube = new THREE.Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
        const addition = new THREE.Vector3().subVectors(position, subCube);

        if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.normalize().multiplyScalar(params.edgeRadius);
            position = subCube.add(addition);
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.y) > subCubeHalfSize) {
            addition.z = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.y = subCube.y + addition.y;
        } else if (Math.abs(position.x) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.y = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.z = subCube.z + addition.z;
        } else if (Math.abs(position.y) > subCubeHalfSize && Math.abs(position.z) > subCubeHalfSize) {
            addition.x = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.y = subCube.y + addition.y;
            position.z = subCube.z + addition.z;
        }

        const notchWave = (v) => {
            v = (1 / params.notchRadius) * v;
            v = Math.PI * Math.max(-1, Math.min(1, v));
            return params.notchDepth * (Math.cos(v) + 1.);
        }
        const notch = (pos) => notchWave(pos[0]) * notchWave(pos[1]);

        const offset = .23;

        if (position.y === .5) {
            position.y -= notch([position.x, position.z]);
        } else if (position.x === .5) {
            position.x -= notch([position.y + offset, position.z + offset]);
            position.x -= notch([position.y - offset, position.z - offset]);
        } else if (position.z === .5) {
            position.z -= notch([position.x - offset, position.y + offset]);
            position.z -= notch([position.x, position.y]);
            position.z -= notch([position.x + offset, position.y - offset]);
        } else if (position.z === -.5) {
            position.z += notch([position.x + offset, position.y + offset]);
            position.z += notch([position.x + offset, position.y - offset]);
            position.z += notch([position.x - offset, position.y + offset]);
            position.z += notch([position.x - offset, position.y - offset]);
        } else if (position.x === -.5) {
            position.x += notch([position.y + offset, position.z + offset]);
            position.x += notch([position.y + offset, position.z - offset]);
            position.x += notch([position.y, position.z]);
            position.x += notch([position.y - offset, position.z + offset]);
            position.x += notch([position.y - offset, position.z - offset]);
        } else if (position.y === -.5) {
            position.y += notch([position.x + offset, position.z + offset]);
            position.y += notch([position.x + offset, position.z]);
            position.y += notch([position.x + offset, position.z - offset]);
            position.y += notch([position.x - offset, position.z + offset]);
            position.y += notch([position.x - offset, position.z]);
            position.y += notch([position.x - offset, position.z - offset]);
        }

        positionAttr.setXYZ(i, position.x, position.y, position.z);
    }

    boxGeometry.deleteAttribute('normal');
    boxGeometry.deleteAttribute('uv');
    boxGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);

    boxGeometry.computeVertexNormals();

    return boxGeometry;
}


function createInnerGeometry() {
    const baseGeometry = new THREE.PlaneGeometry(1 - 2 * params.edgeRadius, 1 - 2 * params.edgeRadius);
    const offset = .48;
    return BufferGeometryUtils.mergeBufferGeometries([
        baseGeometry.clone().translate(0, 0, offset),
        baseGeometry.clone().translate(0, 0, -offset),
        baseGeometry.clone().rotateX(.5 * Math.PI).translate(0, -offset, 0),
        baseGeometry.clone().rotateX(.5 * Math.PI).translate(0, offset, 0),
        baseGeometry.clone().rotateY(.5 * Math.PI).translate(-offset, 0, 0),
        baseGeometry.clone().rotateY(.5 * Math.PI).translate(offset, 0, 0),
    ], false);
}


function addDiceEvents(dice, i) {
    dice.body.addEventListener('sleep', (e) => {

        dice.body.allowSleep = false;

        const euler = new CANNON.Vec3();
        e.target.quaternion.toEuler(euler);

        const eps = .1;
        let isZero = (angle) => Math.abs(angle) < eps;
        let isHalfPi = (angle) => Math.abs(angle - .5 * Math.PI) < eps;
        let isMinusHalfPi = (angle) => Math.abs(.5 * Math.PI + angle) < eps;
        let isPiOrMinusPi = (angle) => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);


        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                //showRollResults(1);
                numArray[i] = 1;
                console.log(numArray[i]);
            } else if (isHalfPi(euler.x)) {
                //showRollResults(4);
                numArray[i] = 4;
                console.log(numArray[i]);
            } else if (isMinusHalfPi(euler.x)) {
                //showRollResults(3);
                numArray[i] = 3;
                console.log(numArray[i]);
            } else if (isPiOrMinusPi(euler.x)) {
                //showRollResults(6);
                numArray[i] = 6;
                console.log(numArray[i]);
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
            //showRollResults(2);
            numArray[i] = 2;
            console.log(numArray[i]);
        } else if (isMinusHalfPi(euler.z)) {
            //showRollResults(5);
            numArray[i] = 5;
            console.log(numArray[i]);
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    });
}


function showRollResults(score) {
    if (scoreResult.innerHTML === '') {
        scoreResult.innerHTML += score;
    } else {
        scoreResult.innerHTML += ('+' + score);
    }
}

function render() {
    physicsWorld.fixedStep();




    for (const dice of diceArray) {
        dice.mesh.position.copy(dice.body.position)
        dice.mesh.quaternion.copy(dice.body.quaternion)

    }

    // update the picking ray with the camera and pointer position




    renderer.render(scene, camera);
    requestAnimationFrame(render);
}



function updateSceneSize() {
    camera.aspect = canvasContainer.clientWidth / scoreboardContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, scoreboardContainer.clientHeight);
}

function throwDice() {
    scoreResult.innerHTML = '';

    diceArray.forEach((d, dIdx) => {

        d.body.velocity.setZero();
        d.body.angularVelocity.setZero();

        d.body.position = new CANNON.Vec3(6, dIdx * 1.5, 0);
        d.mesh.position.copy(d.body.position);

        d.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random())
        d.body.quaternion.copy(d.mesh.quaternion);

        const force = 3 + 5 * Math.random();
        d.body.applyImpulse(
            new CANNON.Vec3(-force, force, 0),
            new CANNON.Vec3(0, 0, .2)
        );

        d.body.allowSleep = true;
    });
}

