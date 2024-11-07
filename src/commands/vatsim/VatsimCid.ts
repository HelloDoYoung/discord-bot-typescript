import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { VatsimService } from "../../base/services/VatsimService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const vatsimService = new VatsimService();

export default class VatsimCid extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'vatcid',
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
            description: 'Get the VATSIM information',
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
        
        const data = await vatsimService.fetchVatsim_Core_Members_Detail(cid);

        if (data.id) {
            if(data.lastratingchange) {
                interaction.reply({ embeds: [new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`**CID INFORMATION - ${cid}**`)
                    .addFields({ name: '**CID**', value: `\`\`${data.id}\`\``, inline: true })
                    .addFields({ name: '**Register Date**', value: `\`\`${data.reg_date.split('T')[0]}\`\` (<t:${Math.floor(new Date(data.reg_date).getTime() / 1000)}:R>)`, inline: true })
                    .addFields({ name: '**Last Rating Change**', value: `\`\`${data.lastratingchange.split('T')[0]}\`\` (<t:${Math.floor(new Date(data.lastratingchange).getTime() / 1000)}:R>)`, inline: true })
                    .addFields({ name: '**Region**', value: `\`\`${data.region_id}\`\``, inline: true })
                    .addFields({ name: '**Division**', value: `\`\`${data.division_id}\`\``, inline: true })
                    .addFields({ name: '**Subdivision**', value: `\`\`${data.subdivision_id || 'None'}\`\``, inline: true })
                    .addFields({ name: '**Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_ratings(data.rating)}\`\``, inline: true })
                    .addFields({ name: '**Pilot Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_p_ratings(data.pilotrating)}\`\``, inline: true })
                    .addFields({ name: '**Military Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_m_ratings(data.militaryrating)}\`\``, inline: true })
                    .setFooter({ text: `${interaction.user.username} • VIA VATSIM API`, })
                    .setTimestamp()
                ], ephemeral: false });
            } else {
                interaction.reply({ embeds: [new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`**CID INFORMATION - ${cid}**`)
                    .addFields({ name: '**CID**', value: `\`\`${data.id}\`\``, inline: true })
                    .addFields({ name: '**Register Date**', value: `\`\`${data.reg_date.split('T')[0]}\`\` (<t:${Math.floor(new Date(data.reg_date).getTime() / 1000)}:R>)`, inline: true })
                    .addFields({ name: '**Last Rating Change**', value: `\`\`None\`\``, inline: true })
                    .addFields({ name: '**Region**', value: `\`\`${data.region_id}\`\``, inline: true })
                    .addFields({ name: '**Division**', value: `\`\`${data.division_id}\`\``, inline: true })
                    .addFields({ name: '**Subdivision**', value: `\`\`${data.subdivision_id || 'None'}\`\``, inline: true })
                    .addFields({ name: '**Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_ratings(data.rating)}\`\``, inline: true })
                    .addFields({ name: '**Pilot Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_p_ratings(data.pilotrating)}\`\``, inline: true })
                    .addFields({ name: '**Military Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_m_ratings(data.militaryrating)}\`\``, inline: true })
                    .setFooter({ text: `${interaction.user.username} • VIA VATSIM API`, })
                    .setTimestamp()
                ], ephemeral: false });
            }
        } else {
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`\`\`${cid}\`\` is not VATSIM member`)
            ], ephemeral: true });
        }
    }
}