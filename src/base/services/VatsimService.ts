import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

// Code referenced from https://vatsim.dev/api/core-api
export class VatsimService {
    // Main API
    async fetchVatsim_Main(): Promise<any> {
        const url = 'https://data.vatsim.net/v3/vatsim-data.json';

        const response = await fetch(url, {
            method: 'GET'
        });
        
        return await response.json();
    }
    
    // AIP API
    async fetchVatsim_AIP_Information(icao: string): Promise<any> {
        const url = `https://my.vatsim.net/api/v2/aip/airports/${icao}`;

        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }

    // Core API
    async fetchVatsim_Core_Members_Statics(cid: string): Promise<any> {
        const url = `https://api.vatsim.net/v2/members/${cid}/stats`;

        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }

    async fetchVatsim_Core_Members_Online(cid: string): Promise<any> {
        const url = `https://api.vatsim.net/v2/members/${cid}/status`;

        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }

    async fetchVatsim_Core_Members_Detail(cid: string): Promise<any> {
        const url = `https://api.vatsim.net/v2/members/${cid}`;

        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }

    async fetchVatsim_Core_Community(discord_id:string, options: string): Promise<any> {
        const url = `https://api.vatsim.net/v2/members/${options}/${discord_id}`;

        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }

    async fetchVatsim_Core_Atc(options: string): Promise<any> {
        const url = `https://api.vatsim.net/v2/atc/${options}`;
        
        const response = await fetch(url, {
            method: 'GET',
        });
        
        return await response.json();
    }

    // METAR API
    async fetchVatsim_Metar_Metar(icao: string): Promise<any> {
        const url = `https://metar.vatsim.net/${icao}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {'content-type': 'application/json'}
        });
        
        return response.text();
    }

    // VERIFICATION API
    async fetchVatsimDiscord_Verify(discord_id: string, interaction: ChatInputCommandInteraction): Promise<any> {
        const url = `https://api.vatsim.net/v2/members/discord/${discord_id}`;

        const response = await fetch(url, {
            method: 'GET',
        });

        const data = await response.json();
        if (data.id) {
            return data;
        } else {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Discord User : <@${discord_id}> is not linked to any VATSIM Account.\nPlease link your discord account at [VATSIM Community Hub](https://community.vatsim.net/)`)
            ], ephemeral: true });
        }
    }

    // RATING API
    async fetchVatsimRating_facilities(options: number): Promise<any> {
        const url = `https://data.vatsim.net/v3/vatsim-data.json`;

        const response = await fetch(url, {
            method: 'GET',
        });

        const data = await response.json();

        if (data.facilities && data.facilities.find((x: any) => x.id === options)) {
            const facility = data.facilities.find((facility: { id: number; }) => facility.id === options);
            return `${facility.long} (${facility.short})`;
        } else {
            throw new Error(`Facility with id ${options} not found`);
        }
    }

    async fetchVatsimRating_ratings(options: number): Promise<any> {
        const url = `https://data.vatsim.net/v3/vatsim-data.json`;

        const response = await fetch(url, {
            method: 'GET',
        });

        const data = await response.json();

        if (data.ratings && data.ratings.find((x: any) => x.id === options)) {
            const ratings = data.ratings.find((ratings: { id: number; }) => ratings.id === options);
            return `${ratings.long} (${ratings.short})`;
        } else {
            throw new Error(`Rating with id ${options} not found`);
        }
    }

    async fetchVatsimRating_p_ratings(options: number): Promise<any> {
        const url = `https://data.vatsim.net/v3/vatsim-data.json`;

        const response = await fetch(url, {
            method: 'GET',
        });

        const data = await response.json();

        if (data.pilot_ratings && data.pilot_ratings.find((x: any) => x.id === options)) {
            const pilot_ratings = data.pilot_ratings.find((pilot_ratings: { id: number; }) => pilot_ratings.id === options);
            return `${pilot_ratings.long_name} (${pilot_ratings.short_name})`;
        } else {
            throw new Error(`Pilot Ratings with id ${options} not found`);
        }
    }

    async fetchVatsimRating_m_ratings(options: number): Promise<any> {
        const url = `https://data.vatsim.net/v3/vatsim-data.json`;

        const response = await fetch(url, {
            method: 'GET',
        });

        const data = await response.json();

        if (data.military_ratings && data.military_ratings.find((x: any) => x.id === options)) {
            const military_ratings = data.military_ratings.find((military_ratings: { id: number; }) => military_ratings.id === options);
            return `${military_ratings.long_name} (${military_ratings.short_name})`;
        } else {
            throw new Error(`Military ratings with id ${options} not found`);
        }
    }
}