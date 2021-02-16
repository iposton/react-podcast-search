import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect } from 'react'
const fetch = require('node-fetch')
const crypto = require('crypto')
const alanKey = 'ALAN_KEY';

export default function Home() {
  useEffect(() => {
    const alanBtn = require('@alan-ai/alan-sdk-web');
    alanBtn({
      key: alanKey,
      onCommand: ({ url, key, secret }) => {
        console.log(url, 'search url request')

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
          },
          err => {
            console.log('got error:')
            console.log(err)
          },
        )
        

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

        <div className={styles.grid}>
          <a href="#" className={styles.card}>
            <h3>PodcastTitle</h3>
            <p>podcast description...</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        Created by Ian Poston 2021
      </footer>
    </div>
  )
}
