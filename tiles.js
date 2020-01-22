function drawTile(tile){
    textSize(15)
    noStroke();
    if(tile.type == "hidrocarburo"){
        fill(0)
        let x=tile.x*gridSize+gridSize/2-3, y=tile.y*gridSize+gridSize/2;
        if(tile.h > 0) text("CH",x,y);
        else text("C",x,y)

        textSize(10)
        if(tile.h > 1)
            text(tile.h,x+textWidth("CH"),y+5);
        if(tile.weight != null && debug){
            fill(0,0,255,50);
            rect(tile.x*gridSize,tile.y*gridSize,gridSize,gridSize)
            fill(255)
            text(tile.weight,x,y);
        }
    }else if(tile.type == "linkstart"){
        fill(0,128,0,50);
        rect(tile.x*gridSize,tile.y*gridSize,gridSize,gridSize)
    }else if(tile.type == "linkend"){
        for(let link of getTilesByType("linkstart")){
            if(link.linkId == tile.linkId){
                let start = getTile(link.x, link.y).uuid;
                let end = getTile(tile.x, tile.y).uuid;
                if(link.linkType == "esimple")
                    links.push({start:start,end:end,type:link.linkType,hydrogensRemoved:1})
                
                if(link.linkType == "edoble")
                    links.push({start:start,end:end,type:link.linkType,hydrogensRemoved:2})
                    
                if(link.linkType == "etriple")
                    links.push({start:start,end:end,type:link.linkType,hydrogensRemoved:3})
                grid.splice(grid.indexOf(link),1)
                grid.splice(grid.indexOf(tile),1)
                break;
            }
        }
    }else if(tile.type == "startAnalysis"){
        fill(0,255,0,100);
        rect(tile.x*gridSize,tile.y*gridSize,gridSize,gridSize)
    }

    if(tile.uuid == null)
        tile.uuid = Math.floor((Math.random()*0.5-1)*32000);
}

function drawLinks(){
    stroke(0);
    links = removeDuplicateLinks(links);
    for(let i=0;i<links.length;i++){
        let link = links[i];
        let start = getTileByUuid(link.start);
        let end = getTileByUuid(link.end);
        if(start.h - link.hydrogensRemoved < 0 || end.h - link.hydrogensRemoved < 0){
            links.splice(i,1);
            i--;
            continue;
        }
        if(start != -1 && end != -1){
            if((start.x == end.x && start.y == end.y) || Math.abs(start.x-end.x) > 1 || Math.abs(start.y-end.y) > 1){
                links.splice(i,1);
                continue;
            }
            if(start.y == end.y){
                if(end.x<start.x){
                    let tmp = end;
                    end = start;
                    start = tmp;
                }
                line(end.x*gridSize-2.5,end.y*gridSize+gridSize/2,start.x*gridSize+gridSize+2.5,start.y*gridSize+gridSize/2)
                start.h--;
                end.h--;
                if(link.type == "edoble" || link.type == "etriple"){
                    line(end.x*gridSize-2.5,end.y*gridSize+gridSize/2+2.5,start.x*gridSize+gridSize+2.5,start.y*gridSize+gridSize/2+2.5)
                start.h--;
                end.h--;
                }
                if(link.type == "etriple"){
                    line(end.x*gridSize-2.5,end.y*gridSize+gridSize/2-2.5,start.x*gridSize+gridSize+2.5,start.y*gridSize+gridSize/2-2.5)
                start.h--;
                end.h--;
                }
            }else if(start.x == end.x){
                if(end.y<start.y){
                    let tmp = end;
                    end = start;
                    start = tmp;
                }
                line(end.x*gridSize+gridSize/2,end.y*gridSize+5,start.x*gridSize+gridSize/2,start.y*gridSize+gridSize-5)
                start.h--;
                end.h--;
                if(link.type == "edoble" || link.type == "etriple"){
                    line(end.x*gridSize+gridSize/2+2.5,end.y*gridSize+5,start.x*gridSize+gridSize/2+2.5,start.y*gridSize+gridSize-5)
                start.h--;
                end.h--;
                }
                if(link.type == "etriple"){
                    line(end.x*gridSize+gridSize/2-2.5,end.y*gridSize+5,start.x*gridSize+gridSize/2-2.5,start.y*gridSize+gridSize-5)
                start.h--;
                end.h--;
                }
            }else{
                links.splice(i,1);
                continue;
            }
        }else{
            links.splice(i,1);
            continue;
        }
    }
}

function drawGrid(){stroke(0,128,255,128)
    for(let x=0;x<cols;x++){
        line(x*gridSize,0,x*gridSize,height);
    }
    for(let y=0;y<rows;y++){
        line(0,y*gridSize,width,y*gridSize);
    }
}

function resetHydrogens(){
    for(let tile of grid){
        tile.h = 4;
    }
}

function resetWeights(){
    for(let tile of grid){
        tile.weight = null;
    }
}

function removeDuplicateLinks(array){
    let copy = array;
    for(let i=0;i<copy.length;i++){
        let linkA = copy[i];
        for(let j=0;j<copy.length;j++){
            let linkB = copy[j];
            if(((linkA.start == linkB.start && linkA.end == linkB.end) || (linkA.start == linkB.end && linkB.start == linkA.end)) && i != j){
                copy.splice(j,1);
                j--;
            }
        }
    }
    return copy;
}