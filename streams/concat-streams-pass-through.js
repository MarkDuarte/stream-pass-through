import { PassThrough, Writable } from 'stream'
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

const results = request.map(({ data }) => data)

const output = Writable({
  write(chunk, enc, callback) {
    const data = chunk.toString().replace(/\n/, '')
    const name = data.match(/:"(?<name>.*)(?=-)/).groups.name
    console.log(`[${name.toLowerCase()}] ${data}`)
    callback()
  }
})

function merge(streams) {
  return streams.reduce((prev, current, index, items) => {
    //impede  que a stream feche sozinha
    current.pipe(prev, { end: false })

    // Como colocamos end: false, vamos manipular manualmente quando o nosso current
    // terminar. Quando ele terminar, vamos verificar se todos os pipelines se encerraram
    // ele vai então forçar a cadeia do anterior e se fechar
    current.on('end', () => items.every(s => s.ended) && prev.end())
    return prev

  }, new PassThrough())
}

merge(results).pipe(output)

//result[0].pipe(output)
//result[1].pipe(output)