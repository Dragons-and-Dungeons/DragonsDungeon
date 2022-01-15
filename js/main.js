var Dungeon = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000),
  renderer: new THREE.WebGLRenderer({ antialias: true }),
  raycaster: new THREE.Raycaster(),
  mouse: new THREE.Vector3(),
  textureLoader: new THREE.TextureLoader(),
  raycastSetUp: function () {
    Dungeon.mouse.x = 0; //(0.5) * 2 - 1;
    Dungeon.mouse.y = 0; //(0.5) * 2 + 1;
    Dungeon.mouse.z = 0.0001;
  },
  boot: function () {
    //renderer time delta
    Dungeon.prevTime = performance.now();

    Dungeon.initialRender = true;

    Dungeon.scene.fog = new THREE.FogExp2(0x666666, 0.025);

    Dungeon.renderer.setSize(window.innerWidth, window.innerHeight);
    Dungeon.renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(Dungeon.renderer.domElement);

    Dungeon.userBoxGeo = new THREE.BoxGeometry(2, 1, 2);
    Dungeon.userBoxMat = new THREE.MeshBasicMaterial({ color: 0xeeee99, wireframe: true });
    Dungeon.user = new THREE.Mesh(Dungeon.userBoxGeo, Dungeon.userBoxMat);

    var texture = Dungeon.textureLoader.load('./asset/volume.png');
    texture.minFilter = THREE.LinearFilter;
    Dungeon.textureAnimation = new TextureAnimator(texture, 5, 6, 30, 60);
    var img = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

    Dungeon.volumeIcon = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), img);
    Dungeon.volumeIcon.overdraw = true;

    Dungeon.volumeIconLeftWall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), img);
    Dungeon.volumeIconLeftWall.overdraw = true;
    var mS = (new THREE.Matrix4()).identity();
    mS.elements[0] = -1;
    mS.elements[10] = -1;
    Dungeon.volumeIconLeftWall.geometry.applyMatrix(mS);

    //invisible since this will solely be used to determine the size
    //of the bounding box of our boxcollider for the user
    Dungeon.user.visible = false;

    //making Bounding Box and HelperBox
    //boundingbox is used for collisions, Helper box just makes it easier to debug 
    Dungeon.user.BBox = new THREE.Box3();

    //make our collision object a child of the camera
    Dungeon.camera.add(Dungeon.user);

    Dungeon.controls = new THREE.PointerLockControls(Dungeon.camera);
    Dungeon.scene.add(Dungeon.controls.getObject());

    Dungeon.pastX = Dungeon.controls.getObject().position.x, Dungeon.camera.direction;
    Dungeon.pastZ = Dungeon.controls.getObject().position.z;

    Dungeon.canvas = document.querySelector('canvas');
    Dungeon.canvas.className = "gallery";

    //Clicking on either of these will start the game
    Dungeon.bgMenu = document.getElementById('background_menu');
    Dungeon.play = document.getElementById('play_button');

    //enabling/disabling menu based on pointer controls
    Dungeon.menu = document.getElementById("menu");

    //only when pointer is locked will translation controls be allowed: Dungeon.controls.enabled
    Dungeon.moveVelocity = new THREE.Vector3();
    Dungeon.jump = false;
    Dungeon.moveForward = false;
    Dungeon.moveBackward = false;
    Dungeon.moveLeft = false;
    Dungeon.moveRight = false;

    window.addEventListener('resize', function () {
        Dungeon.renderer.setSize(window.innerWidth, window.innerHeight);
        Dungeon.camera.aspect = window.innerWidth / window.innerHeight;
        Dungeon.camera.updateProjectionMatrix();
    });

  },

  pointerControls: function () {
      if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {
          //assign the API functions for pointer lock based on browser
          Dungeon.canvas.requestPointerLock = Dungeon.canvas.requestPointerLock || Dungeon.canvas.mozRequestPointerLock || Dungeon.canvas.webkitRequestPointerLock;
          //run this function to escape pointer Lock
          Dungeon.canvas.exitPointerLock = Dungeon.canvas.exitPointerLock || Dungeon.canvas.mozExitPointerLock || Dungeon.canvas.webkitExitPointerLock;

          document.addEventListener("keydown", function (e) {
            if (e.keyCode === 102 || e.keyCode === 70) {
              Dungeon.toggleFullscreen();
              //refer to below event listener:
              Dungeon.canvas.requestPointerLock();
            }
          });

          document.addEventListener('click', function() {
          	if (Dungeon.controls.enabled === true) {
console.log('play')
						} else {
				      //reset delta time, so when unpausing, time elapsed during pause
				      //doesn't affect any variables dependent on time.
				      Dungeon.prevTime = performance.now();
				    }
          });

          Dungeon.bgMenu.addEventListener("click", function () {
              Dungeon.canvas.requestPointerLock();
          });
          Dungeon.play.addEventListener("click", function () {
              Dungeon.canvas.requestPointerLock();
          });

          //pointer lock state change listener
          document.addEventListener('pointerlockchange', Dungeon.changeCallback, false);
          document.addEventListener('mozpointerlockchange', Dungeon.changeCallback, false);
          document.addEventListener('webkitpointerlockchange', Dungeon.changeCallback, false);

          document.addEventListener('pointerlockerror', Dungeon.errorCallback, false);
          document.addEventListener('mozpointerlockerror', Dungeon.errorCallback, false);
          document.addEventListener('webkitpointerlockerror', Dungeon.errorCallback, false);


      } else {
          alert("Your browser does not support the Pointer Lock API");
      }
  },

  changeCallback: function (event) {
    if (document.pointerLockElement === Dungeon.canvas || document.mozPointerLockElement === Dungeon.canvas || document.webkitPointerLockElement === Dungeon.canvas) {
      Dungeon.controls.enabled = true;
      Dungeon.menu.className += " hide";
      Dungeon.bgMenu.className += " hide";
      document.addEventListener("mousemove", Dungeon.moveCallback, false);
    } else {
      Dungeon.controls.enabled = false;
      Dungeon.menu.className = Dungeon.menu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
      Dungeon.bgMenu.className = Dungeon.bgMenu.className.replace(/(?:^|\s)hide(?!\S)/g, '');
      document.removeEventListener("mousemove", Dungeon.moveCallback, false);
    }
  },

  errorCallback: function (event) {
      alert("Pointer Lock Failed");
  },
  moveCallback: function (event) {
      //now that pointer disabled, we get the movement in x and y pos of the mouse
      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  },
  toggleFullscreen: function () {
      if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
	      } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
  },
  movement: function () {
      document.addEventListener("keydown", function (e) {
          if (e.keyCode === 87 || e.keyCode === 38) { //w or UP
              Dungeon.moveForward = true;
          }
          else if (e.keyCode === 65 || e.keyCode === 37) { //A or LEFT
              Dungeon.moveLeft = true;
          }
          else if (e.keyCode === 83 || e.keyCode === 40) { //S or DOWN 
              Dungeon.moveBackward = true;
          }
          else if (e.keyCode === 68 || e.keyCode === 39) { //D or RIGHT
              Dungeon.moveRight = true;
          }
          else if (e.keyCode === 32) { //Spacebar
              if (Dungeon.jump) {
                  Dungeon.moveVelocity.y += 17;
                  Dungeon.jump = false;
              }
          }
      });

      document.addEventListener("keyup", function (e) {
          if (e.keyCode === 87 || e.keyCode === 38) { //w or UP
              Dungeon.moveForward = false;
          }
          else if (e.keyCode === 65 || e.keyCode === 37) { //A or LEFT
              Dungeon.moveLeft = false;
          }
          else if (e.keyCode === 83 || e.keyCode === 40) { //S or DOWN 
              Dungeon.moveBackward = false;
          }
          else if (e.keyCode === 68 || e.keyCode === 39) { //D or RIGHT
              Dungeon.moveRight = false;
          }
      });
  },

  create: function () {
    //let there be light!
    Dungeon.worldLight = new THREE.AmbientLight(0xffffff);
    Dungeon.scene.add(Dungeon.worldLight);

    Dungeon.textureLoader.load('./asset/floor-pattern.jpg', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(24, 24);

        Dungeon.floorMaterial = new THREE.MeshPhongMaterial({ map: texture });
        Dungeon.floor = new THREE.Mesh(new THREE.PlaneGeometry(45, 45), Dungeon.floorMaterial);

        Dungeon.floor.rotation.x = Math.PI / 2;
        Dungeon.floor.rotation.y = Math.PI;
        Dungeon.scene.add(Dungeon.floor);
    }, undefined, function (err) { console.error(err) });

    //Create the walls////
    Dungeon.wallGroup = new THREE.Group();
    Dungeon.scene.add(Dungeon.wallGroup);

    Dungeon.textureLoader.load('./asset/wall.jpg',
      function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);

        Dungeon.wallMaterial = new THREE.MeshLambertMaterial({ map: texture });

        Dungeon.wall1 = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 0.001), Dungeon.wallMaterial);
        Dungeon.wall2 = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 0.001), Dungeon.wallMaterial);
        Dungeon.wall3 = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 0.001), Dungeon.wallMaterial);
        Dungeon.wall4 = new THREE.Mesh(new THREE.BoxGeometry(45, 6, 0.001), Dungeon.wallMaterial);

        Dungeon.wallGroup.add(Dungeon.wall1, Dungeon.wall2, Dungeon.wall3, Dungeon.wall4);
        Dungeon.wallGroup.position.y = 3;

        Dungeon.wall1.position.z = -22.5;
        Dungeon.wall2.position.x = -22.5;
        Dungeon.wall2.rotation.y = Math.PI / 2;
        Dungeon.wall3.position.x = 22.5;
        Dungeon.wall3.rotation.y = -Math.PI / 2;
        Dungeon.wall4.position.z = 22.5;
        Dungeon.wall4.rotation.y = Math.PI;

        for (var i = 0; i < Dungeon.wallGroup.children.length; i++) {
            Dungeon.wallGroup.children[i].BBox = new THREE.Box3();
            Dungeon.wallGroup.children[i].BBox.setFromObject(Dungeon.wallGroup.children[i]);
        }
      },
      undefined,
      function (err) { console.error(err); }
  	);

	  Dungeon.textureLoader.load('./asset/ceil.jpg',
      function (texture) {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(5, 5);

          Dungeon.ceilMaterial = new THREE.MeshLambertMaterial({ map: texture });

          Dungeon.ceil = new THREE.Mesh(new THREE.PlaneGeometry(45, 45), Dungeon.ceilMaterial);
          Dungeon.ceil.position.y = 6;
          Dungeon.ceil.rotation.x = Math.PI / 2;

          Dungeon.scene.add(Dungeon.ceil);
      },
      undefined,
      function (err) { console.error(err); }
	  );

	  Dungeon.artGroup = new THREE.Group();

  },
  render: function () {
    requestAnimationFrame(Dungeon.render);

    if (Dungeon.controls.enabled === true) {
      Dungeon.initialRender = false;
      var currentTime = performance.now(); //returns time in milliseconds
      //accurate to the thousandth of a millisecond
      //want to get the most accurate and smallest change in time
      var delta = (currentTime - Dungeon.prevTime) / 1000;

      //there's a constant deceleration that needs to be applied
      //only when the object is currently in motion
      Dungeon.moveVelocity.x -= Dungeon.moveVelocity.x * 10.0 * delta;
      //for now
      Dungeon.moveVelocity.y -= 9.8 * 7.0 * delta; // m/s^2 * kg * delta Time
      Dungeon.moveVelocity.z -= Dungeon.moveVelocity.z * 10.0 * delta;

      Dungeon.textureAnimation.update(1000 * delta);

      //need to apply velocity when keys are being pressed
      if (Dungeon.moveForward) {
        Dungeon.moveVelocity.z -= 38.0 * delta;
      }
      if (Dungeon.moveBackward) {
        Dungeon.moveVelocity.z += 38.0 * delta;
      }
      if (Dungeon.moveLeft) {
        Dungeon.moveVelocity.x -= 38.0 * delta;
      }
      if (Dungeon.moveRight) {
        Dungeon.moveVelocity.x += 38.0 * delta;
      }

      Dungeon.controls.getObject().translateX(Dungeon.moveVelocity.x * delta);
      Dungeon.controls.getObject().translateY(Dungeon.moveVelocity.y * delta);
      Dungeon.controls.getObject().translateZ(Dungeon.moveVelocity.z * delta);

      if (Dungeon.controls.getObject().position.y < 1.75) {
         Dungeon.jump = false;
         Dungeon.moveVelocity.y = 0;
         Dungeon.controls.getObject().position.y = 1.75;
      }

      if (Dungeon.controls.getObject().position.z < -22) {
        Dungeon.controls.getObject().position.z = -22;
      }
      if (Dungeon.controls.getObject().position.z > 22) {
        Dungeon.controls.getObject().position.z = 22;
      }
      if (Dungeon.controls.getObject().position.x < -22) {
        Dungeon.controls.getObject().position.x = -22;
      }
      if (Dungeon.controls.getObject().position.x > 22) {
        Dungeon.controls.getObject().position.x = 22;
      }

      Dungeon.raycaster.setFromCamera(Dungeon.mouse.clone(), Dungeon.camera);
      //calculate objects interesting ray
      // Dungeon.intersects = Dungeon.raycaster.intersectObjects(Dungeon.object to interact);

      if(Dungeon.lastIntersectObj !== undefined)
      	Dungeon.lastIntersectObj.material.color.set(0xffffff);

     /* if (Dungeon.intersects.length !== 0) {
        //console.log(Dungeon.intersects[0]);
        Dungeon.lastIntersectObj = Dungeon.intersects[0].object;
        Dungeon.intersects[0].object.material.color.set(0xc2d9f0);
      }

      for (var i = 0; i < Dungeon.wallGroup.children.length; i++) {
        if (Dungeon.user.BBox.intersectsBox(Dungeon.wallGroup.children[i].BBox)) {
        	Dungeon.user.BBox.setFromObject(Dungeon.user);
        } else {
        	Dungeon.wallGroup.children[i].material.color.set(0xffffff);
        }
      }
      */
      Dungeon.pastX = Dungeon.controls.getObject().position.x;
      Dungeon.pastZ = Dungeon.controls.getObject().position.z;

      Dungeon.user.BBox.setFromObject(Dungeon.user);

      Dungeon.prevTime = currentTime;

      Dungeon.renderer.render(Dungeon.scene, Dungeon.camera);
    } else {
      //reset delta time, so when unpausing, time elapsed during pause
      //doesn't affect any variables dependent on time.
      Dungeon.prevTime = performance.now();
    }

    if (Dungeon.initialRender === true) {
      for (var i = 0; i < Dungeon.wallGroup.children.length; i++) {
        Dungeon.wallGroup.children[i].BBox.setFromObject(Dungeon.wallGroup.children[i]);
      }
      Dungeon.renderer.render(Dungeon.scene, Dungeon.camera);
    }
  }
};

Dungeon.raycastSetUp();
Dungeon.boot();
Dungeon.pointerControls();
Dungeon.movement();
Dungeon.create();
Dungeon.render();




function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) { 
  // note: texture passed by reference, will be updated by the update function.
    
  this.tilesHorizontal = tilesHoriz;
  this.tilesVertical = tilesVert;
  // how many images does this spritesheet contain?
  //  usually equals tilesHoriz * tilesVert, but not necessarily,
  //  if there at blank tiles at the bottom of the spritesheet. 
  this.numberOfTiles = numTiles;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
  texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

  // how long should each image be displayed?
  this.tileDisplayDuration = tileDispDuration;

  // how long has the current image been displayed?
  this.currentDisplayTime = 0;

  // which image is currently being displayed?
  this.currentTile = 0;
    
  this.update = function( milliSec )
  {
    this.currentDisplayTime += milliSec;
    while (this.currentDisplayTime > this.tileDisplayDuration)
    {
      this.currentDisplayTime -= this.tileDisplayDuration;
      this.currentTile++;
      if (this.currentTile == this.numberOfTiles)
        this.currentTile = 0;
      var currentColumn = this.currentTile % this.tilesHorizontal;
      texture.offset.x = currentColumn / this.tilesHorizontal;
      var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
      texture.offset.y = currentRow / this.tilesVertical;
    }
  };
}   
