import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { VatsimService } from "../../base/services/VatsimService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const vatsimService = new VatsimService();

export default class VatsimMetar extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'vatmetar',
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
            description: 'Get the METAR for a specific airport from VATSIM Server',
            dm_permission: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const icao = interaction.options.getString('icao')?.toUpperCase() || '';
        const data = await vatsimService.fetchVatsim_Metar_Metar(icao);
        if (data) {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**VATSIM METAR - ${icao}**`)
                .addFields({ name: '**Raw Text**', value: `\`\`\`${data}\`\`\`` })
                .setFooter({ text: `${interaction.user.username} • VIA VATSIM API` })
                .setTimestamp()
            ], ephemeral: false });
        } else {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Error fetching METAR for ${icao}`)
            ], ephemeral: true });
        }
    }
}