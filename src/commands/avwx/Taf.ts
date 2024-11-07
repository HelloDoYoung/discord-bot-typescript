import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { AvwxService } from "../../base/services/AvwxService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const avwxService = new AvwxService();

export default class Taf extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'taf',
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
            description: 'Get the TAF for a specific airport',
            dm_permission: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const icao = interaction.options.getString('icao')?.toUpperCase() || '';
        const data = await avwxService.fetchTaf(icao, ['info', 'translate']);

        if (!data || !data.forecast || !data.time || !data.station) {
            return interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Error fetching TAF for \`\`${icao}\`\``)
            ], ephemeral: true });
        }

        let forecastMessages = [];
        let forecastArray = [...data.forecast];
        let firstForecast = forecastArray.shift();
        let firstForecastRaw = firstForecast?.raw || '';
        let reportTime = data.time.repr;
        let stationCode = data.station;

        for(let i = 0; i < forecastArray.length; i++){
            const currentForecast = forecastArray[i].raw;
            const formattedForecast = currentForecast;
            forecastMessages.push([formattedForecast]);
        }

        let finalOutput = `TAF ${stationCode} ${reportTime} ${firstForecastRaw}`;
        for(let j = 0; j < forecastMessages.length; j++){
            finalOutput += `\n${forecastMessages[j]}`;
        }

        if (!data.error) {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**TAF - ${icao}**`)
                .addFields({ name: '**Raw Text**', value: `\`\`\`${finalOutput}\`\`\`` })
                .setFooter({ text: `${interaction.user.username} • VIA AVWX API`, })
                .setTimestamp()
            ], ephemeral: false });
        }
    }
}