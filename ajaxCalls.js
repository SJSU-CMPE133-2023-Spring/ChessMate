// This function calls php method that writes last user move to the database
/*
export function writeMoveToDB(gameID, position, lastMove){ 
        //console.log("entered ajax call");
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            //xhr.open("GET", "DBActions/test.php")
            xhr.open("GET", "DBActions/makeMove.php?id=" + gameID + "&position=" + position + "&lastMove=" + lastMove);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = function () {
                reject("Network Error");
            };
            xhr.send();
        });
}

export function loadPosition(gameID){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        //xhr.open("GET", "DBActions/test.php")
        xhr.open("GET", "DBActions/loadPosition.php?id=" + gameID);
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function () {
            reject("Network Error");
        };
        xhr.send();
    });
    
}

*/