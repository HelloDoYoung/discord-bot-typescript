import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { VatsimService } from "../../base/services/VatsimService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const vatsimService = new VatsimService();

export default class VatsimAtis extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'vatatis',
            category: Category.Utilities,
            default_member_permission: PermissionsBitField.Flags.UseApplicationCommands,
            options: [
                {
                    name: 'icao',
                    description: 'ICAO code of the airport you want to search for (ICAO Code Only)',
                    required: true,
                    type: ApplicationCommandOptionType.String
                }
            ],
            cooldown: 0,
            dev: false,
            description: 'Get a ATIS Information from VATSIM Server',
            dm_permission: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        const icao_origin = interaction.options.getString('icao')?.toUpperCase() || '';
        const icao = `${icao_origin}_ATIS`
        const data = await vatsimService.fetchVatsim_Main();
        const atisData = data.atis.find((Data: { callsign: string; }) => Data.callsign === icao);
        if(atisData) {
            const unix_timestamp_logon = Math.floor(new Date(atisData.logon_time).getTime() / 1000);
            const unix_timestamp_last = Math.floor(new Date(atisData.last_updated).getTime() / 1000);
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setThumbnail(`https://cdn4.iconfinder.com/data/icons/tabler-vol-4/24/letter-${atisData.atis_code.toLowerCase()}-1024.png`)
                .setTitle(`**VATSIM ATIS INFORMATION - ${icao}**`)
                .addFields({ name: '**CID**', value: `\`\`${atisData.cid}\`\``, inline: true })
                .addFields({ name: '**Name**', value: `\`\`${atisData.name}\`\``, inline: true})
                .addFields({ name: '**Server**', value: `\`\`${atisData.server}\`\``, inline: true})
                .addFields({ name: '**Callsign**', value: `\`\`${atisData.callsign}\`\``, inline: true})
                .addFields({ name: '**Frequency**', value: `\`\`${atisData.frequency}\`\``, inline: true})
                .addFields({ name: '**ATIS Code**', value: `\`\`${atisData.atis_code}\`\``, inline: true})
                .addFields({ name: '**Text ATIS**', value: `\`\`\`${atisData.text_atis}\`\`\`` })
                .addFields({ name: '**Logon Time**', value: `<t:${unix_timestamp_logon}:R>`, inline: true})
                .addFields({ name: '**Last Updated**', value: `<t:${unix_timestamp_last}:R>`, inline: true})
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