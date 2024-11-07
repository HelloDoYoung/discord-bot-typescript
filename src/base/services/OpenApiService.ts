require('dotenv').config();

export class OpenApiService {
    private readonly token: string;

    constructor() {
        const token = process.env.OPEN_API_TOKEN;
        if (!token) {
            throw new Error('avwx_token is not defined in environment variables');
        }
        this.token = token;
    }

    async fetchMetar_zkpy(icao: string): Promise<any> {
        const url = `https://apis.data.go.kr/1360000/AftnAmmService/getMetar?serviceKey=${this.token}&dataType=JSON&icao=${icao}`;

        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }
}