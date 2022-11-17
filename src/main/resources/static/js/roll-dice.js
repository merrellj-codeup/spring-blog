import * as THREE from "three"; // THE MAIN LIBRARY FOR WEBGL
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // FOR CAMERA CONTROL
import CANNON from "cannon";
import * as threeJsDice from "threejs-dice";
// import { DiceManager, DiceD20 } from "threejs-dice";
import Stats from "three/examples/jsm/libs/stats.module";

console.dir(CANNON);
console.dir(threeJsDice);
const DiceManager = threeJsDice.DiceManager;
const DiceD20 = threeJsDice.DiceD20;

// standard global variables
var container,
    scene,
    camera,
    renderer,
    controls,
    stats,
    world,
    dice = [];

init();

// FUNCTIONS
function init() {
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 20,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 1,
        FAR = SCREEN_HEIGHT * 1.3;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 100, 0);
    // camera.position.z = SCREEN_HEIGHT
    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);
    // EVENTS
    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    // STATS
    stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.bottom = "0px";
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    let ambient = new THREE.AmbientLight("#ffffff", 0.3);
    scene.add(ambient);

    let directionalLight = new THREE.DirectionalLight("#ffffff", 0.5);
    directionalLight.position.x = -1000;
    directionalLight.position.y = 1000;
    directionalLight.position.z = 1000;
    scene.add(directionalLight);

    let light = new THREE.SpotLight(0xefdfd5, 1.3);
    light.position.y = 100;
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.camera.near = 50;
    light.shadow.camera.far = 110;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);

    // FLOOR
    var floorMaterial = new THREE.MeshPhongMaterial({
        color: "#000",
        side: THREE.DoubleSide
    });
    var floorGeometry = new THREE.PlaneGeometry(500, 500, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    // SKYBOX/FOG
    var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    var skyBoxMaterial = new THREE.MeshPhongMaterial({
        color: 0x9999ff,
        side: THREE.BackSide
    });
    var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);
    scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

    ////////////
    // CUSTOM //
    ////////////
    world = new CANNON.World();

    world.gravity.set(0, -9.82 * 20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 16;

    DiceManager.setWorld(world);

    //Floor
    let floorBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Plane(),
        material: DiceManager.floorBodyMaterial
    });
    floorBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(1, 0, 0),
        -Math.PI / 2
    );
    world.add(floorBody);

    //Walls
    for (var i = 0; i < 5; i++) {
        var die = new DiceD20({
            size: 2,
            backColor: "#fff",
            fontColor: "#000"
        });
        scene.add(die.getObject());
        dice.push(die);
    }

    function randomDiceThrow() {
        var diceValues = [];

        for (var i = 0; i < dice.length; i++) {
            let randomnumber = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
            let yRand = Math.random() * 20;
            dice[i].getObject().position.x = -15 - (i % 3) * 1.5;
            dice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
            dice[i].getObject().position.z = -15 + (i % 3) * 1.5;
            dice[i].getObject().quaternion.x =
                ((Math.random() * 90 - 45) * Math.PI) / 180;
            dice[i].getObject().quaternion.z =
                ((Math.random() * 90 - 45) * Math.PI) / 180;
            dice[i].updateBodyFromMesh();
            let rand = Math.random() * 5;
            dice[i]
                .getObject()
                .body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
            dice[i]
                .getObject()
                .body.angularVelocity.set(
                20 * Math.random() - 10,
                20 * Math.random() - 10,
                20 * Math.random() - 10
            );

            diceValues.push({ dice: dice[i], value: randomnumber });
        }

        DiceManager.prepareValues(diceValues);
    }

    document
        .querySelector("#roll")
        .addEventListener("click", clickRoll);
    // setInterval(randomDiceThrow, 3000);

    function clickRoll() {
        var elem = document.querySelector('#guess-wrapper');
        elem.style.display = 'none';
        randomDiceThrow();
    };

    requestAnimationFrame(animate);
}

function animate() {
    updatePhysics();
    render();
    update();

    requestAnimationFrame(animate);
}

function updatePhysics() {
    world.step(1.0 / 60.0);

    for (var i in dice) {
        dice[i].updateMeshFromBody();
    }
}

function update() {
    controls.update();
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}
