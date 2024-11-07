import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { VatsimService } from "../../base/services/VatsimService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const vatsimService = new VatsimService();

export default class VatsimAirport extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'vataip',
            category: Category.Utilities,
            default_member_permission: PermissionsBitField.Flags.UseApplicationCommands,
            options: [
                {
                    name: 'icao',
                    description: 'ICAO code of the airport you want to search for',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            cooldown: 0,
            dev: false,
            description: 'Get a Airport Information from VATSIM Server',
            dm_permission: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const icao = interaction.options.getString('icao')?.toUpperCase() || '';
        const fetch = await vatsimService.fetchVatsim_AIP_Information(icao);
        const data = fetch?.data;

        if (data && data.icao) {
            let callsigns: string[] = [];
            let names: string[] = [];
            let frequencies: string[] = [];

            data.stations.forEach((station: { callsign: any; name: any; frequency: any; ctaf: any; }) => {
                callsigns.push(station.callsign);
                names.push(station.name);
                frequencies.push(station.frequency);
            });

            const callsignsStr = callsigns.join('\n');
            const namesStr = names.join('\n');
            const frequenciesStr = frequencies.join('\n');
            
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**VATSIM Airport INFORMATION - ${icao}**`)
                .addFields({ name: '**Airport ICAO Code**', value: `\`\`${data.icao}\`\``, inline: true })
                .addFields({ name: '**Airport IATA Code**', value: `\`\`${data.iata}\`\``, inline: true })
                .addFields({ name: '**Airport Name**', value: `\`\`${data.name}\`\``, inline: true })
                .addFields({ name: '**Airport Elevation(ft)**', value: `\`\`${data.altitude_ft}ft\`\``, inline: true })
                .addFields({ name: '**Airport Elevation(m)**', value: `\`\`${data.altitude_m}m\`\``, inline: true })
                .addFields({ name: '\u200B', value: '\u200B', inline: true })
                .addFields({ name: '**Transition Altitude**', value: `\`\`${data.transition_alt}ft\`\``, inline: true })
                .addFields({ name: '**Transition Level**', value: `\`\`${data.transition_level}\`\``, inline: true })
                .addFields({ name: '**Transition Level by ATC**', value: `\`\`${data.transition_level_by_atc ? 'O' : 'X'}\`\``, inline: true })
                .addFields({ name: '**City**', value: `\`\`${data.city}\`\``, inline: true })
                .addFields({ name: '**Country**', value: `\`\`${data.country}\`\``, inline: true })
                .addFields({ name: '**Division**', value: `\`\`${data.division_id}\`\``, inline: true })
                .addFields({ name: '**Callsign**', value: `\`\`${callsignsStr}\`\``, inline: true })
                .addFields({ name: '**Name**', value: `\`\`${namesStr}\`\``, inline: true })
                .addFields({ name: '**Frequency**', value: `\`\`${frequenciesStr}\`\``, inline: true })
                .setFooter({ text: `${interaction.user.username} • VIA VATSIM API`, })
                .setTimestamp()
            ], ephemeral: false });
        } else {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`\`\`${icao}\`\` cannot be retrieved from VATSIM database`)
            ], ephemeral: true });
        }
    }
}