const express = require('express');
const router = express.Router();
const geniusAPI = require('genius-lyrics-api');
const axios = require('axios');
const { randomSongs } = require('./constants')

router.get('/', (req, res) => {
    res.send('API is working!');
})

const cleanLyrics = (lyrics) => {
    try {
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
    } catch (error) {
        console.log(error)
        return "no lyrics found"
    }
}

const getRandomInt = (min, max)  => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    .catch(err => {
        console.log(err)
        res.send({
            lyrics: '',
            currentSong: {},
            songResults: [],
            searchQuery: searchTerm
        })
    })
})

router.get('/random', (req, res) => {
    let randomSongID = getRandomInt(1, 2471960);
    const url = `https://api.genius.com/songs/${randomSongID}?access_token=${process.env.GENIUS_API_KEY}`
    axios.get(url)
    .then(response => {
        console.log(response.status)
        const song = response.data.response.song
        geniusAPI.getLyrics(song.url)
        .then(lyrics => {
            res.send({
                lyrics: cleanLyrics(lyrics),
                currentSong: song,
                songResults: [song],
                searchQuery: 'random'
            })
        })
    })
    .catch(err => {
        let randomIndex = getRandomInt(1, randomSongs.length-1)
        const url = `https://api.genius.com/songs/${randomSongs[randomIndex]}?access_token=${process.env.GENIUS_API_KEY}`
        axios.get(url)
        .then(response => {
            console.log(response.status)
            const song = response.data.response.song
            geniusAPI.getLyrics(song.url)
            .then(lyrics => {
                res.send({
                    lyrics: cleanLyrics(lyrics),
                    currentSong: song,
                    songResults: [song],
                    searchQuery: 'random'
                })
            })
        })
    })
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

router.post('/log', (req, res) => {
    const log = req.body
    console.log(log)
    const data = JSON.stringify(log)
    const config = {
        method: 'post',
        url: 'https://rest-notion-db.herokuapp.com/post',
        headers: {
            'Authorization': `Bearer ${process.env.NOTION_TOKEN}`, 
            'Notion-Page-Url': process.env.NOTION_DB_PAGE_URL, 
            'Content-Type': 'application/json'
        },
        data: data
    };
      
    axios(config)
    .then(response => {
        if (response.data.success) {
            res.send({ success: true })
        } else {
            res.send({ success: false })
        }
    })
    .catch(function (error) {
        console.log(error);
        res.send({ success: false })
    });
})

module.exports = router