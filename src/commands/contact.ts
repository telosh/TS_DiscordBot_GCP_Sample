import { 
    SlashCommandBuilder,  
    ActionRowBuilder, 
    CommandInteraction, 
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    // StringSelectMenuBuilder,
    // StringSelectMenuInteraction, 
    // StringSelectMenuOptionBuilder,
    // ComponentType 
} from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const command = {
    data: new SlashCommandBuilder()
        .setName('contact')
        .setDescription('お問い合わせフォームを表示します。'),
    
    async execute(interaction: CommandInteraction) {
        // モーダルの設定
        const modal = new ModalBuilder()
            .setTitle('お問い合わせフォーム')
            .setCustomId('contactForm'); // モーダルのユニークID

         // お問い合わせのタイトル
         const titleInput = new TextInputBuilder()
         .setCustomId('contact_title')
         .setLabel('お問い合わせのタイトル')
         .setStyle(TextInputStyle.Short)
         .setPlaceholder('例: サーバーに関する質問')
         .setRequired(true); // 必須入力

        // お問い合わせの本文
        const bodyInput = new TextInputBuilder()
            .setCustomId('contact_body')
            .setLabel('お問い合わせ内容を詳しく記入してください')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('内容をここに入力してください')
            .setRequired(true); // 必須入力

        // 各コンポーネントをアクションロウに追加
        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(titleInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(bodyInput);

        // 
        modal.setComponents(firstActionRow, secondActionRow);
        return interaction.showModal(modal);
    },
};

export default command;
