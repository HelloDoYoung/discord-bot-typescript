# New Discord Bot

This is a Discord bot project Using Typescript.

## Features

- Feature 1: Responds to specific commands with predefined messages.
- Feature 2: Integrates with external APIs to fetch and display data.
- Feature 3: Moderation tools to manage and control server activities.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/HelloDoYoung/discord-bot-typescript.git
    ```
2. Navigate to the project directory:
    ```sh
    cd discord-bot-typescript
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

1. Create a `.env` file in the root directory and add your Discord bot token:
    ```
    TOKEN = "your_discord_token_here"
    DISCORD_CLIENT_ID = "your_discord_client_id_here"

    DEV_TOKEN = "your_dev_discord_token_here(optional)"
    DEV_DISCORD_CLIENT_ID = "your_dev_discord_client_id_here(optional)"
    DEV_GUILD_ID = "your_dev_guild_id_here"

    DEVELOPER_USER_IDS = "your_discord_user_id_here"

    AVWX_TOKEN = "your_avwx_token_here"
    OPEN_API_TOKEN = "your_open_api_token_here"

    ATC_CHANNEL_ID = "your_atc_notice_channel_id_here"
    ```
2. Start the bot:
    ```sh
    npm run start
    ```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the MIT License.