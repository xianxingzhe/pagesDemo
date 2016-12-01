/**
 *
 * Nebula by Felix Turner
 * www.airtight.cc
 *
 */
//vars
var container, stats, camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color, sprite, size, mouseX = 0, mouseY = 0, colors = [], stars = [], webGLSizeIndex = 1, beamGroup, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, material, //consts
 PARTICLE_COUNT = 300, BEAM_COUNT = 40, MAX_DISTANCE = 1000, STAR_ROT_SPEED = 0.01, BEAM_ROT_SPEED = 0.003, WEBGL_WIDTH = 900, WEBGL_HEIGHT = 500;

//var webGLSizes = [{width:"640px",height:"350px"},{width:"900px",height:"500px"},{width:"100%",height:"100%"}];
var webGLSizes = [{
    width: 640,
    height: 350
}, {
    width: 900,
    height: 500
}, {
    width: "100%",
    height: "100%"
}];


if (!Detector.webgl) 
    Detector.addGetWebGLMessage({
        parent: document.getElementById("container")
    });

/**
 * Star Class handles movement of particles
 */
function Star(){
    this.posn = new THREE.Vector3();
    this.init();
}

Star.MAX_SPEED = 20;
Star.ORIGIN = new THREE.Vector3();

//returns random number within a range
Star.prototype.getRand = function(minVal, maxVal){
    return minVal + (Math.random() * (maxVal - minVal));
}

Star.prototype.init = function(){
    this.posn.copy(Star.ORIGIN);
    this.speed = new THREE.Vector3(this.getRand(-Star.MAX_SPEED, Star.MAX_SPEED), this.getRand(-Star.MAX_SPEED, Star.MAX_SPEED), this.getRand(-Star.MAX_SPEED, Star.MAX_SPEED));
}

Star.prototype.update = function(){
    this.posn = this.posn.addSelf(this.speed);
    //reset if out of sphere
    if (this.posn.distanceTo(Star.ORIGIN) > MAX_DISTANCE) {
        this.init();
    }
}

/**
 * Initialize
 */
function init(){

    // stop the user getting a text cursor
    document.onselectstart = function(){
        return false;
    };
    
    container = document.getElementById("container");
    document.body.appendChild(container);
    
    //init camera
    camera = new THREE.Camera(75, WEBGL_WIDTH / WEBGL_HEIGHT, 1, 3000);
    camera.position.z = 1000;
    
    scene = new THREE.Scene();
    
    //init Particles
    geometry = new THREE.Geometry();
    //create one shared material
    var sprite = THREE.ImageUtils.loadTexture("img/particle.png");
    material = new THREE.ParticleBasicMaterial({
        size: 380,
        map: sprite,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true //allows 1 color per particle
    });
    //create particles
    for (i = 0; i < PARTICLE_COUNT; i++) {
        geometry.vertices.push(new THREE.Vertex());
        colors[i] = new THREE.Color();
        colors[i].setHSV(Math.random(), 1.0, 1.0);
        stars.push(new Star());
        geometry.vertices[i] = new THREE.Vertex(stars[i].posn);
    }
    
    geometry.colors = colors;
    
    //init particle system
    particles = new THREE.ParticleSystem(geometry, material);
    particles.sortParticles = false;
    scene.addObject(particles);
    
    //init Sun Beams
    var i;
    var beamGeometry = new THREE.PlaneGeometry(5000, 50, 1, 1);
    beamGroup = new THREE.Object3D();
    
    for (i = 0; i < BEAM_COUNT; ++i) {
    
        //create one material per beam
        var beamMaterial = new THREE.MeshBasicMaterial({
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthTest: false,
        });
        beamMaterial.color = new THREE.Color();
        beamMaterial.color.setHSV(Math.random(), 1.0, 1.0);
        //create a beam
        beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.doubleSided = true;
        beam.rotation.x = Math.random() * Math.PI;
        beam.rotation.y = Math.random() * Math.PI;
        beam.rotation.z = Math.random() * Math.PI;
        beamGroup.addChild(beam);
    }
    
    scene.addObject(beamGroup);
    
    //init renderer
    renderer = new THREE.WebGLRenderer({
        antialias: false,
        clearAlpha: 1
    });
    renderer.setSize(WEBGL_WIDTH, WEBGL_HEIGHT);
    renderer.sortElements = false;
    renderer.sortObjects = false;
    container.appendChild(renderer.domElement);
    
    //init stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.getElementById("stage").appendChild(stats.domElement);
    
    //init mouse listeners
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    container.addEventListener('click', onDocumentClick, false);
    $(window).mousewheel(function(event, delta){
        setSize(delta);
    });
    
    animate();
}

function onDocumentClick(event){
    for (i = 0; i < PARTICLE_COUNT; i++) {
        stars[i].init();
    }
}

function onDocumentMouseMove(event){
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function animate(){
    requestAnimationFrame(animate); //requestAnimationFrame is more polite way to ask for system resources
    render();
    stats.update();
}

function render(){

    particles.rotation.x += STAR_ROT_SPEED;
    particles.rotation.y += STAR_ROT_SPEED;
    
    beamGroup.rotation.x += BEAM_ROT_SPEED;
    beamGroup.rotation.y += BEAM_ROT_SPEED;
    
    camera.position.x += (mouseX - camera.position.x) * 0.3;
    camera.position.y += (-mouseY - camera.position.y) * 0.3;
    
    for (i = 0; i < PARTICLE_COUNT; i++) {
        stars[i].update();
    }
    
    geometry.__dirtyVertices = true;
    renderer.render(scene, camera);
    
}

function setSize(delta){

    var bigger = delta > 0;
    
    if (bigger) {
        webGLSizeIndex++;
    }
    else {
        webGLSizeIndex--;
    }
    
    if (webGLSizeIndex >= webGLSizes.length) 
        webGLSizeIndex = webGLSizes.length - 1;
    if (webGLSizeIndex <= 0) 
        webGLSizeIndex = 0;
    
    WEBGL_WIDTH = webGLSizes[webGLSizeIndex].width;
    WEBGL_HEIGHT = webGLSizes[webGLSizeIndex].height;
    
    if (WEBGL_WIDTH === "100%") {
        WEBGL_WIDTH = window.innerWidth;
        WEBGL_HEIGHT = window.innerHeight;
    }
    
    renderer.setSize(WEBGL_WIDTH, WEBGL_HEIGHT);
    
    var contDiv = document.getElementById("container");
    contDiv.style.width = WEBGL_WIDTH + "px";
    contDiv.style.height = WEBGL_HEIGHT + "px";
    
    //reposition div
    $(window).resize();
    
}

/**
 * Center container div inside window
 */
$(window).resize(function(){

    $('#container').css({
        position: 'absolute',
        left: ($(window).width() -
        $('#container').outerWidth()) /
        2,
        top: ($(window).height() -
        $('#container').outerHeight()) /
        2
    });
    
});

$(document).ready(function(){
    init();
    $(window).resize();
});
