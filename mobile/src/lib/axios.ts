import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://192.168.69.109:3333/'
})
