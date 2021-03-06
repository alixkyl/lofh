LOH.World=function()
{
	scopeW=this;
	this.scene=new THREE.Scene();
	var objects={};
	var hitBoxes=[];
	var avatar;
	var selection;
	this.reset=function(){
		this.scene=new THREE.Scene();
		objects={};
		hitBoxes=[];
		avatar=0;
		selection=0;	
	}
	this.getAvatarPosition=function(){
		if(avatar)
			return avatar.getPosition();
		else
			return new Vec3();
	}
	this.setAvatarLookAt=function(pos){
		if(avatar)
			return avatar.getMesh().lookAt(pos);
	}

	
	dispatch['updateAvatarMove']=function(input){
		var move=new Vec4();
		var rotationmove=0;
		if(input.mouseRDown){
			if (input.left){
				move.x+=1
			}
			if (input.right){
				move.x+=-1
			}
		}else{
			if (input.left){
				rotationmove+=1;
			}
			if (input.right){
				rotationmove-=1;
			}
		}
		if (input.forward){
			move.z+=1;
		}
		if (input.backward){
			move.z+=-1;
		}
		avatar.SetRotationMove(rotationmove);
		avatar.SetMove(move);
		dispatch['GameEvent']({
			'func':'move'
			,'data':{
				'rotation':avatar.getRotation()
				,'move':avatar.getMove()
				,'rotationmove':avatar.getRotationMove()
			}
		});
	}
	
	this.changeSelection=function(ray){
		var intersects = ray.intersectObjects( hitBoxes );

		if ( intersects.length > 0 ) {
			var mesh=intersects[0].object;
			if(mesh.entId){
				if(selection.id != mesh.entId){
					if(selection)
						selection.select(false);
					if(objects[mesh.entId].selectable){
						selection=objects[mesh.entId];
						console.log(mesh.entId)
						selection.select(true);
					}else{
						selection=0
					}
				}
			}else{
				selection.select(false);
				selection=0;
			}
			dispatch['GameEvent']({
				"func":"target"
				,"data":{"target":selection.id||0}
			});
		}else{
			if(selection){
				selection.select(false);
				selection=0;
			}
		}
	}	
	this.update=function(dt){
		for(num in objects)
			objects[num].update(dt);	
	}
	
	this.load=function(which,callback){
		LOH.Ressources.getRessource(which,callback);
	}
	
	var addEntity=function(data){
		data.selectable=true;
		ent=new LOH.Entity(data);
		objects[data._id]=ent;
		scopeW.scene.add(ent.getMesh());
		hitBoxes.push(ent.hitbox);
	}
	var addMapElement=function(data){
		elem=new LOH.MapElement(data);
		objects[data._id]=elem;
		scopeW.scene.add(elem.getMesh());
		if(data.pattern=="4fee4e24e885b8f80500000e"){
			hexa=[[0,0,0]]
			for (i = 0; i < 6; i++) {
			  hexa.push([ Math.sin(2 * Math.PI * i / 6),0, Math.cos(2 * Math.PI * i / 6)]);
			}
			mesh=new THREE.Mesh(new THREE.PolyhedronGeometry(hexa,[[0,1,2],[0,2,3],[0,3,4],[0,4,5],[0,5,6],[0,6,1]],1000))
			mesh.position=new Vec3(elem.position.x,0,elem.position.z)
			scopeW.scene.add(mesh);
		}
	}
	this.addToScene=function(id){
		this.scene.add(objects[id].getMesh());
	}
	this.removeFromScene=function(id){
		this.scene.remove(objects[id].getMesh())
	}
	dispatch['Gamesync']=function(data){
		var now = new Date().getTime(),
		dt = now - (data.timestamp || now);
		for(id in data.objects){
			ent=data.objects[id];
			var tmp=objects[id];
			if(!tmp){
				if(ent.type=="Env")
					addMapElement(ent);
				else
					addEntity(ent);
			}else{
				if((tmp!=avatar)||(new Vec3().copy(ent.position).subSelf(tmp.getPosition()).length()>(tmp.speed*dt))){
					tmp.synchronize(ent,dt);
				}
			}
		}
		for(id in data.preload){
			ent=new LOH.Entity(data.preload[id]);
			if(data.preload[id]._id!=0){
				objects[data.preload[id]._id]=ent;
			}else{
				objects[data.preload[id].name]=ent;
			
			}
		}
		if(data.more){
		console.log(data.more.avatar)
			if(data.more.avatar){
				avatar=objects[data.more.avatar];
				dispatch['Clientsync']({'func':'setAvatarInfo','params':avatar})
			}
			
			for(id in data.more.ligths){
				LOH.Ressources.getRessource({'type':'lights','id':data.more.ligths[id]},function(ligth){scopeW.scene.add(ligth)})
			}
			
		}
	};
}