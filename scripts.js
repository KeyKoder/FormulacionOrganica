let grid = [];
let links = [];
let gridSize = 37.5;
let validTiles = [];
let visitedLinks = [];
let prefixes = ["met","et","prop","but","pent","hex","hept","oct","non","dec","undec","dodec","tridec","tetradec","pentadec","hexadec","heptadec","octadec","nonadec"]
let prefixesSpecial = ["","di","tri","tetr","pent","hex","hept","oct","non","dec","undec","dodec","tridec","tetradec","pentadec","hexadec","heptadec","octadec","nonadec"]

let debug = false;
function setup() {
	let cnv = createCanvas(1200,600);
	cnv.elt.oncontextmenu = () => {return false;}
	cnv.elt.style.display = "block"
	cnv.elt.style.marginTop = "5px"
	rows = height/gridSize;
	cols = width/gridSize;

	textAlign(CENTER, CENTER)
	document.getElementById("type").linkstarted = false;
	document.getElementById("type").linkId = Math.floor((Math.random()*0.5-1)*32000);
}

function draw() {
	background(230);

	drawGrid();
	resetHydrogens();
	drawLinks();
	for(let tile of grid){
		drawTile(tile);
	}

	x = floor(map(mouseX,0,width,0,cols));
	y = floor(map(mouseY,0,height,0,rows));

	if(isValid(x,y) || grid.length == 0){
		fill(0,0,255,128);
	}else{
		fill(255,0,0,128);
	}
	noStroke();
	rect(x*gridSize,y*gridSize,gridSize,gridSize)
	fill(255);
	textSize(40);
	text("+",x*gridSize+40/2,y*gridSize+40/2);

	if(grid.length > 0){
		validTiles = getValidTiles();
		// links = getConnections();
	}else{
		validTiles = [];
	}

	
	if(debug){
		fill(0)
		textSize(20)
		text(x+","+y,40,40)
		fill(128,0,0)
		text(getTile(x,y).uuid,40,80)
	}
}

function mouseReleased(){
	let type = document.getElementById("type").value, select = document.getElementById("type");
    if((validTiles.length == 0 && x>=0 && x<=cols && y>=0 && y<=rows) || (validTiles.length > 0 && isValid(x,y))){
		if(mouseButton == "left" && getTile(x,y) == -1 && ["esimple","edoble","etriple"].indexOf(type) == -1 && type == "halogeno"){
            let tile = {
                x: x,
				y: y,
				type: type,
				subtype: document.getElementById("halogeno").value
            }
			grid.push(tile);
		}else if(mouseButton == "left" && getTile(x,y) == -1 && ["esimple","edoble","etriple"].indexOf(type) == -1){
            let tile = {
                x: x,
				y: y,
				type: type
            }
			grid.push(tile);
		}
	}
	if(mouseButton == "left" && getTile(x,y) != -1 && ["esimple","edoble","etriple"].indexOf(type) != -1 && !select.linkstarted){
		let tile = {
			x: x,
			y: y,
			linkId: select.linkId,
			linkType: type,
			type: "linkstart"
		}
		grid.push(tile);
		select.linkstarted = true;
	}else if(mouseButton == "left" && getTile(x,y) != -1 && ["esimple","edoble","etriple"].indexOf(type) != -1 && select.linkstarted){
		let tile = {
			x: x,
			y: y,
			linkId: select.linkId,
			type: "linkend"
		}
		grid.push(tile);
		select.linkstarted = false;
		select.linkId = Math.floor((Math.random()*0.5-1)*32000);
	}else if(mouseButton == "left" && getTile(x,y) != -1 && type == "startAnalysis" && getTilesByType("startAnalysis").length == 0){
		let tile = {
			x: x,
			y: y,
			type: "startAnalysis"
		}
		grid.push(tile);
	}
	if(mouseButton == "right"){
		let index = grid.indexOf(getTilesAt(x,y).reverse()[0]);
		if(index != -1){
			grid.splice(index,1)
		}
	}
}

function keyPressed(){
	let select = document.getElementById("type");
	if(key == "1"){
		select.value = "esimple"
	}else if(key == "2"){
		select.value = "edoble"
	}else if(key == "3"){
		select.value = "etriple"
	}else if(keyCode == 13){ // Enter
		document.getElementById("generar").click();
	}else if(key == " "){ // Spacebar
		select.value = "hidrocarburo";
	}else if(key == "h"){
		select.value = "halogeno";
	}
	select.onchange()	
}

document.getElementById("generar").onclick = function(){
	visitedLinks = [];
	resetWeights();
	let startingPoint = getTilesByType("startAnalysis")[0];
	if(!startingPoint){
		document.getElementById("type").value = "startAnalysis";
		alert("Pon el inicio del análisis por favor.");
		return;
	}
	let startTile = getTile(startingPoint.x,startingPoint.y).uuid;
	fixLinks();
	getWeigths(findLinksAttachedTo(startTile)[0],0);
	
	let highestWeightTiles = getHighestWeights();
	let {string:mainString, links:mainStringLinks} = getMainString(highestWeightTiles);
	mainString.reverse();
	mainStringLinks.reverse();
	let radicals = findRadicals(mainString);
	// Original from https://stackoverflow.com/questions/10630766/how-to-sort-an-array-based-on-the-length-of-each-element
	radicals.sort(function(a, b){
		// ASC  -> a then b
		// DESC -> b then a
		let positionA = getTileByUuid(a.tile).weight+1;
		let positionB = getTileByUuid(b.tile).weight+1;
		return a.name.localeCompare(b.name) || positionA < positionB;
	});
	if(debug) console.log(radicals)
	let name = prefixes[mainString.length-1];
	
	let notPutVocal = ["a","e","i","o","u","-","",undefined];

	if(!containsNLink(mainStringLinks,2) && !containsNLink(mainStringLinks,3)){
		name+="ano"
	}
	if(containsNLink(mainStringLinks,2)){
		let doubles = getLinksByTypeIn(mainStringLinks,"edoble");
		doubles.sort(function(a, b){
			// ASC  -> a then b
			// DESC -> b then a
			let positionA = mainString.indexOf(getTileByUuid(a.start))+1;
			let positionB = mainString.indexOf(getTileByUuid(b.start))+1;
			return positionA < positionB;
		});
		if(mainString.length > 2){
			for(let link of doubles){
				let position = mainString.indexOf(getTileByUuid(link.start))+1;
				name+=position+","
			}
		}
		if(containsNLink(mainStringLinks,3)) name+=prefixesSpecial[doubles.length-1]+"en"
		else name+=prefixesSpecial[doubles.length-1]+"eno"
	}
	if(containsNLink(mainStringLinks,3)){
		let triples = getLinksByTypeIn(mainStringLinks,"etriple");
		triples.sort(function(a, b){
			// ASC  -> a then b
			// DESC -> b then a
			let positionA = mainString.indexOf(getTileByUuid(a.start))+1;
			let positionB = mainString.indexOf(getTileByUuid(b.start))+1;
			return positionA < positionB;
		});
		if(mainString.length > 2){
			for(let link of triples){
				let position = mainString.indexOf(getTileByUuid(link.start))+1;
				name+=position+","
			}
		}
		name+=prefixesSpecial[triples.length-1]+"ino"
	}

	if(radicals.length > 0){
		let radicalNames = "";
		let lastName = radicals[0].name;
		let radicalCount = -1;
		for(let radical of radicals.concat({stop:true})){
			if(!radical.stop){
				if(lastName != radical.name){
					if(radicalCount != -1){
						radicalNames += prefixesSpecial[radicalCount]+lastName+"-";
						lastName = radical.name;
						radicalCount = -1;
					}
				}
				radicalNames += (getTileByUuid(radical.tile).weight+1)+","
				radicalCount++;
			}else{
				radicalNames += prefixesSpecial[radicalCount]+lastName;
				lastName = radical.name;
				radicalCount = 0;
			}
		}
		if(radicalNames.endsWith("-"))
			radicalNames = radicalNames.substring(0,radicalNames.length-1);
		name = radicalNames + name;
	}
	name = name.replace(/(\d+)-(\d+)/g,"$1,$2")
	console.log(name)
	name = name.replace(/((\d[,]?)+)/g,"-$1-");
	console.log(name)
	name = name.replace(/[-,]-/g,"-");
	console.log(name)
	if(name.startsWith("-")) name = name.substring(1)
	document.getElementById("nombreCompuesto").value = name;
}

// Para recolocar links basados en que pos(start) > pos(end); pos(x) = posición de x
function fixLinks(){
	for(let link of links){
		let start = getTileByUuid(link.start);
		let end = getTileByUuid(link.end);
		if(start.x > end.x){
			let tmp = link.start
			link.start = link.end
			link.end = tmp;
		}
	}
}

// AKA Contar Carbonos
function getWeigths(link,lastWeight){
	if(isLinkInArray(visitedLinks,link)) return;
	visitedLinks.push(link);
	let start = getTileByUuid(link.start);
	let end = getTileByUuid(link.end);
	// Recolocar enlaces mal puestos en fixLinks
	// Casos más o menos genéricos
	if((getTilesByType("startAnalysis")[0].x > start.x && start.x < end.x && start.weight == null) ||
	(getTilesByType("startAnalysis")[0].x < start.x && start.x > end.x) ||
	(getTilesByType("startAnalysis")[0].x < start.x && start.x < end.x && start.weight == null) ||
	(getTilesByType("startAnalysis")[0].y > start.y && start.y < end.y) ||
	(getTilesByType("startAnalysis")[0].y < start.y && start.y > end.y && start.weight == null) ||
	// Casos particulares (no es muy probable que ocurran)
	(getTilesByType("startAnalysis")[0].x == start.x && getTilesByType("startAnalysis")[0].y != start.y)){
		let tmp = link.start
		link.start = link.end
		link.end = tmp;
		if(debug) console.log(`Flipping:
		Start: (${start.x},${start.y}) => (${end.x},${end.y})
		End: (${end.x},${end.y}) => (${start.x},${start.y})`)
		
		start = getTileByUuid(link.start);
		end = getTileByUuid(link.end);
	}
	if(start.weight == null && start.type == "hidrocarburo")
		start.weight = lastWeight;
	
	if(end.weight == null && end.type == "hidrocarburo")
		end.weight = lastWeight+1;
	if(start.type == "hidrocarburo"){
		for(let attachedLink of findLinksAttachedTo(link.start)){
			if(isLinkInArray(visitedLinks,attachedLink)) continue;
			
			getWeigths(attachedLink,start.weight)
		}
	}
	if(end.type == "hidrocarburo"){
		for(let attachedLink of findLinksAttachedTo(link.end)){
			if(isLinkInArray(visitedLinks,attachedLink)) continue;
			
			getWeigths(attachedLink,end.weight)
		}
	}
}

function getMainString(tileArray){
	let mainStrings = [];
	let links = [];
	for(let tile of tileArray){
		if(debug) console.log(tile)
		let thisString = [];
		thisString.push(tile)
		let attachedLinks = findLinksAttachedTo(tile.uuid);
		let minWeight = tile.weight;
		let min = -1;
		for(let link of attachedLinks){
			if(getTileByUuid(link.start).weight < minWeight){
				minWeight = getTileByUuid(link.start).weight;
				min = link.start;
				links.push(link);
			}
		}
		if(min == -1) continue;
		let {string, links:otherLinks} = getMainString([getTileByUuid(min)])
		if(string.length < 1000) thisString = thisString.concat(string)
		else thisString.push(getTileByUuid(min))
		links = links.concat(otherLinks)
		mainStrings.push(thisString)
		if(debug) console.log(thisString)
	}
	let mainString = Array(1000);
	if(debug) console.log(mainStrings)
	for(let string of mainStrings){
		if(string.length < mainString.length){
			mainString = string;
		}
	}
	return {string:mainString,links:links};
}

function findRadicals(string,indexToStart = 0){
	let radicals = [];
	let links = [];
	for(let i=indexToStart;i<string.length;i++){
		let tile = string[i];
		let attachedLinks = findLinksAttachedTo(tile.uuid);
		for(let link of attachedLinks){
			let radical = []
			if(!isTileInArray(string,getTileByUuid(link.start))){
				if(debug) console.log("Start not in string")
				radical.push(getTileByUuid(link.end));
				let others = findRadicals(string.concat([getTileByUuid(link.start)]),string.length);
				for(let other of others){
					if(other && radical.indexOf(other.radical) == -1)
						radical = radical.concat(other.radical)
					
					if(other && radical.indexOf(other.links) == -1)
						links = links.concat(other.links)
				}
				if(debug) console.log(radical)
				if(!isLinkInArray(links,link)){
					links.push(link)
				}
			}
			if(!isTileInArray(string,getTileByUuid(link.end))){
				if(debug) console.log("End not in string")
				radical.push(getTileByUuid(link.end));
				let others = findRadicals(string.concat([getTileByUuid(link.end)]),string.length);
				for(let other of others){
					if(other && radical.indexOf(other) == -1)
						radical = radical.concat(other.radical)

					if(other && radical.indexOf(other.links) == -1)
						links = links.concat(other.links)
				}
				if(debug) console.log(radical)
				if(!isLinkInArray(links,link)){
					links.push(link)
				}
			}

			radical.removeAll(undefined);
			if(radical.length > 0){
				let rad = {tile:link.start,radical:radical,links:links};
				let name = getSpecialRadical(rad);
				if(name != undefined)
					rad.name = name;
				radicals.push(rad)
			}
		}
	}
	if(debug) console.log(radicals)
	return radicals;
}

function getSpecialRadical(radical){
	let startX = radical.radical[0].x, startY = radical.radical[0].y;
	let relPositions = [];
	let type = radical.radical[0].type;
	for(let rad of radical.radical){
		relPositions.push([Math.abs(rad.x-startX),Math.abs(rad.y-startY)])
	}
	if(relPositions.containsArray([0,0]) &&
	relPositions.containsArray([1,0]) &&
	relPositions.containsArray([0,1]) &&
	relPositions.length == 3){
		return "isopropil";
	}
	
	let name = "";
	if(type == "hidrocarburo"){
		let radicalType = prefixes[radical.radical.length-1];
		name+=radicalType
		if(containsNLink(radical.links,2)){
			let doubles = getLinksByTypeIn(radical.links,"edoble");
			doubles.sort(function(a, b){
				// ASC  -> a then b
				// DESC -> b then a
				let positionA = radical.radical.indexOf(getTileByUuid(a.start))+1;
				let positionB = radical.radical.indexOf(getTileByUuid(b.start))+1;
				return positionA < positionB;
			});
			if(radical.radical.length > 2){
				for(let link of doubles){
					let position = radical.radical.indexOf(getTileByUuid(link.start))+1;
					name+=position
				}
			}
			name+=prefixesSpecial[doubles.length-1]+"en"
		}
		if(containsNLink(radical.links,3)){
			let triples = getLinksByTypeIn(radical.links,"etriple");
			triples.sort(function(a, b){
				// ASC  -> a then b
				// DESC -> b then a
				let positionA = radical.radical.indexOf(getTileByUuid(a.start))+1;
				let positionB = radical.radical.indexOf(getTileByUuid(b.start))+1;
				return positionA < positionB;
			});
			if(radical.radical.length > 2){
				for(let link of triples){
					let position = radical.radical.indexOf(getTileByUuid(link.start))+1;
					name+=position+","
				}	
			}
			name+=prefixesSpecial[triples.length-1]+"in"
		}
		name+="il";
	}else if(type == "halogeno" && radical.radical.length == 1){
		let subtype = radical.radical[0].subtype;
		if(subtype == "F"){
			name+="flúor"
		}else if(subtype == "Cl"){
			name+="cloro"
		}else if(subtype == "Br"){
			name+="bromo"
		}else if(subtype == "I"){
			name+="yodo"
		}
	}
	if(name) return name;
}

Array.prototype.removeAll = function(elt){
	while(this.indexOf(elt) != -1){
		this.splice(this.indexOf(elt),1);
	}
}

Array.prototype.containsArray = function(arr){
	for(let elt of this){
		if(elt.length == arr.length){
			let equals = true;
			for(let i=0;i<elt.length;i++){
				if(elt[i] != arr[i]){
					equals = false;
				}
			}
			if(equals) return true;
		}
	}
	return false;
}

document.getElementById("type").onchange = function(e){
	document.getElementById("halogeno").style.display = "none";
	if(document.getElementById(this.value) != null){
		document.getElementById(this.value).style.display = "inline-block";
	}
}