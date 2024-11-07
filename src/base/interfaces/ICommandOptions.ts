import Category from "../enums/Category";

export default interface ICommandOptions {
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permission: bigint;
    dm_permission: boolean;
    cooldown: number;
    dev: boolean;
}