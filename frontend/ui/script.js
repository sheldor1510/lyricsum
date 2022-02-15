const ls = window.localStorage;
let suggestionFilled = null;
let filled = false;
let apiBaseURL = 'http://localhost:5000';
let initialText = '';
const paraLengths = { short: 50, medium: 100, long: 200 }
let format = {
    paragraphs: 7, 
    paraLength: "short", 
    capitalization: "aa", 
    selections: []
}

if (ls.getItem('formatData') === null) {
    let formatData = JSON.stringify(format)
    ls.setItem('formatData', formatData);
    console.log("added", formatData)
} else {
    format = JSON.parse(ls.getItem('formatData'));
    console.log("saved version found", format)
}

const inflateFormatting = () => {
    ls.setItem('formatData', JSON.stringify(format));
    document.getElementById('para-count').innerHTML = format.paragraphs;
    document.getElementById('range').value = format.paragraphs;
    document.querySelector('input[value="' + format.paraLength + '"]').checked = true;
    document.querySelector('input[value="' + format.capitalization + '"]').checked = true;
    try {
        if (format.selections.length == 0) {
            document.querySelector('input[value="p"]').checked = false;
            document.querySelector('input[value="bold"]').checked = false;
            document.querySelector('input[value="italics"]').checked = false;
        } else {
            format.selections.forEach(selection => {
                document.querySelector('input[value="' + selection + '"]').checked = true;
            });
        }
    } catch (error) {
        console.log(error)
    }
}

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
            fetch(`${apiBaseURL}/suggest?query=${val}`)
            .then(async (res) => {
                const resp = await res.json();
                //console.log(resp.artists);
                let arr = resp.artists.slice(0, 5);
                document.getElementById('search-img').style.display = 'none'
                for (i = 0; i < arr.length; i++) {
                    b = document.createElement("DIV");
                    b.innerHTML += arr[i].substr(0, val.length) + arr[i].substr(val.length);
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    b.addEventListener("click", function(e) {
                        document.getElementById('search-img').style.display = 'block'
                        inp.value = this.getElementsByTagName("input")[0].value;
                        document.getElementById('input-area').innerHTML += `<div class="tag">${inp.value}<img style="margin-left: 1vw;" id="cross-icon" src="cross.svg"></img></div>`
                        document.getElementById("artist-input").style.display = 'none'
                        document.getElementById("artist-input").value = inp.value
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


const addStyling = (paramString) => {
    let selections = format.selections;
    if (selections.length > 1) {
        let randomBool = Math.floor(Math.random() * 3)
        if (randomBool === 1) {
            if (selections.length > 2) {
                let anotherRandomBool = Math.floor(Math.random() * 2)
                if (anotherRandomBool == 1) {
                    paramString = '<i>' + paramString + '</i>'
                } else if (anotherRandomBool == 0) {
                    paramString = '<b>' + paramString + '</b>'
                }
            } else {
                if (selections[1] === "italics") {
                    paramString = '<i>' + paramString + '</i>'
                } else if (selections[1] === "bold") {
                    paramString = '<b>' + paramString + '</b>'
                }
            }
        }
    }
    return paramString
}

const isLetter = (str) => {
    if (str.length !== 0 && str.match(/[a-z]/i)) {
        return true 
    }  else { 
        return false 
    }
}   

const formatText = () => {
    let paraLength = format.paraLength;
    let paragraphs = format.paragraphs;
    let capitalization = format.capitalization;
    initialText = document.getElementById('lyrics-text').innerText
    let localInitialText = initialText
    let htmlToAppend = ''
    const paraWordLimit = paraLengths[paraLength];
    const paraLimit = paragraphs;
    let currentIndex = 0;
    for(let i = 0; i < paraLimit; i++) {
        console.log(currentIndex);
        let para = ''
        let wordArray = localInitialText.split(' ');
        console.log(wordArray.length);
        let limit = currentIndex + paraWordLimit
        for(let j = currentIndex; j < limit; j++) {
            if ((wordArray.length - j) == 1) {
                console.log("hello");
                limit = paraWordLimit - para.split(" ").length
                currentIndex = 0;
                j = 0;
                console.log(j);
            } else {
                if (j == limit - 1) {
                    const charToCheck = wordArray[j][wordArray[j].length - 1]
                    console.log(charToCheck);
                    const isLetterBool = isLetter(charToCheck)
                    console.log(isLetterBool);
                    if (isLetterBool) {
                        para += addStyling(wordArray[j]) + '.'
                    } else {
                        wordArray[j] = wordArray[j].slice(0, -1)
                        console.log(wordArray[j]);
                        para += addStyling(wordArray[j]) + '.'
                    }
                } else if (j == currentIndex) {
                    wordArray[j] = wordArray[j].slice(0, 1).toUpperCase() + wordArray[j].slice(1)
                    para += addStyling(wordArray[j]) + ' '
                } else {
                    para += addStyling(wordArray[j]) + ' '
                }
                currentIndex++
            }
        }
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
        para = '<p>' + para + '</p>'
        console.log(para);
        htmlToAppend += para
    }
    console.log(htmlToAppend);
    document.getElementById('lyrics-text').innerHTML = htmlToAppend
}

window.onload = () => {
    var slider = document.getElementById("range");
    var output = document.getElementsByClassName('para-count')[0];
    output.innerHTML = slider.value;
    slider.oninput = function() {
        output.innerHTML = this.value;
        format.paragraphs = this.value;
        inflateFormatting();
        formatText();
    }
    autocomplete(document.getElementById("artist-input"));
    document.getElementById('generate-button').addEventListener('click', () => {
        console.time('GenerationTime');
        if (document.getElementById('artist-input').value.trim() == suggestionFilled) {
            filled = true;
        } else {
            filled = false;
        }
        if (filled) {
            document.getElementById('generate-button').disabled = true;
            fetch(apiBaseURL + '/generate?query=' + document.getElementById('artist-input').value.trim())
            .then(async (response) => {
                const resp = await response.json()
                console.log(resp);
                document.getElementById('lyrics-text').innerText = resp.lyrics
                console.timeEnd('GenerationTime');
                formatText();
                document.getElementById('song-img').src = resp.currentSong.song_art_image_thumbnail_url
                let songTitle = resp.currentSong.title
                let songArtist = resp.searchQuery
                if (songTitle.length > 21) {
                    songTitle = songTitle.slice(0, 21) + "..."
                }
                if (songArtist.length > 21) {
                    songArtist = songArtist.slice(0, 21) + "..."
                }
                document.getElementById('song-title').innerText = songTitle
                document.getElementById('song-artist').innerText = songArtist
                document.getElementById('song-link').href = resp.currentSong.url
                document.getElementById('generate-button').disabled = false;
            })
            .catch(error => {
                console.log(error);
            });
        } else {
            alert('Please pick a suggestion');
        }
    })
    window.addEventListener('click', (e) => {
        if (e.target.id === "cross-icon") {
            document.getElementById('artist-input').style.display = 'block'
            document.getElementById('artist-input').value = ''
            document.getElementsByClassName('tag')[0].remove()
            autocomplete(document.getElementById("artist-input"));
        }
        if (["short", "medium", "long"].includes(e.target.value)) {
            format.paraLength = e.target.value;
            inflateFormatting();
            formatText();
        }
        if (["aa", "AA", "Aa"].includes(e.target.value)) {
            format.capitalization = e.target.value;
            inflateFormatting();
            formatText();
        }
        if (["p", "bold", "italics"].includes(e.target.value)) {
            if (e.target.value === "p") {
                if (format.selections.includes(e.target.value)) {
                    format.selections = [];
                } else {
                    format.selections = ['p'];
                }
            } else {
                if (format.selections.includes(e.target.value)) {
                    if (format.selections.length > 2) {
                        format.selections = format.selections.filter(item => item !== e.target.value)
                    } else {
                        format.selections = ["p"];
                    }
                } else {
                    if (format.selections.length == 2) {
                        format.selections.push(e.target.value);
                    } else {
                        format.selections = ["p", e.target.value];
                    }
                }
            }
            inflateFormatting();
            formatText();
        }
    })
    inflateFormatting()
}