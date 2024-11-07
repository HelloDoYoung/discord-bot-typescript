require('dotenv').config();

export class AvwxService {
    private readonly token: string;

    constructor() {
        const token = process.env.AVWX_TOKEN;
        if (!token) {
            throw new Error('avwx_token is not defined in environment variables');
        }
        this.token = token;
    }

    async fetchAirportData(icao: string): Promise<any> {
        const url = `https://avwx.rest/api/station/${icao}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': this.token
            }
        });
        
        return await response.json();
    }

    async fetchMetar(icao: string, options: string[] = []): Promise<any> {
        const optionsParam = options.length > 0 ? `?options=${options.join(',')}` : '';
        const url = `https://avwx.rest/api/metar/${icao}${optionsParam}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': this.token
            }
        });
        
        return await response.json();
    }

    async fetchTaf(icao: string, options: string[] = []): Promise<any> {
        const optionsParam = options.length > 0 ? `?options=${options.join(',')}` : '';
        const url = `https://avwx.rest/api/taf/${icao}${optionsParam}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': this.token
            }
        });

        return await response.json();
    }
}