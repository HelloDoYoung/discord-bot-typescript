import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { AvwxService } from "../../base/services/AvwxService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const avwxService = new AvwxService();

export default class AirportSearch extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'airport',
            category: Category.Utilities,
            default_member_permission: PermissionsBitField.Flags.UseApplicationCommands,
            options: [
                {
                    name: 'icao',
                    description: 'ICAO code of the airport you want to search for',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ],
            cooldown: 0,
            dev: false,
            description: 'Get the airport information for a specific ICAO code',
            dm_permission: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
            const icao = interaction.options.getString('icao')?.toUpperCase() || '';
            const data = await avwxService.fetchAirportData(icao);

            if (data.icao) {
            let bearing: string[] = [];
            let ident: string[] = [];
            let length_ft: string[] = [];
            let lights: string[] = [];
            let surface: string[] = [];
            let width_ft: string[] = [];

            data.runways.sort((a: any, b: any) => {
                const identA = a.ident1.match(/\d+/)[0];
                const identB = b.ident1.match(/\d+/)[0];
                if (identA === identB) {
                if (a.ident1.includes('L')) return -1;
                if (b.ident1.includes('L')) return 1;
                if (a.ident1.includes('R')) return -1;
                if (b.ident1.includes('R')) return 1;
                }
                return identA - identB;
            });

            data.runways.forEach((runways: { bearing1: any; bearing2: any; ident1: any; ident2: any; length_ft: any; lights: any; surface: any; width_ft: any;}) => {
                bearing.push(`${runways.bearing1} - ${runways.bearing2}`);
                ident.push(`${runways.ident1} - ${runways.ident2}`);
                length_ft.push(`${runways.length_ft}ft`);
                lights.push(runways.lights);
                surface.push(runways.surface);
                width_ft.push(`${runways.width_ft}ft`);
            });

            const bearingStr = bearing.join('\n');
            const identStr = ident.join('\n');
            const lengthStr = length_ft.join('\n');
            const lightsStr = lights.map(light => light ? 'O' : 'X').join('\n');
            const surfaceStr = surface.join('\n');
            const widthStr = width_ft.join('\n');

            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**AIRPORT INFO - ${icao}**`)
                .addFields({ name: '**Airport Name**', value: `\`\`${data.name}\`\``, inline: true })
                .addFields({ name: '**ICAO Code**', value: `\`\`${data.icao}\`\``, inline: true })
                .addFields({ name: '**IATA Code**', value: `\`\`${data.iata}\`\``, inline: true })
                .addFields({ name: '**Country**', value: `\`\`${data.country}\`\``, inline: true })
                .addFields({ name: '**City**', value: `\`\`${data.city}\`\``, inline: true })
                .addFields({ name: '**Type**', value: `\`\`${data.type}\`\``, inline: true })
                .addFields({ name: '**Elevation(ft)**', value: `\`\`${data.elevation_ft}ft\`\``, inline: true })
                .addFields({ name: '**Elevation(m)**', value: `\`\`${data.elevation_m}m\`\``, inline: true })
                .addFields({ name: '\u200B', value: '\u200B', inline: true })
                .addFields({ name: '**Latitude**', value: `\`\`${data.latitude}\`\``, inline: true })
                .addFields({ name: '**Longitude**', value: `\`\`${data.longitude}\`\``, inline: true })
                .addFields({ name: '**Reporting**', value: `\`\`${data.reporting ? 'O' : 'X'}\`\``, inline: true })
                .addFields({ name: '**Runways**', value: `\`\`${identStr}\`\``, inline: true })
                .addFields({ name: '**Heading**', value: `\`\`${bearingStr}\`\``, inline: true })
                .addFields({ name: '**Lights**', value: `\`\`${lightsStr}\`\``, inline: true })
                .addFields({ name: '**Length**', value: `\`\`${lengthStr}\`\``, inline: true })
                .addFields({ name: '**Width**', value: `\`\`${widthStr}\`\``, inline: true })
                .addFields({ name: '**Surface**', value: `\`\`${surfaceStr}\`\``, inline: true })
                .setFooter({ text: `${interaction.user.username} • VIA AVWX API`, })
                .setTimestamp()
            ], ephemeral: false });
        } else {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`❌ Error fetching Airport Data for \`\`${icao}\`\``)
            ], ephemeral: true });
        }
    }
}