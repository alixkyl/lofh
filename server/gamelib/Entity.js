map{
	Hexa:liste(Hexa)
}
//Hexatype=['camp','exploitation','hameau','village','bourg','cité']
Hexa=function(data){
	Interactive.call(this,data.interaction)
	var type=data.type;
	var owner;
	//*******buildings*******//
	var buildings=data.buildings;
	var nbBuildings=data.nbBuildings;
	var nbBuildingsMax=data.nbBuildingsMax;
	this.getBuildings=function(){return buildings;}
	this.addBuildings=function(building){buildings[building]=building;nbBuildings++;}
	this.getAvailableBuilding:function(){
		available=[]
		if(nbBatiment<nbBatimentMax)
			for(b in HexaBuilding[type].buildings){
				building=HexaBuilding[type].buildings[b]
				if(building.isAvailable(hexa))
					available.push(building)
			}	
		return available;
	}
	
	//*******upgrades*******//
	var upgrades=data.upgrades;
	this.getUpgrades=function(){return upgrades;}
	this.addUpgrade=function(upgrade){upgrades[upgrade._id]=upgrade;}
	
	//*******population*******//
	var population=new Population(data.population);
	var populationmax=0;
}
Population=function(data){
	var citizens=data.citizens;
	var soldiers=data.soldiers;
	var workers=data.workers;
	var engineers=data.engineers;
	var scientists=data.scientists;
	var merchants=data.merchants;
	var priests=data.priests;
	var admin=data.admin;
		
	this.getState=function(){
		state={
			citizens:[]
			,soldiers:[]
			,workers:[]
			,engineers:[]
			,scientists:[]
			,merchants:[]
			,priests:[]
			,admin:[]		
		}
		for(c in citizens)
			state.citizens.push(citizens[c]._id)
		for(s in soldiers)
			state.soldiers.push(soldiers[s]._id)
		for(w in workers)
			state.workers.push(workers[w]._id)
		for(e in engineers)
			state.engineers.push(engineers[e]._id)
		for(s in scientists)
			state.scientists.push(scientists[s]._id)
		for(m in merchants)
			state.merchants.push(merchants[m]._id)
		for(p in priests)
			state.priests.push(priests[p]._id)
		for(a in admin)
			state.admin.push(admin[a]._id)
			
		return state;
	}
};

Interaction=function(info,condition,process){
	this.execute(params,callback){
		condition(params,process,callback)
	}
	this.getInfo=function(){return info;}
}

Interactive=function(){
	interactions={};
	this.execute=function(interaction,params,callback){
		interactions[interaction].execute(params,callback);
	}
	this.getInteractions=function(){
		result={};
		for(i in interactions)
			result[i]=i
		return result;
	}
	this.addInteraction=function(_id,info,condition,process){
		interactions[_id]=new Interaction({'info':info,'condition':condition,'process':process});
	}
}

Entity=function(data){
	Interactive.call(this,data.interaction)
	this.Object3D=data.object
}

Character=function(data){
	Entity.call(this,data)
	var name=data.name
	this.carac=data.carac
	this.masters=data.masters
	this.skills=data.skills
	this.inventory=data.inventory;
	this.status=data.status;
	this.stats=compileStats();
	wounds={
		'a':{'threshold':10,'nb':0,'max':10}
		,'l':{'threshold':20,'nb':0,'max':8}
		,'D':{'threshold':30,'nb':0,'max':4}
		,'H':{'threshold':40,'nb':0,'max':2}
		,'M':{'threshold':50,'nb':0,'max':1}
	}
	fame={}//'faction_id':level
	this.addInteraction('inspecter','inspecter'
	,function(params,process,callback){process(params,callback);}
	,function(params,callback){
		callback({
			'name':name
		})
	});
	this.addInteraction('damage','damage'
	,function(params,process,callback){process(params,callback);}
	,function(params,callback){
		damages=params.damages;
		for(w in wounds){
			if(damages>wounds[w].threshold){
				damages-=wounds[w].threshold
				wounds[w].nb++;
			}else{
				break;
			}
		}
		callback();
	});

}
Building=function(data){
	
	Entity.call(this,data)
	var type=data.type
	var name=data.name
	var employees=data.employees
	
	buildProcess={
		labor:0
		,ressources:{}
		,'built':false
	}
	
	this.addInteraction('inspecter','inspecter'
	,function(params,process,callback){process(params,callback);}
	,function(params,callback){
		callback({
			'name':name
			,'type':type
			,'nbEmployees':Object.keys(employees).length
			,'build':buildprocess.built
		})
	});
	//-------
	this.addInteraction('buildProgress','buildProgress'
		,function(params,process,callback){
			process(params,callback);		
		}
		,function(params,callback){
		buildProcess.built=true;
		buildProcess.labor-=params.labor;
		if(buildProcess.labor > 0)
			buildProcess.built=false;
		for(r in params.ressources){
			buildProcess.ressources[r]-=params.ressources[r]
			if(buildProcess.ressources[r] > 0)
				buildProcess.built=false;
		}
		callback();
	});
	//-------
	this.addInteraction('Repaire','Repaire'
	,function(params,process,callback){
			process(params,callback);		
		}
	,function(params,callback){
			process(params,callback);
			
	});
	//-------
	this.addInteraction('Upgrade','Upgrade'
	,function(params,process,callback){
			process(params,callback);		
		}
	,function(params,callback){
			process(params,callback);
			
	});
}


HarvestPoint=function(data){
	Entity.call(this,data)

	type:{'forage','carrière','champ'}

	dommages:liste{
		light:{seuil:10,nb:6}
		deep:{seuil:20,nb:3}
		heavy:{seuil:30,nb:2}
		deadly:{seuil:40,nb:1}
	}
	amélioration:liste{solidity:{},rate:{},quality:{},quantity:{},actions:{}}
	//****************************
	this.addInteraction('inspecter','inspecter'
	,function(params,process,callback){process(params,callback);}
	,function(params,callback){
		callback({
			'name':name
			,'type':type
			,'nbEmployees':Object.keys(employees).length
			,'build':buildprocess.built
		})
	});
	//-------
	this.addInteraction('Harvest','Harvest'
	,function(params,process,callback){
			process(params,callback);		
		}
	,function(params,callback){
			process(params,callback);
			
	});
	//-------
	this.addInteraction('Repaire','Repaire'
	,function(params,process,callback){
			process(params,callback);		
		}
	,function(params,callback){
			process(params,callback);
			
	});
	//-------
	this.addInteraction('Upgrade','Upgrade'
	,function(params,process,callback){
			process(params,callback);		
		}
	,function(params,callback){
			process(params,callback);
			
	});
}
HexaBuilding{
	camp:{}
	exploitation:{
		amélioration:{
			palissade
			,chemin:
			,tour de guet:
			}
		buildings:{
			poste de garde
			,ponton
			,mine
			,carrière
			,scierie
			,ferme
			,relais
		}
	}
	hameau:{
		amélioration:{
			mur d'enceinte
			,route
		}
		buildings:{
			exploitation.buildings
			,habitation
			,forge(mine)
			,tailleur(carrière)
			,charpenterie(scierie)
			,moulin(ferme)
			,fumoir(ferme,ponton)
			,auberge(relais)
			,port(ponton)
			,entrepot
			,caserne(poste de garde)
		}
	}
	village:{
		amélioration:{
			chemin de ronde(mur d'enceinte)
			}
		buildings:{
			hameau.buildings
			administration
			,ecole
			,autel
			,marché
			,medecin
		}
	}
	bourg:{
		amélioration:{
			fossé
			}
		buildings:{
			village.buildings
			mairie(administration)
			,collège(école)
			,temple(autel)
			,arsenal(forge+caserne)
			,cale sèche(port+charpenterie)
			,guilde des marchands(marché)
			,hopital(medicin)
		}
	}
	cité:{
		amélioration:{

			}
		buildings:{
			bourg.buildings
			palais(mairie)
			,université(collège)
			,grand temple(temple)
		}
	}
}
ressource{
	-nom:
	-type:
	-stabilité:{}
	-rendement:{}
	-qualité:{}
	-quantité:{}
}

action:{
	time:0
	,progress=0
	,
}
collect:{
	duree:100
	,efficience,aggression
}
slot=function(type){
	this.type=type;
}

Storage=function(slots){
	this.slots=slots;
}
skill=function(){
	type:['passiv','activ','stand','permanent']
}
standBuild=function(stand,activSkill,passivSkill){
	name='NAME';

}
skillTree=function(){
	tree:{
		{
			skill:0
			needs:{}
		}
	}
}
masteryTree=function(){
	root={}
}
mastery=function(){
	name="NAME";
	exp=0;
	level=0;
	tree=new skillTree({
		
	
	
	
	
	})
}

actor=function(){
	
	stands={}
	stats={
		strength:0
		,dexterity:0
		,consitution:0
		,charisma:0
		,emphaty:0
		,will:0
		,reflexion:0
		,intuition:0
		,abstraction:0
	}
	skills={}
	masters={}
	inventory=new storage({
		head:new slot(1)
		,chest:new slot(1)
		,arms:new slot(1)
		,belt:new slot(1)
		,back:new slot(1)
		,cloak:new slot(1)
		,legs:new slot(1)
		,shoes:new slot(1)
		,gloves:new slot(1)
		,Rhand:new slot(1)
		,Lhand:new slot(1)
	})
}

