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
}

function mouseReleased(){
	let type = document.getElementById("type").value, select = document.getElementById("type");
    if((validTiles.length == 0 && x>=0 && x<=cols && y>=0 && y<=rows) || (validTiles.length > 0 && isValid(x,y))){
        if(mouseButton == "left" && getTile(x,y) == -1 && ["esimple","edoble","etriple"].indexOf(type) == -1){
            let tile = {
                x: x,
				y: y,
				h:4,
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
	}
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
	let mainString = getMainString(highestWeightTiles);
	mainString.reverse();
	let radicals = findRadicals(mainString);
	// Original from https://stackoverflow.com/questions/10630766/how-to-sort-an-array-based-on-the-length-of-each-element
	radicals.sort(function(a, b){
		// ASC  -> a then b
		// DESC -> b then a
		let positionA = getTileByUuid(a.tile).weight+1;
		let positionB = getTileByUuid(b.tile).weight+1;
		return prefixes[b.radical.length].localeCompare(prefixes[a.radical.length]) || positionA < positionB;
	});
	if(debug) console.log(radicals)
	let name = prefixes[mainString.length-1];
	if(!containsNLink(visitedLinks,2) && !containsNLink(visitedLinks,3)){
		name+="ano"
	}
	if(containsNLink(visitedLinks,2)){
		let doubles = getLinksByType("edoble");
		doubles.sort(function(a, b){
			// ASC  -> a then b
			// DESC -> b then a
			let positionA = mainString.indexOf(getTileByUuid(a.start))+1;
			let positionB = mainString.indexOf(getTileByUuid(b.start))+1;
			return positionA < positionB;
		});
		for(let link of doubles){
			let position = mainString.indexOf(getTileByUuid(link.start))+1;
			name+="-"+position
		}
		name+="-"+prefixesSpecial[doubles.length-1]+"eno"
	}
	if(containsNLink(visitedLinks,3)){
		let triples = getLinksByType("etriple");
		triples.sort(function(a, b){
			// ASC  -> a then b
			// DESC -> b then a
			let positionA = mainString.indexOf(getTileByUuid(a.start))+1;
			let positionB = mainString.indexOf(getTileByUuid(b.start))+1;
			return positionA < positionB;
		});
		for(let link of triples){
			let position = mainString.indexOf(getTileByUuid(link.start))+1;
			name+="-"+position
		}
		name+="-"+prefixesSpecial[triples.length-1]+"ino"
	}

	let notPutVocal = ["a","e","i","o","u","-","",undefined];

	if(radicals.length > 0){
		let radicalNames = ""
		let lastRadicalLength = -1;
		let currentRadicalName = "";
		for(let radical of radicals){
			let position = getTileByUuid(radical.tile).weight+1;
			if(lastRadicalLength != radical.radical.length){
				if(lastRadicalLength != -1){
					let prevRadicalCount = currentRadicalName.split("-").length-1;
					let radicalType = prefixes[lastRadicalLength-1];
					let radicalCountPrefix = prefixesSpecial[prevRadicalCount-1];
					currentRadicalName+=radicalCountPrefix+(notPutVocal.indexOf(radicalType[0]) == -1 && notPutVocal.indexOf(radicalCountPrefix[radicalCountPrefix.length-1]) == -1 ? "a" : "")+radicalType+"il-"
				}
				radicalNames+=currentRadicalName;
				currentRadicalName = "";
				currentRadicalName+=position+"-"
				lastRadicalLength = radical.radical.length;
			}else{
				currentRadicalName+=position+"-"
			}
		}
		// Para el último radical que se sale del bucle sin añadirlo
		radicalNames+=currentRadicalName;
		let prevRadicalCount = currentRadicalName.split("-").length-1;
		let radicalCountPrefix = prefixesSpecial[prevRadicalCount-1];
		radicalNames+=prefixesSpecial[prevRadicalCount-1]+(notPutVocal.indexOf(prefixes[radicals[radicals.length-1].radical.length-1][0]) == -1 && notPutVocal.indexOf(radicalCountPrefix[radicalCountPrefix.length-1]) == -1 ? "a" : "")+prefixes[radicals[radicals.length-1].radical.length-1]+"il-"

		name = radicalNames.substring(0,radicalNames.lastIndexOf("-")) + name;
	}
	while(name.match(/(\d+)-(\d+)/)){
		name = name.replace(/(\d+)-(\d+)/,"$1,$2")
	}
	document.getElementById("nombreCompuesto").value = name;
}

// Para recolocar links basados en que pos(start) > pos(end)
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
	// Aprovechar y recolocar enlaces mal puestos en fixLinks
	if((getTilesByType("startAnalysis")[0].x > start.x && start.x < end.x && start.weight == null) ||
	(getTilesByType("startAnalysis")[0].x < start.x && start.x > end.x) ||
	(getTilesByType("startAnalysis")[0].y > start.y && start.y < end.y) ||
	(getTilesByType("startAnalysis")[0].y < start.y && start.y > end.y && start.weight == null)){
		let tmp = link.start
		link.start = link.end
		link.end = tmp;
		if(debug) console.log(`Flipping:
		Start: (${start.x},${start.y}) => (${end.x},${end.y})
		End: (${end.x},${end.y}) => (${start.x},${start.y})`)
		
		start = getTileByUuid(link.start);
		end = getTileByUuid(link.end);
	}
	if(start.weight == null)
		start.weight = lastWeight;
	
	if(end.weight == null)
		end.weight = lastWeight+1;
	for(let attachedLink of findLinksAttachedTo(link.start)){
		if(isLinkInArray(visitedLinks,attachedLink)) continue;
		
		getWeigths(attachedLink,start.weight)
	}
	for(let attachedLink of findLinksAttachedTo(link.end)){
		if(isLinkInArray(visitedLinks,attachedLink)) continue;
		
		getWeigths(attachedLink,end.weight)
	}
}

function getMainString(tileArray){
	let mainStrings = [];
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
			}
		}
		if(min == -1) continue;
		let string = getMainString([getTileByUuid(min)])
		if(string.length < 1000) thisString = thisString.concat(string)
		else thisString.push(getTileByUuid(min))
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
	return mainString;
}

function findRadicals(string,indexToStart = 0){
	let radicals = [];
	for(let i=indexToStart;i<string.length;i++){
		let tile = string[i];
		let attachedLinks = findLinksAttachedTo(tile.uuid);
		for(let link of attachedLinks){
			let radical = []
			if(!isTileInArray(string,getTileByUuid(link.start))){
				if(debug) console.log("Start not in string")
				radical.push(getTileByUuid(link.start));
				radical = radical.concat(findRadicals(string.concat([getTileByUuid(link.start)]),string.length)[0])
				if(debug) console.log(radical)
			}
			if(!isTileInArray(string,getTileByUuid(link.end))){
				if(debug) console.log("End not in string")
				radical.push(getTileByUuid(link.end));
				let other = findRadicals(string.concat([getTileByUuid(link.end)]),string.length)[0];
				if(other)
					radical = radical.concat(other.radical)
				if(debug) console.log(radical)
			}

			radical.removeAll(undefined);
			if(radical.length > 0)
				radicals.push({tile:link.start,radical:radical})
		}
	}
	console.log(radicals)
	return radicals;
}

Array.prototype.removeAll = function(elt){
	while(this.indexOf(elt) != -1){
		this.splice(this.indexOf(elt),1);
	}
}