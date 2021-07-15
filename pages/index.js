import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
const fetch = require('node-fetch')
const crypto = require('crypto')
const alanKey = process.env.NEXT_PUBLIC_KEY
const pcKey = process.env.NEXT_PUBLIC_KEY_PCK
const pcSecret = process.env.NEXT_PUBLIC_KEY_PCS

export default function Home() {
  const [items, setItems] = useState([])
 
  useEffect(() => {
    const source = document.getElementById('term');
    var myUrl = 'https://api.podcastindex.org/api/1.0/search/byterm?q=npr'

    const inputHandler = function(e) {
      myUrl = `https://api.podcastindex.org/api/1.0/search/byterm?q=${e.target.value}`
      if (e.target.value.length > 2)
        fetchPodsOnChange(myUrl, pcKey, pcSecret)
    }

    source.addEventListener('input', inputHandler);
    source.addEventListener('propertychange', inputHandler);

    fetchPodsOnChange(myUrl, pcKey, pcSecret)
    const alanBtn = require('@alan-ai/alan-sdk-web');
    alanBtn({
      key: alanKey,
      onCommand: ({ url, key, secret }) => {
        console.log(url, 'search url request')
        fetchPodsOnChange(url, key, secret)
      }
    })

    function fetchPodsOnChange(url,key,secret) {
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
            console.log(data['feeds'])
            setItems(data['feeds'])
          },
          err => {
            console.log('got error:')
            console.log(err)
          },
        )
    }
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
          {items.map((item) => (
            <a href={item.link} key={item.id} className={styles.card} title={item.title} style={{
              width: 128,
              height: 360,
              backgroundImage: `url(${(item.image) || "/podcast-icon.png"})`
            }}> 
            </a>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        Created by Ian Poston 2021
      </footer>
    </div>
  )
}
