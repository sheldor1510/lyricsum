let suggestionFilled = null;
let filled = false;
let initialURL = 'http://localhost:5000';

let paragraphs = 5;
let paraLength = "medium";
let capitalization = "aa";
let style = { selected: true, selection: "italics" };
let initialText = '';
const paraLengths = { short: 40, medium: 60, long: 100 }

function autocomplete(inp) {
    var currentFocus;
    let timer;
    inp.addEventListener("input", function(e) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            var a, b, i, val = this.value;
            closeAllLists();
            if (!val) { return false;}
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            fetch(`${initialURL}/suggest?query=${val}`)
            .then(async (res) => {
                const resp = await res.json();
                //console.log(resp.artists);
                let arr = resp.artists.slice(0, 5);
                for (i = 0; i < arr.length; i++) {
                    b = document.createElement("DIV");
                    b.innerHTML += arr[i].substr(0, val.length) + arr[i].substr(val.length);
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    b.addEventListener("click", function(e) {
                        inp.value = this.getElementsByTagName("input")[0].value;
                        suggestionFilled = inp.value;
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            })
            .catch(error => console.log('error', error));
        }, 300);
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) {
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
            if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

const formatText = () => {
    initialText = document.getElementById('lyrics-text').innerText
    let localInitialText = initialText
    let htmlToAppend = ''
    const isLetter = (str) => {
        if (str.length !== 0 && str.match(/[a-z]/i)) {
            return true 
        }  else { 
            return false 
        }
    }      
    const paraWordLimit = paraLengths[paraLength];
    const paraLimit = paragraphs;
    let currentIndex = 0;
    for(let i = 0; i < paraLimit; i++) {
        console.log(currentIndex);
        let para = ''
        let wordArray = localInitialText.split(' ')
        if (currentIndex + paraWordLimit > wordArray.length) {
            console.log("first");
            currentIndex = 0;
        }
        let limit = currentIndex + paraWordLimit
        for(let j = currentIndex; j < limit; j++) {
            if (j == limit - 1) {
                const charToCheck = wordArray[j][wordArray[j].length - 1]
                console.log(charToCheck);
                const isLetterBool = isLetter(charToCheck)
                console.log(isLetterBool);
                if (isLetterBool) {
                    para += wordArray[j] + '.<br><br>'
                } else {
                    wordArray[j] = wordArray[j].slice(0, -1)
                    console.log(wordArray[j]);
                    para += wordArray[j] + '.<br><br>'
                }
            } else if (j == currentIndex) {
                wordArray[j] = wordArray[j].slice(0, 1).toUpperCase() + wordArray[j].slice(1)
                para += wordArray[j] + ' '
            } else {
                para += wordArray[j] + ' '
            }
            currentIndex++
        }
        console.log(para);
        if (capitalization == "Aa") { 
            para = para.toLowerCase()
            let repara = ''
            para.split("").forEach((char, index) => {
                if (index == 0) {
                    repara += char.toUpperCase()
                } else {
                    repara += char
                }
            })
            para = repara
        } else if (capitalization == "aa") { para = para.toLowerCase() }
        else if (capitalization == "AA") { para = para.toUpperCase() }
        htmlToAppend += para
    }
    console.log(htmlToAppend);
    if (style.selected) {
        if (style.selection === "italics") {
            htmlToAppend = '<i>' + htmlToAppend + '</i>'
        } else if (style.selection === "bold") {
            htmlToAppend = '<strong>' + htmlToAppend + '</strong>'
        }
    }
    document.getElementById('lyrics-text').innerHTML = htmlToAppend
}

window.onload = () => {
    autocomplete(document.getElementById("myInput"));
    document.getElementById('check').addEventListener('click', () => {
        console.time('checkTime');
        if (document.getElementById('myInput').value.trim() == suggestionFilled) {
            filled = true;
        } else {
            filled = false;
        }
        if (filled) {
            fetch(initialURL + '/search?query=' + document.getElementById('myInput').value.trim())
            .then(async (response) => {
                const resp = await response.json()
                console.log(resp);
                document.getElementById('lyrics-text').innerText = resp.lyrics
                console.timeEnd('checkTime');
                formatText();
                document.getElementById('song-img').src = resp.currentSong.song_art_image_thumbnail_url
                document.getElementById('song-title').innerText = resp.currentSong.title
                document.getElementById('song-link').href = resp.currentSong.url
            })
            .catch(error => {
                console.log(error);
            });
        } else {
            alert('Please pick a suggestion');
        }
    })
}