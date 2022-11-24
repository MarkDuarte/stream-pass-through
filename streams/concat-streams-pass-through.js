import { Writable } from 'stream'
import axios from 'axios'

const API_01 = 'http://localhost:3000'
const API_02 = 'http://localhost:4000'

const request = await Promise.all([
  axios({
    method: 'get',
    url: API_01,
    responseType: 'stream'
  }),
  axios({
    method: 'get',
    url: API_02,
    responseType: 'stream'
  })
])

const result = request.map(({ data }) => data)

const output = Writable({
  write(chunk, enc, callback) {
    const data = chunk.toString()
    console.log('data ', data)
    callback()
  }
})

result[0].pipe(output)