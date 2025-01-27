
import {createServer} from "node:http"
import {create, liste, find, verif} from "./blockchain.js";
import {NotFoundError} from "./errors.js";

createServer(async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, `http://${req.headers.host}`)
        const endpoint = `${req.method}:${url.pathname}`

        let results

        try {
            switch (endpoint) {
                case 'GET:/blockchain':
                    results = await liste(req, res, url)
                    console.log("requête GET liste : ", results)
                    break
                case 'POST:/blockchain':
                    results = await create(req, res)
                    console.log("requête POST create : ", results)
                    break
                case 'GET:/blockchain/id':
                    results = await find(req, res)
                    console.log("reqête POST find id: ", results)
                    break
                case 'GET:/blockchain/verify':
                    results = await verif(req, res, url)
                    console.log("requête GET verify vide : ", results)
                    break
                default :
                    res.writeHead(404)
            }
            if (results) {
                res.write(JSON.stringify(results))
            }
        } catch (erreur) {
            if (erreur instanceof NotFoundError) {
                res.writeHead(404)
            } else {
                throw erreur
            }
        }
        res.end()
    }
).listen(3000)
