/*
**
**
**
*/

LOH.View=function(webGlContext){
	// scope=this;
	var activ=false;
	var UI,camera,input;
	var UIProfile={
		'LoadingScreen':{'UI':LOH.LoadingUI,'Camera':LOH.StaticCamera,'InitFunc':LoadingScreenInit}
		,'SelectScreen':{'UI':LOH.SelectScreenUI,'Camera':LOH.SelectScreenCamera,'InitFunc':SelectScreenInit}
		,'GameScreen':{'UI':LOH.GameUI,'Camera':LOH.thirdPersonCamera,'Input':LOH.Input,'InitFunc':GameScreenInit}
	}
	localDispatch={};
	this.switchUIProfil=function(mode,opt){
		activ=!activ;
		localDispatch={};
		if(UI){
			UI.unbind(webGlContext.domElement);
			delete UI;
		}
		UI=new UIProfile[mode].UI()
		UI.bind(webGlContext.domElement)
		if(input){
			input.unbindListeners();
			delete input;
		}
		if(UIProfile[mode].Input)
			input=new UIProfile[mode].Input(webGlContext.renderer.domElement);
		if(camera){
			world.scene.remove(camera.getCamera());
			delete camera;
		}
		camera=new UIProfile[mode].Camera(world,input);
		
		
		if(UIProfile[mode].InitFunc)
			UIProfile[mode].InitFunc.call(this,opt)
		animate();
	}
	
	function LoadingScreenInit(opt){
		world.reset();
		world.scene.add(camera.getCamera());
		world.load(opt,bind(this,function(){
			this.switchUIProfil(opt);
		}));
	}
	function SelectScreenInit(opt){
		world.reset();
		world.scene.add(camera.getCamera());
		dispatch['ClientEvent']({"id":'SelectReady'})
		localDispatch['setCharacters']=function(params){
			UI.init(params.data)
		}
		localDispatch['selectCharacter']=function(params){
			if(params.old)
				world.removeFromScene(params.old);
			if(params.select)
				world.addToScene(params.select);
			
		}
		dispatch['create']=bind(this,function(data){
			dispatch['ClientEvent']({'id':'CreateCharacter','which':data})
			this.switchUIProfil('LoadingScreen','GameScreen');
			delete dispatch['create'];
		});
		dispatch['play']=bind(this,function(data){
			dispatch['ClientEvent']({'id':'play','which':data})
			this.switchUIProfil('LoadingScreen','GameScreen');
			delete dispatch['play'];
		});
	}
	function GameScreenInit(opt){
		world.reset();
		world.scene.add(camera.getCamera());
		dispatch['ClientEvent']({"id":'GameReady'})
		localDispatch['chatMessage']=function(params){
			UI.chatMessage(params);
		}
		localDispatch['setAvatarInfo']=function(params){
			UI.setAvatarInfo(params);
		}
	}
	var world = new LOH.World();
	
	dispatch['Clientsync']=function(data){
		console.log('Clientsync(View):',data)
		localDispatch[data.func](data.params);
	}
	var time;
	animate=function(){
		if(activ){
			requestAnimationFrame(animate);
			var now = new Date().getTime(),
			dt = now - (time || now);
			time = now;
			camera.update(dt);
			world.update(dt)
			webGlContext.renderer.render( world.scene,camera.getCamera());
			webGlContext.stats.update();
			UI.update();
			THREE.SceneUtils.traverseHierarchy( world.scene, function ( node ) { if ( node instanceof THREE.LOD ) node.update( camera.getCamera() ) } );
		}else{
			activ=true
		}
	}
	
	this.stop=function(){;}
	
	window.addEventListener( 'resize', bind(this,onWindowResize), false );
	function onWindowResize( event ) {
	

		camera.getCamera().aspect = webGlContext.domElement.width/ webGlContext.domElement.height;
		camera.getCamera().updateProjectionMatrix();

	}
}







