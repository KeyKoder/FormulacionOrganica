function getTilesByName(name){
    let tiles = [];
    for(let t of grid){
        if(t.name){
            if(t.name === name){
                tiles.push(t);
            }
        }
    }
    return tiles;
}

function getTilesByType(type){
    let tiles = [];
    for(let t of grid){
        if(t.type === type){
            tiles.push(t);
        }
    }
    return tiles;
}

function getXOrderedTilesByType(type){
    let tiles = [];
    for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
            let tile = getTile(x,y);
            if(tile != -1){
                if(tile.type == type){
                    tiles.push(tile);
                }
            }
        }
    }
    return tiles;
}

function getYOrderedTilesByType(type){
    let tiles = [];
    for(let x=0;x<cols;x++){
        for(let y=0;y<rows;y++){
            let tile = getTile(x,y);
            if(tile != -1){
                if(tile.type == type){
                    tiles.push(tile);
                }
            }
        }
    }
    return tiles;
}

function getTile(x,y){
    for(let tile of grid){
        if(tile.x == x && tile.y == y){
            return tile;
        }
    }
    return -1;
}

function getTileByUuid(uuid){
    for(let tile of grid){
        if(tile.uuid == uuid){
            return tile;
        }
    }
    return -1;
}

function isValid(x,y){
    for(let tile of validTiles){
        if(tile.x == x && tile.y == y){
            return true;
        }
    }
    return false;
}


function getTilesAt(x,y){
    let tiles = []
    for(let tile of grid){
        if(tile.x == x && tile.y == y){
            tiles.push(tile);
        }
    }
    return tiles;
}

function getValidTiles(){
    let valid = [];
    for(let tile of grid){
        valid.push({x:tile.x+1,y:tile.y})
        valid.push({x:tile.x-1,y:tile.y})
        valid.push({x:tile.x,y:tile.y+1})
        valid.push({x:tile.x,y:tile.y-1})
    }
    for(let i=0;i<valid.length;i++){
        let tile = valid[i];
        let index = valid.indexOf(tile);
        if(getTile(tile.x,tile.y) != -1){
            valid.splice(index,1)
            i--;
        }
    }
    return valid;
}

function findLinksAttachedTo(uuid){
    let matchingLinks = [];
    for(let link of links){
        if(link.start == uuid || link.end == uuid){
            matchingLinks.push(link);
        }
    }
    return matchingLinks;
}

function isLinkInArray(array, link){
    for(let other of array){
        if(other.start == link.start && other.end == link.end){
            return true;
        }
    }
    return false;
}

function getHighestWeights(){
    let max = 0;
    let highest = [];
    for(let tile of grid){
        if(tile.weight > max){
            max = tile.weight;
            highest=[];
        }
        if(tile.weight == max){
            highest.push(tile)
        }
    }
    return highest;
}

function isTileInArray(array, tile){
    for(let other of array){
        if(other.uuid == tile.uuid){
            return true;
        }
    }
    return false;
}

function getTileIndexByUuid(array, uuid){
    let i=0;
    for(let other of array){
        if(other.uuid == uuid){
            return i;
        }
        i++;
    }
    return -1;
}

function containsNLink(array,n){
    for(let link of array){
        if(link.hydrogensRemoved == n){
            return true;
        }
    }
    return false;
}

function getLinksByType(type){
    let matchingLinks = [];
    for(let link of links){
        if(link.type === type){
            matchingLinks.push(link);
        }
    }
    return matchingLinks;
}

function getLinksByTypeIn(arr,type){
    let matchingLinks = [];
    for(let link of arr){
        if(link.type === type){
            matchingLinks.push(link);
        }
    }
    return matchingLinks;
}