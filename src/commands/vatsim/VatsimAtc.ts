import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { VatsimService } from "../../base/services/VatsimService";
import Command from "../../base/classes/Command";
import Category from "../../base/enums/Category";
import CustomClient from "../../base/classes/CustomClient";

const vatsimService = new VatsimService();

export default class VatsimFlight extends Command {
    constructor(client: CustomClient) {
        super(client, {
            name: 'vatflight',
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
                },
                {
                    name: 'callsign',
                    description: 'VATSIM Callsign of the user you want to search for',
                    required: false,
                    type: ApplicationCommandOptionType.String
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
        let callsign = interaction.options.getString('callsign')?.toUpperCase() || '';

        if ((!cid && !discord_id && !callsign)) {
            return await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Please provide either CID, user or callsign`)
            ], ephemeral: true });
        }

        if ((cid && discord_id) || (cid && callsign) || (discord_id && callsign)) {
            return await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Only one of the following must be provided: CID, user or callsign`)
            ], ephemeral: true });
        }

        if (discord_id) {
            const data = await vatsimService.fetchVatsimDiscord_Verify(discord_id, interaction);
            if(data) {
                const online_status = await vatsimService.fetchVatsim_Core_Members_Online(data.user_id);
                if(online_status.callsign) {
                    callsign = online_status.callsign;
                } else {
                    return await interaction.reply({ embeds: [new EmbedBuilder()
                        .setColor("Red")
                        .setDescription(`<@${discord_id}> is not online on VATSIM`)
                    ], ephemeral: true });
                }
            } else {
                return;
            }
        }

        if (cid) {
            const data = await vatsimService.fetchVatsim_Core_Members_Online(cid);
        
            if(data.callsign) {
                callsign = data.callsign;
            } else {
                return await interaction.reply({ embeds: [new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`\`\`${cid}\`\` is not online on VATSIM`)
                ], ephemeral: true });
            }
        }

        const data = await vatsimService.fetchVatsim_Main();

        if(data.pilots && data.pilots.find((x: any) => x.callsign === callsign)) {
            const pilotData = data.pilots.find((Data: { callsign: string; }) => Data.callsign === `${callsign}`);
            interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Green")
                .setTitle(`**FLIGHT INFORMATION - ${callsign}**`)
                .addFields({ name: '**CID**', value: `\`\`${pilotData.cid}\`\``, inline: true })
                .addFields({ name: '**Name**', value: `\`\`${pilotData.name}\`\``, inline: true })
                .addFields({ name: '**Server**', value: `\`\`${pilotData.server}\`\``, inline: true })
                .addFields({ name: '**Callsign**', value: `\`\`${callsign}\`\``, inline: true })
                .addFields({ name: '**Pilot Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_p_ratings(pilotData.pilot_rating)}\`\``, inline: true })
                .addFields({ name: '**Military Rating**', value: `\`\`${await vatsimService.fetchVatsimRating_m_ratings(pilotData.military_rating)}\`\``, inline: true })
                .addFields({ name: '**Latitude**', value: `\`\`${pilotData.latitude}\`\``, inline: true })
                .addFields({ name: '**Longitude**', value: `\`\`${pilotData.longitude}\`\``, inline: true })
                .addFields({ name: '**Altitude**', value: `\`\`${pilotData.altitude}ft\`\``, inline: true })
                .addFields({ name: '**Groundspeed**', value: `\`\`${pilotData.groundspeed}kts\`\``, inline: true })
                .addFields({ name: '**Heading**', value: `\`\`${pilotData.heading}°\`\``, inline: true })
                .addFields({ name: '**QNH**', value: `\`\`${pilotData.qnh_mb}hpa (${pilotData.qnh_i_hg}inch)\`\``, inline: true })
                .addFields({ name: '**Aircraft**', value: `\`\`${pilotData.flight_plan.aircraft_short}\`\``, inline: true })
                .addFields({ name: '**Plan Cruise Altitude**', value: `\`\`${pilotData.flight_plan.altitude}ft\`\``, inline: true })
                .addFields({ name: '**Plan Cruise TAS**', value: `\`\`${pilotData.flight_plan.cruise_tas}kts\`\``, inline: true })
                .addFields({ name: '**Plan Departure**', value: `\`\`${pilotData.flight_plan.departure}\`\``, inline: true })
                .addFields({ name: '**Plan Arrival**', value: `\`\`${pilotData.flight_plan.arrival}\`\``, inline: true })
                .addFields({ name: '**Plan Alternate**', value: `\`\`${pilotData.flight_plan.alternate}\`\``, inline: true })
                .addFields({ name: '**Plan Dep Time**', value: `\`\`${pilotData.flight_plan.deptime}\`\``, inline: true })
                .addFields({ name: '**Plan Enroute Time**', value: `\`\`${pilotData.flight_plan.enroute_time}\`\``, inline: true })
                .addFields({ name: '**Plan Fuel Time**', value: `\`\`${pilotData.flight_plan.fuel_time}\`\``, inline: true })
                .addFields({ name: '**Route**', value: `\`\`\`${pilotData.flight_plan.route}\`\`\`` })
                .addFields({ name: '**Remarks**', value: `\`\`\`${pilotData.flight_plan.remarks}\`\`\`` })
                .addFields({ name: '**Logon Time**', value: `<t:${Math.floor(new Date(pilotData.logon_time).getTime() / 1000)}:R>`, inline: true })
                .addFields({ name: '**Last Updated**', value: `<t:${Math.floor(new Date(pilotData.last_updated).getTime() / 1000)}:R>`, inline: true })
                .setFooter({ text: `${interaction.user.username} • VIA VATSIM API`, })
                .setTimestamp()
            ], ephemeral: false });
        } else {
            return await interaction.reply({ embeds: [new EmbedBuilder()
                .setColor("Red")
                .setDescription(`\`\`${callsign}\`\` is not online on VATSIM`)
            ], ephemeral: true });
        }
    }
}