import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import {TrackballControls} from 'three/addons/controls/TrackballControls.js';

let container, stats;
let material;
let camera, raycaster, controls, scene, renderer;
let objects = [];
let links = [];
let linksj =  [];
let spheres = []; 
let lksph = []; 
let anames =[];
let netjson = [];
let rpos = [];
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
	url: "https://rawgit.com/calugo/RNA-NETS/master/docs/DISCNET/gencode.json",
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
function relpos(anames){

let N = anames.length;
let theta = 0.0;
let r = 55;
for(let i=0; i<anames.length; i++){
      let ri = [];
      theta = i*(2.0*r*Math.PI/N);
      ri.id = anames[i];
      ri.X = r*Math.cos(theta);
      ri.Y = r*Math.sin(theta);
      rpos.push(ri)
    }
}
/////////////////////////////////////////////
function amino_button(){

    let amino = this.id;

    for (var i = 0; i < objects.length; i++) {
        objects[i].material.emissive.setHex( objects[i].currentHex );
    }
    
    for (var i = 0; i < objects.length; i++) {

        objects[i].position.x = objects[i].realX + netjson[i].x;
        objects[i].position.y = objects[i].realY + netjson[i].y;
        objects[i].position.z = 0.0;

        if (amino == objects[i].name)
            {
            //console.log(objects[i])
            objects[i].position.x=netjson[i].x;
            objects[i].position.y=netjson[i].y;
            //objects[i].material.emissive.setHex( 0xff0000 );
            } 
    }

    for (let i=0; i<links.length;i++){
        links[i].visible = false;
    }

    for (let j=0; j<linksj.length;j++){
        linksj[j].visible = false;
        let lij = scene.getObjectByName(linksj[j].name);
        //console.log(lij);
        scene.remove( lij );
    }

   // console.log(scene);
 
    for (let i=0; i<objects.length;i++){
        if (amino == objects[i].name){ 
            let xi = netjson[i].x;
            let yi = netjson[i].y;
            let p1 = new THREE.Vector3(xi, yi, 0.0);

            ////////////
            for (let j = 0; j<objects[i].links.length;j++){
                    let points = [];
                    let cj = objects[i].links[j]
                    for(let k = 0 ; k < objects.length; k++ ){
                        if (cj == objects[k].codon){
    
                            let xj = netjson[k].x + objects[k].realX;
                            let yj = netjson[k].y + objects[k].realY;
                          
    
                            //console.log(objects[i].codon,objects[k].codon);
                            //const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
                            if(objects[i].name == objects[k].name){
                                let xj = netjson[k].x;
                                let yj = netjson[k].y;
                                let p2 = new THREE.Vector3(xj, yj, 0.0);
                                points.push(p1,p2);

                                material = new THREE.LineBasicMaterial({color: 0.5*0x0000ff})
                                material.linewidth = 2.0;
                                material.transparent = true;
                                material.opacity = 0.5;

                               


                            }
    
                            if(objects[i].name != objects[k].name){

                                let xj = netjson[k].x+objects[k].realX;
                                let yj = netjson[k].y+objects[k].realY;
                                let p2 = new THREE.Vector3(xj, yj, 0.0);
                                points.push(p1,p2);
                                
                                material = new THREE.LineBasicMaterial({color: 0*0x0000ff})
                                material.linewidth = 2.0
                                material.transparent = true;
                                material.opacity = 0.15;

                            }

                            const geometry = new THREE.BufferGeometry().setFromPoints(points);
                            const line = new THREE.Line(geometry, material);
                            line.name = amino+netjson[k].codon;
                            scene.add(line); 
                            linksj.push(line);            
                            break;
    
                        }
                    }
            }

        }
    }

    display_info(amino);
}
//////////////////////////////////////////////
function createMenu(){


    for (var i = 0; i < anames.length; i++) {

        let button = document.createElement('button');
        button.id = anames[i];
        button.innerHTML = anames[i];
        button.onclick = amino_button
        //console.log(button)
        menu.appendChild(button);

    }

   let mbutton = document.createElement('button'); 
   mbutton.id = 'Mode';
   mbutton.innerHTML = 'Reset';
   mbutton.onclick = modeButton;
   topmenu.appendChild(mbutton);
}
///////////////////////////////////////////////
function init(){
    
    container = document.createElement('div');
    document.body.appendChild(container);


    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.x = 0.0;
    camera.position.y = 0.0;
    camera.position.z = 120.0;

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

    const geometry = new THREE.CircleGeometry( 2.0, 10 ); 

    ////////Amino acids array//////
    let aminofull = [];
    for (let i =0; i<netjson.length; i++){
        aminofull.push(netjson[i].amino);
    }

    anames = [...new Set(aminofull)];
    relpos(anames)

    for (let i = 0; i < netjson.length; i++) {

        const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: (parseFloat(10*netjson[i].colorid) / 22.0) * 0xffffff}));
        object.material.ambient = object.material.color;

        for(let j=0;j<rpos.length;j++){
            if(netjson[i].amino == rpos[j].id){
                
                object.realX = rpos[j].X;
                object.realY = rpos[j].Y;
                break;
            }
        }
        object.realZ = 0.0;

        object.position.x = object.realX + netjson[i].x;
        object.position.y = object.realY + netjson[i].y;
        object.position.z = 0.0;

        object.name = netjson[i].amino;
        object.col=netjson[i].colorid
        object.codon= netjson[i].codon;
        
        object.links = netjson[i].links;
        object.followers = [];

        scene.add(object);
        objects.push(object);

    }
    
    //////////////////////////////
   
    for(let i=0; i<objects.length;i++){
        let xi = netjson[i].x + objects[i].realX;
        let yi = netjson[i].y + objects[i].realY;
        let p1 = new THREE.Vector3(xi, yi, 0.0);
        //console.log(netjson[i].codon,objects[i].codon);
        //console.log(objects[i].links);
        for (let j = 0; j<objects[i].links.length;j++){
                let points = [];
                let cj = objects[i].links[j]
                //console.log(cj);
                for(let k = 0 ; k < objects.length; k++ ){
                    if (cj == objects[k].codon){

                        let xj = netjson[k].x + objects[k].realX;
                        let yj = netjson[k].y + objects[k].realY;
                        let p2 = new THREE.Vector3(xj, yj, 0.0);

                        points.push(p1,p2);

                        //console.log(objects[i].codon,objects[k].codon);
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);

                        if(objects[i].name == objects[k].name){
                            material = new THREE.LineBasicMaterial({color: 0.5*0x0000ff})
                            material.linewidth = 2.0;
                            material.transparent = true;
                            material.opacity = 0.5;
                        }

                        if(objects[i].name != objects[k].name){
                            material = new THREE.LineBasicMaterial({color: 0*0x0000ff})
                            material.linewidth = 2.0
                            material.transparent = true;
                            material.opacity = 0.15;
                        }
                    
                        const line = new THREE.Line(geometry, material);
                        //line.visible = false;
                        scene.add(line); 
                        links.push(line);            
                        break;

                    }
                }
        }
    }
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

    for (let j=0; j<linksj.length;j++){
        linksj[j].visible = false;
        let lij = scene.getObjectByName(linksj[j].name);
        console.log(lij);
        scene.remove( lij );
    }


    for (let j=0; j<netjson.length;j++){
        objects[j].position.x = objects[j].realX + netjson[j].x;
        objects[j].position.y = objects[j].realY + netjson[j].y;
        objects[j].position.z = 0.0;

    }
   
    for (let j=0; j<links.length;j++){
        links[j].visible = true;
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
            INTERSECTED.material.emissive.setHex( 0xff0000 );
            
            for(let qn=0; qn< INTERSECTED.links.length; qn++){
                let zn=INTERSECTED.codon+INTERSECTED.links[qn];
                for(let pn=0; pn<links.length;pn++){
                  
                    if (zn==links[pn].myId){
                    links[pn].material.linewidth=50.0;
                  }
                }}
            
                let mux=1;
                if (mux==1){
                
                    var nn=[];
                var na=[];
                var sk, qn;
                for(var ik = 0; ik < INTERSECTED.links.length; ik++) {
                  sk=INTERSECTED.links[ik]
                  for(var jk=0;jk<netjson.length;jk++){
                    if (netjson[jk].codon==sk){nn.push(netjson[jk].codon);
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
        }
          container.style.cursor = 'pointer';

    } else {

        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( 0x000000 );

        INTERSECTED = null;
        for(var pn=0; pn<links.length;pn++){
            links[pn].material.linewidth=2.0;    
          }

        for (let j=0; j < objects.length;j++){
            objects[j].material.emissive.setHex( 0x000000 );
        }
    
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
        
        objects[j].material.emissive.setHex(0x000000 );
        if (objects[j].name == amino){
            objects[j].material.emissive.setHex(0xff0000)
        }
    }
    
    for (let ik = 0; ik<netjson.length;ik++){
        if (netjson[ik].amino == amino){
            csd.push(netjson[ik].codon);
        }
    }

    for (let i =0 ; i<csd.length;i++){
        let codi = csd[i];
        let codj ='';
        let lk = [];

        for (let j=0;j<netjson.length;j++){
            if (codi == netjson[j].codon){
                
                codj = netjson[j].codon;
                lk = netjson[j].links;
                break;
                }
            }
            
           for(let j = 0; j < lk.length; j++){
                for (let k = 0; k < netjson.length;k++){
                    if (lk[j]==netjson[k].codon){
                       na.push(netjson[k].amino)
                    }
                }
            }

        }
       
    
    let nauq = [...new Set(na)];

    $('#ccc').find('span').text(csd);
    $('#nnn').find('span').text('');
    $('#aaa').find('span').text(amino);
    $('#anan').find('span').text(nauq);

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

