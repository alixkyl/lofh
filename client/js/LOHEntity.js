LOH.Object3D=function(data){
	this.id=data._id;
	this.name=data.name;
	this.position=new Vec3(0,0,0);
	console.log(data._id)
	if(data.position)
		this.position.copy(data.position);
		
	this.rotation=new Vec3(0,0,0);
	if(data.rotation)
		this.rotation.copy(data.rotation);
	
	this.scale=new Vec3(1,1,1);
	if(data.scale)
		this.scale.copy(data.scale);
	
	this.mesh=LOH.PatternFactory(LOH.Ressources.getRessource({'type':'patterns','id':data.pattern},function(pattern){this.mesh=LOH.PatternFactory(pattern,data._id)}),data._id);
	this.mesh.position=this.position;
	this.mesh.rotation=this.rotation;
	this.mesh.scale=this.scale;
	this.select=function(){
		var meshS=LOH.PatternFactory(LOH.Ressources.getRessource({'type':'patterns','id':'4fee20be14b457c411000003'}
		,bind(this,function(pattern){
			var select=this.mesh.getChildByName("selection",true)
			if(select)
				this.mesh.remove(select);
			var meshS=LOH.PatternFactory(pattern);
			meshS.selection="selection";
			this.mesh.add(meshS);
		})),data._id);
		meshS.name="selection";
		this.mesh.add(meshS);
	}
	this.unselect=function(){
		var select=this.mesh.getChildByName("selection",true)
		if(select)
			this.mesh.remove(select);
	}
	this.changeStand=function(stand){
		action=this.mesh.actions[stand]
		for(part in action){
			if(part == 'self'){
				this.mesh.currentAnimation=action[part];
			}else{
				this.mesh.getChildByName(part,true).currentAnimation=action[part]
			}
		}
	}
	this.update=function(dt){anim(this.mesh,dt);}
	
	anim=function(m,dt){
		for(child in m.children)
			anim(m.children[child],dt);
		if(m.currentAnimation && m.morphTargetBase){
			m.animations[m.currentAnimation].lastKeyframe = m.animations[m.currentAnimation].lastKeyframe||0;
			m.animations[m.currentAnimation].currentKeyframe = m.animations[m.currentAnimation].currentKeyframe||0;
			m.animations[m.currentAnimation].tme=m.animations[m.currentAnimation].tme||0;
			m.animations[m.currentAnimation].tme = (m.animations[m.currentAnimation].tme+dt) % m.animations[m.currentAnimation].duration;

			var keyframe = m.animations[m.currentAnimation].start+Math.floor( m.animations[m.currentAnimation].tme / m.animations[m.currentAnimation].interpolation );

			if ( keyframe != m.currentKeyframe ) {

				m.morphTargetInfluences[ m.lastKeyframe ] = 0;
				m.morphTargetInfluences[ m.currentKeyframe ] = 1;
				m.morphTargetInfluences[ keyframe ] = 0;

				m.lastKeyframe = m.currentKeyframe;
				m.currentKeyframe = keyframe;

				// console.log( m.morphTargetInfluences );

			}

			m.morphTargetInfluences[ keyframe ] = ( m.animations[m.currentAnimation].tme % m.animations[m.currentAnimation].interpolation ) / m.animations[m.currentAnimation].interpolation;
			m.morphTargetInfluences[ m.lastKeyframe ] = 1 - m.morphTargetInfluences[ keyframe ];
		}
		
	
	}
	this.getMesh=function(){return this.mesh;}
	this.getPosition=function(){return this.position;}
	this.getRotation=function(){return this.rotation;}
}


LOH.Entity=function(data){
	LOH.Object3D.call(this,data);
	
	var move=new Vec4();
	if(data.move)
		move.copy(data.move);
	var rotationmove=data.rotationmove||0;
	var speed=data.speed||0.1;
	var rotationspeed=data.rotationspeed||0.001;
	
	this.update=function(dt){
		var mat=new THREE.Matrix4().setRotationFromEuler(this.rotation,this.mesh.eulerOrder);
		mat.rotateY(rotationmove*dt*rotationspeed);
		this.rotation.getRotationFromMatrix( mat );
		tmp_move=mat.crossVector(move);
		tmp_move.w=0;
		
		if(tmp_move.length()>0){
			tmp_move.normalize();
			this.changeStand('walk');
			// if(this.mesh.parent){
				// var rayFront = new THREE.Ray( this.position.clone().addSelf(new THREE.Vector3(0,5,0)), tmp_move.clone().normalize() );
				// var intersectsFront = rayFront.intersectObjects( this.mesh.parent.__objects );
				
				// if ( intersectsFront.length > 0 && tmp_move.length()>intersectsFront[0].distance ) {
						// move.set([0,0,0,1])
				// }else{
					// var rayDown = new THREE.Ray( this.position.clone().addSelf(new THREE.Vector3(0,10,0)), new THREE.Vector3(0,-5,0) );
					// var intersectsDown = rayDown.intersectObjects( this.mesh.parent.__objects );
					// tmp_move.normalize();
					// if(intersectsFront.length > 0){
						// dist= 10-intersectsFront[0].distance;
						// if(dist*dist >1)
							// dist=(dist>0)?1:-1;
						// tmp_move.y=dist;
					// }
					 this.position.addSelf(tmp_move.normalize().multiplyScalar(dt*speed));
				// }
			// }
		}else{
			this.changeStand('stand');
		}
		anim(this.mesh,dt);
	}
	
	this.synchronize=function(syncdata,dt){
		this.position.copy(syncdata.position);
		this.rotation.copy(syncdata.rotation);
		move.copy(syncdata.move);
		rotationmove=syncdata.rotationmove;
		var mat=new THREE.Matrix4().setRotationFromEuler(this.rotation,this.mesh.eulerOrder);
		mat.rotateY(rotationmove*dt*rotationspeed);
		this.rotation.getRotationFromMatrix( mat );
		tmp_move=mat.crossVector(move);
		tmp_move.w=0;
		this.position.addSelf(tmp_move.normalize().multiplyScalar(dt*speed))
	}
	//geter
	this.getMove=function(){return move;}
	this.getRotationMove=function(){return rotationmove;}
	//seter
	this.SetRotationMove=function(rotation){rotationmove=rotation;}
	this.SetMove=function(mov){move=mov;}
};

LOH.MapElement=function(data){
	LOH.Object3D.call(this,data);
	this.synchronize=function(syncdata,dt){}
}
LOH.PatternFactory=function(pattern,entId){
	var mesh,geometry,materials;
	
	if(pattern.geometry){
		
		geometry=LOH.Ressources.getRessource({'type':'geometries','id':pattern.geometry}
		,function(geo){
			newMesh=new THREE.Mesh(geo,mesh.material);
			mesh.position.set(pattern.position[0],pattern.position[1],pattern.position[2]);
			if(pattern.rotation)
				mesh.rotation.set(pattern.rotation[0],pattern.rotation[1],pattern.rotation[2]);
			if(pattern.scale)
				mesh.scale.set(pattern.scale[0],pattern.scale[1],pattern.scale[2]);
			mesh.actions=pattern.actions||{};
			mesh.animations=pattern.animations||{};
			mesh.currentAnimation=0;
			mesh.visible = pattern.visible||true;
			mesh.doubleSided = pattern.doubleSided||false;
			mesh.castShadow = pattern.castShadow||false;
			mesh.receiveShadow = pattern.receiveShadow||false;
			mesh.name=pattern.name;
			mesh.entId=entId;
	for(child in pattern.childs){
		mesh.add(LOH.PatternFactory(pattern.childs[child],entId));
	}
		});
		if( pattern.materials)
			material=LOH.Ressources.getRessource({'type':'materials','id':pattern.materials}
			,function(mat){
				mesh.material=mat;
			});
		mesh=new THREE.Mesh(geometry,material);
	}else{
		mesh=new THREE.Object3D();
	}
	if(pattern.position)
		mesh.position.set(pattern.position[0],pattern.position[1],pattern.position[2]);
	if(pattern.rotation)
		mesh.rotation.set(pattern.rotation[0],pattern.rotation[1],pattern.rotation[2]);
	if(pattern.scale)
		mesh.scale.set(pattern.scale[0],pattern.scale[1],pattern.scale[2]);
	mesh.actions=pattern.actions||{};
	mesh.animations=pattern.animations||{};
	mesh.currentAnimation=0;
	mesh.visible = pattern.visible||true;
	mesh.doubleSided = pattern.doubleSided||false;
	mesh.castShadow = pattern.castShadow||false;
	mesh.receiveShadow = pattern.receiveShadow||false;
	mesh.name=pattern.name;
	mesh.entId=entId;
	for(child in pattern.childs){
		mesh.add(LOH.PatternFactory(pattern.childs[child],entId));
	}
	return mesh;
}