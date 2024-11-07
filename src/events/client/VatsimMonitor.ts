require('dotenv').config();

import { Events, EmbedBuilder } from 'discord.js';
import { VatsimService } from '../../base/services/VatsimService';
import { AtcNameService } from '../../base/services/AtcNameService';
import CustomClient from '../../base/classes/CustomClient';
import Event from '../../base/classes/Event';

const vatsimService = new VatsimService();
const atcService = new AtcNameService();

export default class VatsimMonitor extends Event {
    private prev_atc: any[] = [];
    private temp_atc: any[] = [];

    constructor(client: CustomClient) {
        super(client, {
            name: Events.ClientReady,
            description: 'VATSIM Monitor',
            once: true
        });
    }

    async Execute() {
        console.log('Starting VATSIM ATC monitoring...');
        this.startMonitoring();
    }

    private startMonitoring() {
        setInterval(() => this.intervalFunc(), 15 * 1000);
    }

    private async intervalFunc() {
        try {
            const response = await vatsimService.fetchVatsim_Main();
            const controllData = response.controllers;
            
            // Filter Korean ATC
            const atc = controllData.filter((Data: any) => 
                Data.callsign.startsWith("RK") || Data.callsign.startsWith("ZK")
            );

            const channelId = process.env.ATC_CHANNEL_ID;
            if (!channelId) {
                console.error('ATC_CHANNEL_ID is not defined in the environment variables.');
                return;
            }
            const automsg = this.client.channels.cache.get(channelId);
            if (!automsg || !automsg.isTextBased() || !('send' in automsg)) return;

            this.temp_atc = [];

            for (const controller of atc) {
                if (controller.frequency === '199.998') continue;
                if (controller.callsign.startsWith("ZKC")) continue;
                if (controller.callsign.startsWith("ZK_")) continue;

                const atcRating = await vatsimService.fetchVatsimRating_ratings(controller.rating);
                const callsign_eng = atcService.getAtcName(controller.callsign);

                this.temp_atc.push([
                    controller.callsign,
                    controller.name,
                    atcRating,
                    controller.server,
                    controller.cid,
                    controller.frequency,
                    controller.callsign,
                    callsign_eng
                ]);
            }

            const disconnected = new Array(this.prev_atc.length).fill(true);
            const connected = new Array(this.temp_atc.length).fill(true);

            // Check status changes
            for (let i = 0; i < this.prev_atc.length; i++) {
                for (let j = 0; j < this.temp_atc.length; j++) {
                    if (this.prev_atc[i][0] === this.temp_atc[j][0] && 
                        this.prev_atc[i][1] === this.temp_atc[j][1]) {
                        disconnected[i] = false;
                        connected[j] = false;
                    }
                }
            }

            // Send connect notifications
            for (let i = 0; i < this.temp_atc.length; i++) {
                if (connected[i]) {
                    const inATC = new EmbedBuilder()
                        .setColor('Green')
                        .setTimestamp()
                        .setTitle(`${this.temp_atc[i][7]} - Online`)
                        .setDescription(`**${this.temp_atc[i][7]}** is now online on the VATSIM network.`)
                        .addFields(
                            { name: '**Name**', value: this.temp_atc[i][1], inline: true },
                            { name: '**Rating**', value: String(this.temp_atc[i][2]), inline: true },
                            { name: '**CID**', value: String(this.temp_atc[i][4]), inline: true },
                            { name: '**Callsign**', value: this.temp_atc[i][0], inline: true },
                            { name: '**Frequency**', value: this.temp_atc[i][5], inline: true },
                            { name: '**Server**', value: this.temp_atc[i][3], inline: true }
                        )
                        .setFooter({ text: "업데이트까지는 다소의 시간이 소요될수 있습니다." });

                    await automsg.send({ embeds: [inATC] });
                }
            }

            // Send disconnect notifications
            for (let i = 0; i < this.prev_atc.length; i++) {
                if (disconnected[i]) {
                    const outATC = new EmbedBuilder()
                        .setColor('Red')
                        .setTimestamp()
                        .setTitle(`${this.prev_atc[i][7]} - Offline`)
                        .setDescription(`**${this.prev_atc[i][7]}** is now Offline on the VATSIM network.`)
                        .addFields(
                            { name: '**Name**', value: this.prev_atc[i][1], inline: true },
                            { name: '**Rating**', value: String(this.prev_atc[i][2]), inline: true },
                            { name: '**CID**', value: String(this.prev_atc[i][4]), inline: true },
                            { name: '**Callsign**', value: this.prev_atc[i][0], inline: true },
                            { name: '**Frequency**', value: this.prev_atc[i][5], inline: true },
                            { name: '**Server**', value: this.prev_atc[i][3], inline: true }
                        )
                        .setFooter({ text: "업데이트까지는 다소의 시간이 소요될수 있습니다." });

                    await automsg.send({ embeds: [outATC] });
                }
            }

            this.prev_atc = [...this.temp_atc];
            this.temp_atc = [];

        } catch (error) {
            console.error('Error in VATSIM monitoring:', error);
        }
    }
}
