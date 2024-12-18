
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import {TrackballControls} from 'three/addons/controls/TrackballControls.js';

let container, stats;
let material;
let camera, raycaster, controls, scene, renderer;
let objects = [];
let links = [];
let spheres = [], lksph = [], anames =[];
let netjson = [];
let pointer = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    INTERSECTED;
const radius = 1100;
let Mode = false;


readninit(init);
animate();

////READS THE GENETIC CODE/////////////////
function readninit(callback) {
    //loads net
    $.ajax({
	url: "https://rawgit.com/calugo/RNA-NETS/master/jsonnets/nugencode.json",
        dataType: "text",

        success: function (gencode) {
            var njson = $.parseJSON(gencode);
            for (var xi = 0; xi < njson.length; xi++) {
               // console.log(xi, njson[xi],njson[xi].amino);
                netjson.push(njson[xi]);
            }
        },

        async: false
            
    });
    callback();
}
/////////////////////////////////////////////
function amino_button(){

    let amino = this.id;

    for (var i = 0; i < objects.length; i++) {
        objects[i].material.emissive.setHex( objects[i].currentHex );
    }
    
    for (var i = 0; i < objects.length; i++) {
        if (amino == objects[i].name)
            {
            //console.log(objects[i])
            objects[i].material.emissive.setHex( 0xff0000 );
            } 
    }

    display_info(amino);
}
//////////////////////////////////////////////
function createMenu(){

    var amnames = [];
    amnames.push(netjson[0].amino);

    for (var i = 1; i < netjson.length; i++) {
        var b = 0;
        for (var j = 0; j < i; j++) {
            if (amnames[j] == netjson[i].amino) {
                b = 1;
                break;
            }
        }

        if (b == 0) {
            amnames.push(netjson[i].amino);
        }
    }

    for (var i = 0; i < amnames.length; i++) {

        let button = document.createElement('button');
        button.id = amnames[i];
        button.innerHTML = amnames[i];
        button.onclick = amino_button
        //console.log(button)
        menu.appendChild(button);

    }

   let mbutton = document.createElement('button'); 
   mbutton.id = 'Mode';
   mbutton.innerHTML = 'Mode';
   mbutton.onclick = modeButton;
   topmenu.appendChild(mbutton);
}
//////////////////////////////////////////////
function init(){
    
    container = document.createElement('div');
    document.body.appendChild(container);


    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = -1100;
    camera.position.y = 900;
    camera.position.z = 0;

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0x505050,20));

    const light = new THREE.DirectionalLight( 0xfff0ff, 1.0 );
	light.position.set( 1, 1, 1 ).normalize();

    light.castShadow = true;

    light.shadowCameraNear = 200;
    light.shadowCameraFar = camera.far;
    light.shadowCameraFov = 50;

    light.shadowBias = -0.00022;
    light.shadowDarkness = 0.5;

    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

	scene.add( light );


    const light2 = new THREE.DirectionalLight( 0xfff0ff, 1.0 );
	light2.position.set( -1, -1, -1 ).normalize();
    light2.castShadow = true;
    light2.shadowCameraNear = 200;
    light2.shadowCameraFar = camera.far;
    light2.shadowCameraFov = 50;
    light2.shadowBias = -0.00022;
    light2.shadowDarkness = 0.5;
    light2.shadowMapWidth = 2048;
    light2.shadowMapHeight = 2048;

	scene.add( light2 );


    const geometry = new THREE.SphereGeometry(20);

    ///////Adding Nodes////////////

    for (let i = 0; i < netjson.length; i++) {
        const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: (parseFloat(netjson[i].colorid) / 22.0) * 0xffffff}));
        object.material.ambient = object.material.color;

        object.position.x = netjson[i].x;
        object.position.y = netjson[i].z;
        object.position.z = netjson[i].y;

        object.realX = netjson[i].x;
        object.realY = netjson[i].y;
        object.realZ = netjson[i].z;

        object.name = netjson[i].amino;
        object.col=netjson[i].colorid
        object.codon= netjson[i].cod;

        object.castShadow = true;
        object.receiveShadow = true;
        object.isSphere = true;
        object.links = netjson[i].links;
        object.followers = [];

        scene.add(object);
        objects.push(object);

    }

    ///// Adding Links////////////
    for (let i = 0; i < netjson.length; i++) {
            for (let j = 0; j < netjson[i].links.length; j++) {
                let tj = netjson[i].links[j];
                for (let k = 0; k < netjson.length; k++) {
                    if (netjson[k].nodeid == tj) {
                        let points = [];
                        let r1 = new THREE.Vector3(netjson[i].x, netjson[i].z, netjson[i].y);
                        let r2 = new THREE.Vector3(netjson[k].x, netjson[k].z, netjson[k].y);
                        points.push(r1);
                        points.push(r2);
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        //console.log(material.color)
                        
                        if (netjson[i].amino != netjson[k].amino) {
                            material = new THREE.LineBasicMaterial({color: 0*0x0000ff})
                            material.linewidth = 1.0
                            material.transparent = true;
                            material.opacity = 0.15;
                        }
                        if (netjson[i].amino == netjson[k].amino) {
                            material = new THREE.LineBasicMaterial({color: 0.5*0x0000ff})
                            material.linewidth = 1.0;
                            material.transparent = true;
                            material.opacity = 0.5;
                       }
                        const line = new THREE.Line(geometry, material);
                        scene.add(line);
                        
                        line.myId = netjson[i].cod+tj;
                        scene.add(line);
                        links.push(line);
                        break;
                    }
                }
            }
        }
    //console.log(links)
    //////////////////////////////
    ////Reduced Network
    let aminofull = [];
    //spheres = [], lksph = [], anames =[];

    for (let i =0; i<netjson.length; i++){
        aminofull.push(netjson[i].amino);
    }

    anames = [...new Set(aminofull)];
    let color = 0xffffff
    const asgeometry = new THREE.SphereGeometry(80);

    for (let i = 0; i< anames.length; i++){
        //console.log(anames[i]);
        let nn = 0;
        let Xm = 0.0, Ym =0.0, Zm=0.0;
        let ascolor = 0x000000;
        for (let j = 0; j< netjson.length; j++){
            if (netjson[j].amino == anames[i]){
                //console.log(netjson[j].amino,anames[i])
                Xm+=netjson[j].x; Ym+=netjson[j].y; Zm+=netjson[j].z;
                ascolor = (parseFloat(netjson[j].colorid) / 22.0) * 0xffffff;
                nn+=1
            }
            
        }
        const amisphere = new THREE.Mesh(asgeometry, new THREE.MeshLambertMaterial({color: ascolor}));
        amisphere.material.ambient = amisphere.material.color;

        amisphere.position.x = Xm/nn;
        amisphere.position.y = Zm/nn;
        amisphere.position.z = Ym/nn;

        amisphere.name = anames[i];

        amisphere.castShadow = true;
        amisphere.receiveShadow = true;
        amisphere.isSphere = true;
        amisphere.material.transparent = true;
        amisphere.material.alphaTest = 0.2;
        amisphere.material.opacity = 0.5;
        amisphere.material.wireframe = true;
        amisphere.links = [];
        //amisphere.sphereid = false;
        amisphere.visible = false;

        scene.add(amisphere);
        spheres.push(amisphere);

        //console.log(spheres)
    }

    for (let i = 0 ; i<spheres.length;i++){
        let r1 = new THREE.Vector3(spheres[i].position.x,spheres[i].position.y,spheres[i].position.z)
        let aminoi=spheres[i].name;
        //console.log(aminoi)
        let aminoij = aminolinks(aminoi);
        //console.log(aminoij)
        for (let j = 0 ; j<aminoij.length;j++){
            if (aminoij[j] != aminoi){
                //console.log(aminoi,aminoij[j])
                let pointsij = []
                for(let k=0; k<spheres.length;k++){
                    if (spheres[k].name == aminoij[j]){
                        let r2 = new THREE.Vector3(spheres[k].position.x,spheres[k].position.y,spheres[k].position.z);
                        pointsij.push(r1);
                        pointsij.push(r2);
                        //console.log(pointsij)
                        const geometryij = new THREE.BufferGeometry().setFromPoints(pointsij);
                        let lijmaterial = new THREE.LineBasicMaterial({color: 0*0x000000})
                        lijmaterial.linewidth = 3.0
                        lijmaterial.transparent = true;
                        lijmaterial.opacity = 0.25;
                        const lineij = new THREE.Line(geometryij, lijmaterial);
                        lineij.visible = false;
                        scene.add(lineij);
                        lksph.push(lineij)

                    }
                }
            }
        }
    }
    //console.log(lksph)
    /////////////////////////////
    /////////////////////////////
    
	renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor(0xf0f0f0);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	
    renderer.WebGLshadowMapEnabled = true;
    renderer.WebGLshadowMapType = THREE.PCFShadowMap;


    container.appendChild( renderer.domElement );

    controls = new TrackballControls(camera,renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - Genetic Code - Network';
    container.appendChild(info);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    createMenu();
	raycaster = new THREE.Raycaster();

	renderer.domElement.addEventListener( 'mousemove', onPointerMove );
	window.addEventListener( 'resize', onWindowResize,false );

}
////////////////////////////////////////////////
function modeButton(){
    let mdx, mdy;

    mdy = Mode;

    if (Mode == true){
        mdx = false;}
    else{
        mdx = true;
    }


    Mode = mdx;
   
    for (let j=0; j<links.length;j++){
        links[j].visible = mdy;
    }

    for(let j = 0 ; j<spheres.length;j++){
        //console.log(spheres[j].visible); 
        spheres[j].visible = Mode;
    }

    for(let j = 0; j<lksph.length;j++){
        //console.log(j)
        //console.log(lksph[j])
        lksph[j].visible = Mode;
    }

}
////////////////////////////////////////////////
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight )

}
////////////////////////////////
function onPointerMove( event ) {

    event.preventDefault();

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects(objects);

    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {

            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[ 0 ].object;
            //INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
            /////////
            for(let qn=0; qn< INTERSECTED.links.length; qn++){
                let zn=INTERSECTED.codon+INTERSECTED.links[qn];
                for(let pn=0; pn<links.length;pn++){
                    //console.log(links[pn].myId)
                  if (zn==links[pn].myId){
                    links[pn].material.linewidth=50.0;
                  }
                }}
            /////////
            let mux=1;
                if (mux==1){
                //console.log(INTERSECTED.codon);
                //console.log(INTERSECTED.name);
                //console.log(INTERSECTED.links);
                var nn=[];
                var na=[];
                var sk, qn;
                for(var ik = 0; ik < INTERSECTED.links.length; ik++) {
                  sk=INTERSECTED.links[ik]
                  for(var jk=0;jk<netjson.length;jk++){
                    if (netjson[jk].nodeid==sk){nn.push(netjson[jk].cod);
                                                na.push(netjson[jk].amino);}
                  }
                }
                var nax=[];
                nax.push(na[0]);
                for(var mi=0; mi<na.length;mi++){
                  var rn=0;
                  for(var mj=0;mj<nax.length;mj++){
                    if(na[mi]==nax[mj]){rn=1;
                                        break;}
                  }

                  if (rn==0){
                            nax.push(na[mi])
                            }

              }
                $('#ccc').find('span').text(INTERSECTED.codon);
                $('#nnn').find('span').text(nn);
                $('#aaa').find('span').text(INTERSECTED.name);
                $('#anan').find('span').text(nax);
              }

            /////////
        }
          container.style.cursor = 'pointer';

    } else {

        //if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( 0x000000 );

        INTERSECTED = null;
        for(var pn=0; pn<links.length;pn++){
            links[pn].material.linewidth=1.0;    
          }

        for (let j=0; j < objects.length;j++){
      //      //console.log(objects[j].material);
            objects[j].material.emissive.setHex( 0x000000 );
        }
    

        //for (let i =0 ; i < netjson.length)
        container.style.cursor = 'auto';

    }

}
///////////////////////////////////
function  display_info(amino){

    let csd =[];
    let nn=[];
    let na=[];
    let sk, qn;

      for (let j=0; j < objects.length;j++){
        //console.log(objects[j].material);
        objects[j].material.emissive.setHex(0x000000 );
        if (objects[j].name == amino){
            objects[j].material.emissive.setHex(0xff0000)
        }
    }


    //console.log(amino);
    //console.log('hello');
    
    for (let ik = 0; ik<netjson.length;ik++){
        if (netjson[ik].amino == amino){
            csd.push(netjson[ik].cod);
        }
    }
    //console.log(csd);

    for (let i =0 ; i<csd.length;i++){
        let codi = csd[i];
        let codj ='';
        let lk = [];

        //console.log(codi);

        for (let j=0;j<netjson.length;j++){
            //console.log(codi,netjson[j].cod);
            if (codi == netjson[j].cod){
                
                codj = netjson[j].cod;
                lk = netjson[j].links;
                //console.log(codi,codj)
                break;
                }
            }
            
            //console.log(codi,codj,lk,lk.length);

           for(let j = 0; j < lk.length; j++){
                for (let k = 0; k < netjson.length;k++){
                    if (lk[j]==netjson[k].nodeid){
                       na.push(netjson[k].amino)
                    }
                }
            }

        }
       
    
    let nauq = [...new Set(na)];
    //console.log(nauq)

    $('#ccc').find('span').text(csd);
    $('#nnn').find('span').text('');
    $('#aaa').find('span').text(amino);
    $('#anan').find('span').text(nauq);

}
///////////////////////////////////////////////
function aminolinks(amino){

    let csd = [];
    let na = [];

    for (let ik = 0; ik<netjson.length;ik++){
        if (netjson[ik].amino == amino){
            csd.push(netjson[ik].cod);
        }
    }
    
    for (let i =0 ; i<csd.length;i++){
        let codi = csd[i];
        let codj ='';
        let lk = [];
        
        for (let j=0;j<netjson.length;j++){
            if (codi == netjson[j].cod){
                
                codj = netjson[j].cod;
                lk = netjson[j].links;
                break;
                }
            }

           for(let j = 0; j < lk.length; j++){
                for (let k = 0; k < netjson.length;k++){
                    if (lk[j]==netjson[k].nodeid){
                       na.push(netjson[k].amino)
                    }
                }
            }

        }
       
    
    let nauq = [...new Set(na)];
    
    return nauq
}
///////////////////////////////////////////////
function render() {
    requestAnimationFrame(animate);
    controls.update();
	renderer.render( scene, camera );
}
//////////////////////////////////
function animate(){
    render();
    stats.update();
}

