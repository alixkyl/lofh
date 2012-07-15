
LOH.WebGLBased=function(resolution){

	this.domElement=document.createElement('div');
	this.domElement.width=resolution.width;
	this.domElement.height=resolution.height;
	
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.sortObjects = false;
	this.renderer.setSize(this.domElement.width , this.domElement.height);
	this.renderer.domElement.contentEditable=true;
	this.renderer.domElement.style.cursor='default';
	this.domElement.appendChild( this.renderer.domElement );
	
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.stats.domElement.style.zIndex = 100;
	this.domElement.appendChild( this.stats.domElement );
	window.addEventListener( 'resize', bind(this,onWindowResize), false );
	function onWindowResize( event ) {
	
		this.domElement.width = window.innerWidth;
		this.domElement.height = window.innerHeight;

		this.renderer.setSize( this.domElement.width, this.domElement.height );
	}
	this.ondragOver = function ( event ) {
		event.preventDefault()
	}
	this.ondrop = function ( event ) {
		event.preventDefault();
		var data=event.dataTransfer.getData("Text");
		elem=document.getElementById(data)
		elem.style.top=event.clientY+'px';
		elem.style.left=event.clientX+'px';
	}
	this.renderer.domElement.addEventListener( 'drop', bind( this, this.ondrop ), false );
	this.renderer.domElement.addEventListener( 'dragover', bind( this, this.ondragOver ), false );
	
}

LOH.SelectScreenUI=function(){
	
	
	var nameDiv=document.createElement('div');
	nameDiv.style.position = 'absolute';
	nameDiv.style.top = '10px';
	nameDiv.style.right = window.innerWidth/2+'px';
	
	
	var nameText=document.createElement('p');
	nameText.innerHTML='NAME:';
	nameDiv.appendChild(nameText);
	
	var nameField=document.createElement('input');
	nameField.value="NAME";
	nameField.type='text';
	nameField.style.top = '10px';
	nameField.style.right = '100px';
	nameDiv.appendChild(nameField);
	
	var createButton=document.createElement('input');
	createButton.type='button';
	createButton.onclick=function(){dispatch['create'](currentSlot);};
	createButton.value='CREATE';
	createButton.style.position = 'absolute';
	createButton.style.bottom = '10px';
	createButton.style.right = '10px';
	createButton.style.zIndex = 100;
	createButton.style.display="none"
	
	
	
	var playButton=document.createElement('input');
	playButton.type='button';
	playButton.onclick=function(){dispatch['play'](currentSlot);};
	playButton.value='PLAY';
	playButton.style.position = 'absolute';
	playButton.style.bottom = '10px';
	playButton.style.right = '10px';
	playButton.style.zIndex = 100;
	playButton.style.display="none"
	
	
	var charDiv=document.createElement('div');
	charDiv.style.position = 'absolute';
	charDiv.style.bottom = '10px';
	charDiv.style.right = window.innerWidth/2+'px';
	
	
	var character1=document.createElement('input');
	character1.type='button';
	character1.value='character1';
	character1.onclick=function(){selectSlot('slot1')};
	charDiv.appendChild(character1);
	var character2=document.createElement('input');
	character2.type='button';
	character2.value='character2';
	character2.onclick=function(){selectSlot('slot2')};
	charDiv.appendChild(character2);
	var character3=document.createElement('input');
	character3.type='button';
	character3.value='character3';
	character3.onclick=function(){selectSlot('slot3')};
	charDiv.appendChild(character3);
	slotList={};
	this.init=function(entities){
		console.log(entities)
		slotList=entities;
		selectSlot('slot1');
	}
	currentSlot=0;
	function selectSlot(num){
		if(currentSlot != num){
			if(slotList[num] != 0){
				playButton.style.display="block";
				createButton.style.display="none";				
			}else{
				playButton.style.display="none";
				createButton.style.display="block";
			}
			select=slotList[num]||num
			old=slotList[currentSlot]||currentSlot
			dispatch['Clientsync']({'func':'selectCharacter','params':{'select':select,'old':old}});
			currentSlot=num;
		}
	}
	this.bind=function(domElement){
		domElement.appendChild(nameDiv);
		domElement.appendChild(playButton);
		domElement.appendChild(createButton);
		domElement.appendChild(charDiv);
	}
	this.unbind=function(domElement){
		domElement.removeChild(nameDiv);
		domElement.removeChild(playButton);
		domElement.removeChild(createButton);
		domElement.removeChild(charDiv);
	}
	this.update=function(){ }
}
LOH.LoadingUI=function(){
	var nameText=document.createElement('p');
	nameText.innerHTML="LOADING";
	nameText.style.position = 'absolute';
	nameText.style.bottom = window.innerHeight/2+'px';
	nameText.style.right = window.innerWidth/2+'px';
	
	this.bind=function(domElement){
		domElement.appendChild(nameText);
	}
	this.unbind=function(domElement){
		domElement.removeChild(nameText);
	}
	this.update=function(){ }
}
LOH.GameUI=function(){
	
	// this.domElement.style.position = 'absolute';
	// this.domElement.style.top = '0px';
	// this.domElement.style.left = '0px';
	// this.domElement.style.width='100%'
	// this.domElement.style.height='100%'
	// this.domElement.style.display='none'
    // // this.domElement.style.width=100%;
	// // this.domElement.style. height=70px;

	//this.domElement.style.overflow="hidden"
	//*********************************************/

	//*********************************************/
	var targetInfo=document.createElement('div');

	//*********************************************/
	chat=new Chat()
	Pinfo=new PlayerInfo()
	aBar=new SlotBar()
	this.bind=function(domElement){
		domElement.appendChild(chat.domElement);
		domElement.appendChild(Pinfo.domElement);
		domElement.appendChild(aBar.domElement);

	}
	this.unbind=function(domElement){
		domElement.removeChild(chat.domElement);
		domElement.removeChild(Pinfo.domElement);
		domElement.removeChild(aBar.domElement);
	}
	//*********************************************/
	this.chatMessage=function(msg){	chat.chatMessage(msg)}
	this.setAvatarInfo=function(src){	Pinfo.setSrc(src)}
	//*********************************************/
	this.update=function(){ 
		Pinfo.update();
		aBar.update();
	}
	
	
}

UIwindow=function(){
	this.domElement=document.createElement('div');
	this.domElement.style.display='block';
	this.domElement.setAttribute('draggable', 'true');
	this.ondrag = function ( event ) {
		event.dataTransfer.effectAllowed = 'all';
		event.dataTransfer.dropEffect='move';
		event.dataTransfer.setData("Text",event.target.id);
	}
	this.ondragOver = function ( event ) {
		event.preventDefault()
	}
	this.ondrop = function ( event ) {
		event.preventDefault();
		var data=event.dataTransfer.getData("Text");
		elem=document.getElementById(data)
		elem.style.top=event.clientY+'px';
		elem.style.left=event.clientX+'px';
	}
	addEventListener( 'dragstart', bind( this, this.ondrag ), false );
	this.domElement.className ='UIwindow';
	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}
		event.stopPropagation();
	};

	this.onMouseUp = function ( event ) {
		event.stopPropagation();
	};
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'drop', bind( this, this.ondrop ), false );
	this.domElement.addEventListener( 'dragover', bind( this, this.ondragOver ), false );
}
Chat=function(){
	UIwindow.call(this);
	this.domElement.id="chat";
	var chatTextBox=document.createElement('div');
	chatTextBox.className ='textBox';
	this.domElement.appendChild(chatTextBox);
	var chatTextInput=document.createElement('input');
	chatTextInput.value="NAME";
	chatTextInput.type='text';
	chatTextInput.className ='textInput';
	this.domElement.appendChild(chatTextInput);
	
	this.chatMessage=function(msg){
		var msgln=document.createElement('pre');
		msgln.innerHTML=msg;
		chatTextBox.appendChild(msgln);
	}
	
	this.sendMessage=function(event){
		event.stopPropagation();
		if(chatTextInput.value && event.which==13){
			dispatch['ClientEvent']({'id':'ChatMSG','msg':chatTextInput.value})
			console.log(chatTextInput.value)
			chatTextInput.value="";
		}
	}
	chatTextInput.addEventListener( 'keypress', bind( this,this.sendMessage) , true );
}
PlayerInfo=function(){
	UIwindow.call(this);
	var infoSrc;
	this.domElement.id="playerInfo";
	var nameText=document.createElement('p');
	nameText.innerHTML='NAME:';
	this.domElement.appendChild(nameText);
	this.update=function(){
		if(infoSrc){
			nameText.innerHTML=infoSrc.name||"";
	
		}
	}
	this.setSrc=function(src){
		infoSrc=src;
	
		this.update();
	}
	;

}
SlotBar=function(){
	UIwindow.call(this);
	this.domElement.id="ActionBar";

	this.update=function(){
	
	
	
	}
	this.setSrc=function(src){
	
	
		this.update();
	}
	var ButtonBar=document.createElement('div');
	var slots=[];
	for(i=0;i<5;i++){
		slots[i]=document.createElement('img');
		slots[i].src='/static/textures/minecraft/grass.png';
		slots[i].setAttribute('draggable', 'false');
		slots[i].ondragOver = function ( event ) {
			event.preventDefault()
		}
		slots[i].ondrop = function ( event ) {
			event.preventDefault();
			var data=event.dataTransfer.getData("Text");
			elem=document.getElementById(data)
			if(elem.className=='actionButton'){
				elem.style.top=event.clientY+'px';
				elem.style.left=event.clientX+'px';
			}
		}
		ButtonBar.appendChild(slots[i]);
	}
	this.domElement.appendChild(ButtonBar);
}

