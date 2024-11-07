import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { VatsimService } from "../../base/services/VatsimService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const vatsimService = new VatsimService();

export default class VatsimStats extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'vatstats',
            category: Category.Utilities,
            default_member_permission: PermissionsBitField.Flags.UseApplicationCommands,
            options: [
                {
                    name: 'cid',
                    description: 'VATSIM CID of the user you want to search for',
                    required: false,
                    type: ApplicationCommandOptionType.String
                },
                {
                    name: 'user',
                    description: 'Discord User ID you want to search for',
                    required: false,
                    type: ApplicationCommandOptionType.User
                }
            ],
            cooldown: 0,
            dev: false,
            description: 'Get the VATSIM stats',
            dm_permission: true
        });
    }

    async Execute(interaction: ChatInputCommandInteraction) {
        let cid = interaction.options.getString('cid') || '';
        const discord_id = interaction.options.getUser('user')?.id || '';
        
        if (!cid && !discord_id) {
            return await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Please provide either CID or user`)
            ], ephemeral: true });
        }

        if (cid && discord_id) {
            return await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Only one of the following must be provided: CID or user`)
            ], ephemeral: true });
        }

        if (discord_id) {
            const data = await vatsimService.fetchVatsimDiscord_Verify(discord_id, interaction);
            if(data) cid = data.user_id; else return;
        }

        const data = await vatsimService.fetchVatsim_Core_Members_Statics(cid);
        const total_time = parseFloat((data.s1 + data.s2 + data.s3 + data.c1 + data.c2 + data.c3 + data.i1 + data.i2 + data.i3 + data.sup + data.adm + data.pilot).toFixed(3));
        if (data.id) {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**VATSIM STATS - ${cid}**`)
                .addFields({ name: '**CID**', value: `\`\`${data.id}\`\``, inline: true })
                .addFields({ name: '**Pilot Time**', value: `\`\`${data.pilot}h\`\``, inline: true })
                .addFields({ name: '**Controller Time**', value: `\`\`${data.atc}h\`\``, inline: true })
                .addFields({ name: '**Student1 Time**', value: `\`\`${data.s1}h\`\``, inline: true })
                .addFields({ name: '**Student2 Time**', value: `\`\`${data.s2}h\`\``, inline: true })
                .addFields({ name: '**Student3 Time**', value: `\`\`${data.s3}h\`\``, inline: true })
                .addFields({ name: '**Controller1 Time**', value: `\`\`${data.c1}h\`\``, inline: true })
                .addFields({ name: '**Controller2 Time**', value: `\`\`${data.c2}h\`\``, inline: true })
                .addFields({ name: '**Controller3 Time**', value: `\`\`${data.c3}h\`\``, inline: true })
                .addFields({ name: '**Instructor1 Time**', value: `\`\`${data.i1}h\`\``, inline: true })
                .addFields({ name: '**Instructor2 Time**', value: `\`\`${data.i2}h\`\``, inline: true })
                .addFields({ name: '**Instructor3 Time**', value: `\`\`${data.i3}h\`\``, inline: true })
                .addFields({ name: '**Supervisor Time**', value: `\`\`${data.sup}h\`\``, inline: true })
                .addFields({ name: '**Administrator Time**', value: `\`\`${data.adm}h\`\``, inline: true })
                .addFields({ name: '**Total Time**', value: `\`\`${total_time}h\`\``, inline: true })
                .setFooter({ text: `${interaction.user.username} • VIA VATSIM API` })
                .setTimestamp()
            ], ephemeral: false });
        } else {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`\`\`${cid}\`\` is not VATSIM member`)
            ], ephemeral: true });
        }
    }
}