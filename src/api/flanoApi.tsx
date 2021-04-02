import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://api.flano.at/api',
});

export default instance;
