import {readFile, writeFile} from 'node:fs/promises'
import {v4 as uuidv4} from 'uuid'
import {getDate, monSecret} from "./divers.js";
import {NotFoundError} from "./errors.js";
import {createHash} from 'node:crypto'

/* Chemin de stockage des blocks */
const path = './data/blockchain.json'

/**
 * Mes définitions
 * @typedef { id: string, nom: string, don: number, date: string,hash: string} Block
 * @property {string} id
 * @property {string} nom
 * @property {number} don
 * @property {string} date
 * @property {string} string
 *
 */

/**
 * Renvoie un tableau json de tous les blocks
 * @return {Promise<any>}
 */
export async function findBlocks() {
    const blocks = await readFile(path)
    return blocks.length === 0 ? null : JSON.parse(blocks)
}

/**
 * Trouve un block à partir de son id
 * @param partialBlock
 * @return {Promise<Block[]>}
 */
export async function findBlock(partialBlock) {
    const blocks = await findBlocks()
    const block = blocks.find(block => block.id === partialBlock.id)
    return block || {"error":"not find block"}
}

/**
 * Trouve le dernier block de la chaine
 * @return {Promise<Block|null>}
 */
export async function findLastBlock() {
    const blocks = await findBlocks()

    return blocks === null ? null : blocks[blocks.length - 1] || null
}

/**
 * Creation d'un block depuis le contenu json
 * @param contenu
 * @return {Promise<Block[]>}
 */
export async function createBlock(contenu) {
    const blocks =  await findBlocks()

    const newBlocks = Array.isArray(blocks) ? blocks : []

    const lastBlock = await findLastBlock()

    const newSecretMessage = lastBlock == null ? monSecret : JSON.stringify(lastBlock)

    console.log("Key : ",newSecretMessage)

    const newBlock = {
        id: uuidv4(),
        nom: contenu.nom,
        don: contenu.don,
        date: getDate(),
        hash: createHash("sha256").update(newSecretMessage).digest('hex')
    }

    newBlocks.push(newBlock)

    await writeFile(path, JSON.stringify(newBlocks))
    return newBlocks
}


export async function verifBlocks() {

    const blocks = await findBlocks()

    if (blocks == null ) {
        return false
    }

    for (let i = 0; i < blocks.length; i++) {
        const newSecretMessage = i === 0 ? monSecret : JSON.stringify(blocks[i-1])
        const calchash =  createHash("sha256").update(newSecretMessage).digest('hex')

        if (blocks[i].hash !== calchash) {
            return false
        }
    }

    return true
}



