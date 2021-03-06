LOH.SelectScreenCamera=function(world,input){

	var camera=new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.y=20;
	camera.position.z=20;
	target=new Vec3()
	camera.lookAt(target);
	this.update=function(delta){
		
	}
	
	this.getCamera=function(){return camera;}
 }
 LOH.StaticCamera=function(world,input){

	var camera=new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position=new Vec3();
	this.update=function(delta){}
	this.getCamera=function(){return camera;}
 }
LOH.thirdPersonCamera=function(world,input){	

	var camera=new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 20000 );
	var projector = new THREE.Projector();
	camera.position.x=0;
	camera.position.y=10;
	camera.position.z=10;
	var pos= new Vec4(camera.position.x,0,camera.position.z,1);
	
	world.setAvatarLookAt( pos.clone().negate().addSelf(world.getAvatarPosition()))
	camera.lookAt(world.getAvatarPosition());
	
	this.update=function(delta){
		if (input.mouseDragOn){
			var mat=new THREE.Matrix4();
			mat.rotateY((input.downX - input.mouseX)*0.5*2*Math.PI/360);
			pos=mat.crossVector(pos);
			input.downX = input.mouseX;
		}
		if(input.mouseLDown){
			if(!mouseLDown){
				mouseLDown=true;
				var vector = new Vec3( ( input.mouseX / window.innerWidth ) * 2 - 1, - ( input.mouseY / window.innerHeight ) * 2 + 1 , 0.5 );
				projector.unprojectVector( vector, camera );

				var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
				world.changeSelection(ray)

			}
		}else{
			mouseLDown=false;
		}
		if(input.mouseRDown){
			world.setAvatarLookAt( pos.clone().negate().addSelf(world.getAvatarPosition()));
			dispatch['updateAvatarMove'](input);
		}			
		
		if (input.zoomCamera != 0 ){
			if( pos.length()+input.zoomCamera<100){
				if( pos.length()+input.zoomCamera>30){
					pos.setLength( pos.length()+input.zoomCamera );
				}else{
					pos.setLength(30);
				}
			}else{
				pos.setLength(100);
			}
			input.zoomCamera=0;
		}
		camera.position=world.getAvatarPosition().clone().addSelf(new Vec3(pos.x,(pos.lengthSq())/100,pos.z));
		
		camera.lookAt(world.getAvatarPosition());
	}

	this.getCamera=function(){return camera;}
 }