const express = require('express');
const router = express.Router();
const geniusAPI = require('genius-lyrics-api');
const axios = require('axios');

router.get('/', (req, res) => {
    res.send('API is working!');
})

const cleanLyrics = (lyrics) => {
    let filteredLyrics = ''
    let hasCome = false;
    lyrics.split('').forEach(char => {
        if (char == '[' || char == '(') {
            hasCome = true
        } else if (char == ']' || char == ')') {
            hasCome = false
        } else {
            if (!hasCome) {
                filteredLyrics += char
            }
        }
    })
    filteredLyrics = filteredLyrics.replace(/'/g,'');
    filteredLyrics = filteredLyrics.replace(/"/g,'');
    filteredLyrics = filteredLyrics.replace(/\n/g,' ');
    filteredLyrics = filteredLyrics.replace(/\s\s+/g, ' ');
    filteredLyrics = filteredLyrics.trim()
    return filteredLyrics
}

router.get('/generate', (req, res) => {
    const searchTerm = req.query.query
    const url = `https://api.genius.com/search?q=${searchTerm}`
    const headers = {
        Authorization: `Bearer ${process.env.GENIUS_API_KEY}`
    }
    axios.get(url, { headers })
    .then(response => {
        const songs = []
        response.data.response.hits.forEach(hit => {
            if (hit.type === "song") { songs.push(hit.result) }
        })
        const randomIndex = Math.floor(Math.random() * songs.length)
        geniusAPI.getLyrics(songs[randomIndex].url)
        .then(lyrics => {
            res.send({
                lyrics: cleanLyrics(lyrics),
                currentSong: songs[randomIndex],
                songResults: songs,
                searchQuery: searchTerm
            })
        })
    })
    .catch(err => { console.log(err) })
})

router.get('/suggest', (req, res) => {
    const query = req.query.query
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${query}&api_key=${process.env.LASTFM_API_KEY}&format=json`
    axios.get(url)
    .then(response => {
        const artists = response.data.results.artistmatches.artist.map(artist => artist.name)
        res.send({ artists })
    })
    .catch(err => { console.log(err) })
})

module.exports = router