require('dotenv').config();

import { Client, Collection, GatewayIntentBits } from 'discord.js';
import ICustomClient from '../interfaces/ICustomClient';
import IConfig from '../interfaces/IConfig';
import Handler from './Handler';
import Command from './Command';
import SubCommand from './SubCommand';

export default class CustomClient extends Client implements ICustomClient 
{
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;

    constructor()
    {
        super({ intents: [GatewayIntentBits.Guilds] })

        this.config = {
            token: process.env.TOKEN || '',
            discordClientId: process.env.DISCORD_CLIENT_ID || '',
            devToken: process.env.DEV_TOKEN || '',
            devDiscordClientId: process.env.DEV_DISCORD_CLIENT_ID || '',
            devGuildId: process.env.DEV_GUILD_ID || '',
            developerUserIds: process.env.DEVELOPER_USER_IDS?.split(',') || []
        };
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
        this.developmentMode = (process.argv.slice(2).includes('--development'));
    }
    Init(): void {
        console.log(`Starting the bot in ${this.developmentMode ? 'development' : 'production'} mode.`);
        this.LoadHandlers();
        
        this.login(this.developmentMode ? this.config.devToken : this.config.token)
            .catch((err) => console.log(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}