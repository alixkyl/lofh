var THREE=require('./lib/three.js');
var DB=require('../DBacces.js');
var mPhys=require('./microphysic.js');
SIZE=1*1000;
sqrt=Math.sqrt
Zone=function(id,zonePosition){
	console.log("zone:",id,":",zonePosition)
	var adjacent={
		'NE':undefined
		,'E':undefined
		,'SE':undefined
		,'SO':undefined
		,'O':undefined
		,'NO':undefined
	};
	//******************************
	// var world=new mPhys.vphy.World();
	// world.add(new mPhys.vphy.LinearAccelerator({
		// x   :  0,
		// y   : -9.8,
		// z   :  0
	// }));
	// world.start(Date.now()/1000);
	//*****************************
	var entities={};
	var elements={};
	this.compositeElements={};
	
	this.getEntities=function(){return entities;}
		
	this.setAdjacent=function(rel,adj){
		adjacent[rel]=adj;
	}
	var lastUpdate=new Date().getTime();
	var update=true;
	var time;
	this.simulate=function(){
		var now = new Date().getTime();
		var dt = now - (time || now);
		var timeStep    = 1/60;
		if((now - lastUpdate)>1000){
			update=true;
			lastUpdate=now;
		}
		time = now;
		for(ent in entities){
			entity=entities[ent];
			//entity.body.setPosition(entity.position.x,entity.position.y,entity.position.z)
			if(update){
				ent.view=this.compositeElements;
			}
			if(entity.activ){
				var mat=new THREE.Matrix4().setRotationFromEuler(entity.rotation,'XYZ');
				mat.rotateY(entity.rotationmove*dt*entity.rotationspeed);
				entity.rotation.getRotationFromMatrix( mat );
				var tmp_move=mat.crossVector(entity.move);
				tmp_move.w=0;
				tmp_move.normalize();
				var ret=this.whereIs(entity.position.clone().addSelf(tmp_move.clone().multiplyScalar(dt*entity.speed)));
				if(ret&&!adjacent[ret]){
					console.log('stop:',ret)
					entity.move.set([0,0,0,1])
					//entity.body.setVelocity(0,entity.body.getVelocity()[1],0);
				}else{
					// tmp_move.multiplyScalar(dt*entity.speed)
					// entity.body.setVelocity(tmp_move.x,entity.body.getVelocity()[1],tmp_move.z)
					entity.position.addSelf(tmp_move.multiplyScalar(dt*entity.speed));
					ret=this.whereIs(entity.position);
					if(ret&&adjacent[ret]){
						console.log('pass:',ret)
						passToAdjacent(entity,ret);
					}
				}
			}
		}
		// world.step(timeStep, now/1000);
		
		// for(ent in entities){
			// // pos=entities[ent].body.getPosition()
			// // if(pos[1]<-100)
				// // entities[ent].position.set(0,200,0);
			// // else
				// // entities[ent].position.set(pos[0],pos[1],pos[2]);
			// // entity.move.set([entity.body.getVelocity()[0],entity.body.getVelocity()[1],entity.body.getVelocity()[2],1])
			
		// }
		if(update)update=false;
	}
	this.getElements=function(){return elements;}
	this.whereIs=function(pos){
		var position=pos.clone().subSelf(zonePosition);
		if((-1/sqrt(3))*position.x - position.z + SIZE < 0){
			return 'NE';
		}else{if(position.x - SIZE*sqrt(3)/2 > 0 ){
				return 'E';
			}else {if((1/sqrt(3))*position.x - position.z - SIZE > 0){
					return 'SE';
				}else {if((-1/sqrt(3))*position.x - position.z - SIZE > 0){
						return 'SO';
					}else{if(position.x + SIZE*(sqrt(3)/2) <0){
							return 'O';
						}else {if((1/sqrt(3))*position.x - position.z + SIZE < 0){
								return 'NO'
							}else{
								return 0;
							}
						}
					}
				}
			}
		}
	}
	this.addElement=function(element){
		elements[element._id]=element;
		this.compositeElements[element._id]=element;
		for(adj in adjacent){
			if(adjacent[adj])
				adjacent[adj].compositeElements[element._id]=element;
		}
		// world.add(element.body)
			// console.log(element.body.getPosition())
	}
	this.addEntity=function(entity){
		this.addElement(entity)
		entities[entity._id]=entity;
		entity.view=this.compositeElements;
	}
	function passToAdjacent(ent,zone){
		delete entities[ent._id];
		delete elements[ent._id];
		for(adj in adjacent){
			if(adjacent[adj])
				delete adjacent[adj].compositeElements[ent._id];
		}
		ent.zone=adjacent[zone];
		adjacent[zone].addEntity(ent)
	}
	this.WorldRules=WorldRules={};
	WorldRules['target']=function(ent,data,timestamp){
		ent.target=data.target;
	}
	WorldRules['move']=function(ent,data,timestamp){
		ent.rotation.copy(data.rotation);
		ent.rotationmove=data.rotationmove;
		old_move=ent.move.clone();
		ent.move.copy(data.move);
		
		var now = new Date().getTime(),
		dt = now - (timestamp || now);
		if(ent.move.x||ent.move.z||ent.rotationmove){
			var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
			mat.rotateY(ent.rotationmove*dt*ent.rotationspeed);
			ent.rotation.getRotationFromMatrix( mat );
			var tmp_move=mat.crossVector(ent.move);
			tmp_move.w=0;
			ent.position.addSelf(tmp_move.normalize().multiplyScalar(dt*ent.speed));
			ent.activ=true;
		}else{
			var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
			mat.rotateY(ent.rotationmove*-dt*ent.rotationspeed);
			ent.rotation.getRotationFromMatrix( mat );
			var tmp_move=mat.crossVector(old_move.negate());
			tmp_move.w=0;
			ent.position.addSelf(tmp_move.normalize().multiplyScalar(dt*ent.speed));
			//ent.body.setVelocity(0,ent.body.getVelocity()[1],0)
			ent.activ=false;
		}
	}
}
exports.zoneHandler=function(data){
	
	id=data.id;
	zonePosition=new THREE.Vector3().copy(data.position);
	zone=new Zone(id,zonePosition);
	return zone;
	
	// scene = new THREE.Scene();
	// this.root=new THREE.Object3D();
	// this.root.position=zonePosition;
	// scene.add(this.root);

	
	// var lastUpdate=new Date().getTime();
	// var update=true;
	// var time;
	// this.simulate=function(){
		// var now = new Date().getTime();
		// var dt = now - (time || now);
		// if((now - lastUpdate)>1000){
			// update=true;
			// lastUpdate=now;
		// }
		// time = now;
		// for(ent in entities){
			// entity=entities[ent];
			// if(update){
				// ent.view=this.compositeElements;
			// }
			// if(entity.activ){
				// var mat=new THREE.Matrix4().setRotationFromEuler(entity.rotation,'XYZ');
				// mat.rotateY(entity.rotationmove*dt*entity.rotationspeed);
				// entity.rotation.getRotationFromMatrix( mat );
				// var tmp_move=mat.crossVector(entity.move);
				// tmp_move.w=0;
				// ret=isOutside(entity.position.clone().addSelf(tmp_move.multiplyScalar(dt*entity.speed)));
				// console.log((new THREE.Vector3().sub(entity.position,zonePosition)).x -SIZE*(sqrt(3)/2) > 0)
				// if(ret&&!adjacent[ret]){
					// console.log('stop:',ret)
					// entity.move.set([0,0,0,1])
					// entity.activ=false;
				// }else{
					// var rayFront = new THREE.Ray( entity.position, tmp_move.clone().normalize() );
					// var intersectsFront = rayFront.intersectObjects( scene.__objects );
					
					// if ( intersectsFront.length > 0 && tmp_move.length()>intersectsFront[0].distance ) {
						// entity.move.set([0,0,0,1])
						// console.log(collision)
					// }else{
						// var rayDown = new THREE.Ray( entity.position.clone().addSelf(new THREE.Vector3(0,5,0)), new THREE.Vector3(0,-5,0) );
						// var intersectsDown = rayDown.intersectObjects( scene.__objects );
						// tmp_move.normalize();
						// if(intersectsFront.length > 0){
							// dist= 5-intersectsFront[0].distance;
							// if(dist*dist >1)
								// dist=(dist>0)?1:-1;
							// tmp_move.y=dist;
						// }
						// entity.position.addSelf(tmp_move.multiplyScalar(dt*entity.speed));
					// }
					// if(ret&&adjacent[ret]){
						// console.log('pass:',ret)
						// passToAdjacent(entity,ret);
					// }
				// }
			// }
		// }
		// if(update)update=false;
	// }
	// this.getElements=function(){return elements;}
	// this.addElement=function(element){
		// elements[element._id]=element;
		// this.compositeElements[element._id]=element;
		// for(adj in adjacent){
			// if(adjacent[adj])
				// adjacent[adj].compositeElements[element._id]=element;
		// }
		// this.root.add(element.mesh);
	// }
	// this.addEntity=function(entity){
		// this.addElement(entity)
		// entities[entity._id]=entity;
		// entity.view=this.compositeElements;
	// }
	// this.receiveEntity=function(ent){
		// this.addEntity(ent);
		// this.root.add(ent.mesh);
	// }
	// function isOutside(pos){
		// console.log(zonePosition)
		// var position=pos.clone().subSelf(zonePosition);
		// if(position.x -SIZE*(sqrt(3)/2) > 0 ){
			// return '-E';
		// }else if(-sqrt(3)*position.x - position.z + SIZE < 0){
			// return 'NE';
		// }else if(sqrt(3)*position.x - position.z - SIZE > 0){
			// return 'SE';
		// }else if(-sqrt(3)*position.x - position.z - SIZE > 0){
			// return 'SO';
		// }else if(position.x + SIZE*(sqrt(3)/2) <0){
			// return '-O';
		// }else if(sqrt(3)*position.x - position.z + SIZE < 0){
			// return 'NO'
		// }
		// return 0;
	// }
	// function passToAdjacent(ent,zone){
		// delete entities[ent._id];
		// delete elements[ent._id];
		// for(adj in adjacent){
			// if(adjacent[adj])
				// delete adjacent[adj].compositeElements[ent._id];
		// }
		// this.root.remove(ent.mesh);
		// ent.zone=adjacent[zone];
		// adjacent[zone].receiveEntity(ent)
	// }
	// this.IsPointInside=function(pos){
		// console.log(this.id,":",zonePosition)
		// var position=pos.clone().subSelf(zonePosition);
		// var cnt=1;
		// if(-sqrt(3)*position.x - position.z + SIZE > 0){
			// cnt++
		// if(position.x < SIZE*sqrt(3)/2){
			// cnt++
		// if(sqrt(3)*position.x - position.z - SIZE < 0){
			// cnt++
		// if(-sqrt(3)*position.x - position.z - SIZE < 0){
			// cnt++
		// if(position.x > -SIZE*sqrt(3)/2){
			// cnt++
		// if(sqrt(3)*position.x - position.z + SIZE > 0){
			// return true;
		// }}}}}}
		// console.log("fail",cnt)
		// pos.length()
		// return false;
	// }
	// this.WorldRules=WorldRules={};
	// WorldRules['target']=function(ent,data,timestamp){
		// ent.target=data.target;
	// }
	// WorldRules['move']=function(ent,data,timestamp){
		// ent.rotation.copy(data.rotation);
		// ent.rotationmove=data.rotationmove;
		// old_move=ent.move.clone();
		// ent.move.copy(data.move);
		
		// var now = new Date().getTime(),
		// dt = now - (timestamp || now);
		// if(ent.move.length()||ent.rotationmove){
			// var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
			// mat.rotateY(ent.rotationmove*dt*ent.rotationspeed);
			// ent.rotation.getRotationFromMatrix( mat );
			// var tmp_move=mat.crossVector(ent.move);
			// tmp_move.w=0;
			// ent.position.addSelf(tmp_move.multiplyScalar(dt*ent.speed));
			// ent.activ=true;
		// }else{
			// var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
			// mat.rotateY(ent.rotationmove*-dt*ent.rotationspeed);
			// ent.rotation.getRotationFromMatrix( mat );
			// tmp_move=mat.crossVector(old_move);
			// tmp_move.w=0;
			// ent.position.addSelf(tmp_move.multiplyScalar(-dt*ent.speed));
			// ent.activ=false;
		// }
	// }
	// return this
}