var DB=require('../DBacces.js');
var ObjectId = require('bson').ObjectID;
exports.getRessource=function(req,callback){
	
	console.log(req)
	if(req == 'GameScreen'|| req == 'SelectScreen'){
		DB.collection('ressources').find({'pack':req},function(err,pack){
			var result={}
			for(ress in pack){
				console.log('ressourceQuery',req,":",pack[ress].name)
				if(!result[pack[ress].type])
					result[pack[ress].type]={}
				result[pack[ress].type][pack[ress]._id]=pack[ress].data;
			}
			callback({'id':req,'ressource':result});
		});
	}else{
		DB.collection('ressources').findOne({'_id':ObjectId(req)},function(err,ress){
			var result={}
			if(ress){
				result[ress.type]={}
				result[ress.type][ress._id]=ress.data;
				console.log('ressourceQuery',req,":",result)
			}
			callback({'id':req,'ressource':result});
		});
	}
}