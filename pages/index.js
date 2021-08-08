import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState, useEffect } from 'react'
const fetch = require('node-fetch')
const crypto = require('crypto')

const alanKey = process.env.NEXT_PUBLIC_KEY
const pcKey = process.env.NEXT_PUBLIC_KEY_PCK
const pcSecret = process.env.NEXT_PUBLIC_KEY_PCS
let myUrl = null
const audioRef = React.createRef()

export default function Home() {
  const [items, setItems] = useState([])
  const [episodes, setEpi] = useState([])
  const [title, setTitle] = useState([])
  const [image, setImage] = useState([])
  const [episode, setSelectedEpi] = useState([])

  function close() {
    setEpi([])
  }

  function getEpisodes(event, data) {
    setTitle(data.title)
    setImage(data.image)
    myUrl = `https://api.podcastindex.org/api/1.0/episodes/byfeedid?id=${data.id}&since=1612125785&max=5`
    fetchPodsOnChange(myUrl, pcKey, pcSecret, 'epi')
  }

  function selectEpisode(event, data) {
    setSelectedEpi(data)
    if(audioRef.current){
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play();
    }
    checkNavMedia(data)
  }


  function fetchPodsOnChange(url,key,secret, type) {
    const APIKEY = key
    const APISECRET = secret

    const ts = Math.floor(Date.now() / 1000)
    const authString = APIKEY + APISECRET + ts.toString()
    const authHeader = crypto.createHash('sha1').update(authString).digest('hex')

    fetch(url,
      {
        method: 'GET',
        headers: {
          "User-Agent" : "homemade pod-fetcher 0.026b",
          "X-Auth-Date" : ts,
          "X-Auth-Key"  : APIKEY,
          "Authorization" : authHeader
        },
      }
    ).then(
      res => {
        console.log(res.status, res.statusText)
        console.log(res.headers)
        console.log(res)
        return res.json()
      }
    ).then(
      data => {
        console.log('success got data:')
        console.log(data)
        if (type === 'pods') {
          setItems(data['feeds'])
        } else {
          //TODO loading spinner boolean
          setEpi(data['items'])
          setSelectedEpi(data['items'][0])
          checkNavMedia(data['items'][0])
        }
         
      },
      err => {
        console.log('got error:')
        console.log(err)
      },
    )
}

function checkNavMedia(data) {
  if ('mediaSession' in navigator) {
    console.log(navigator, 'navigator')
    navigator.mediaSession.metadata = new MediaMetadata({
      title: data.title,
      artwork: [
        { src: data.feedImage, sizes: '96x96',   type: 'image/png' },
        { src: data.feedImage, sizes: '128x128', type: 'image/png' },
        { src: data.feedImage, sizes: '192x192', type: 'image/png' },
        { src: data.feedImage, sizes: '256x256', type: 'image/png' },
        { src: data.feedImage, sizes: '384x384', type: 'image/png' },
        { src: data.feedImage, sizes: '512x512', type: 'image/png' },
      ]
    });
    navigator.mediaSession.setActionHandler('play', function() {});
    navigator.mediaSession.setActionHandler('pause', function() {});
    navigator.mediaSession.setActionHandler('seekbackward', function() {});
    navigator.mediaSession.setActionHandler('seekforward', function() {});
    navigator.mediaSession.setActionHandler('previoustrack', function() {});
    navigator.mediaSession.setActionHandler('nexttrack', function() {});
  }

}
 
  useEffect(() => {
   
    const source = document.getElementById('term')
    myUrl = 'https://api.podcastindex.org/api/1.0/search/byterm?q=npr'

    const inputHandler = function(e) {
      myUrl = `https://api.podcastindex.org/api/1.0/search/byterm?q=${e.target.value}`
      if (e.target.value.length > 2)
        fetchPodsOnChange(myUrl, pcKey, pcSecret, 'pods')
    }

    source.addEventListener('input', inputHandler)
    source.addEventListener('propertychange', inputHandler)
    fetchPodsOnChange(myUrl, pcKey, pcSecret, 'pods')
    
    const alanBtn = require('@alan-ai/alan-sdk-web')
    alanBtn({
      key: alanKey,
      onCommand: ({ url, key, secret }) => {
        console.log(url, 'search url request')
        fetchPodsOnChange(url, key, secret, 'pods')
      }
    })
  }, [])
  return (
    <div className={styles.container}>
      <Head>
        <title>Podcast Search SSR App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Podcast Search
        </h1>

        <p className={styles.description}>
          Use the microphone to make a search. Example: "Give me podcasts from NPR"
        </p>
      
        <input name="search" className={styles.search} type="search" id="term" placeholder="Search"></input>
       

        <div className={styles.grid}>
          {!items.length && 'No search results: try again'}
          { items.map((item) => (
            <a onClick={(e) => {getEpisodes(e, item)}} href={void(0)} key={item.id} className={styles.card} title={item.title} style={{
              width: 360,
              height: 360,
              backgroundImage: `url(${(item.image) || "/podcast-icon.png"})`
            }}> 
            </a>
          ))}
        </div>

      </main>
      { episodes.length ?
        <div className={styles.overlay}>
          <span className={styles.close} onClick={close}> X </span>
          <div className={styles.dialog}>
            <p>Now Playing: {episode.title}</p> <span className={styles.pcimage}> <img src={image} alt="podcast image" width="192" height="192" /></span>
            <audio controls ref={audioRef}>
              <source src={episode.enclosureUrl} type={episode.enclosureType} />
              Your browser does not support the audio element.
            </audio>
          
            {!episodes.length && 'No search results: try again'}
            <ul>
              RECENT EPISODES
              {episodes.map((item, index) => (
                <li onClick={(e) => {selectEpisode(e, item)}} key={item.id}>{index + 1}. {item.title}</li>
              ))}
            </ul>   
          </div>
        </div> : null 
      }

      <footer className={styles.footer}>
        Created by Ian Poston 2021
      </footer>
    </div>
  )
}
