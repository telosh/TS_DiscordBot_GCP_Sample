import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';

const command = {
  data: new SlashCommandBuilder()
    .setName('emojis')
    .setDescription('サーバーの絵文字一覧を表示します'),
  async execute(interaction : CommandInteraction) {
    // interaction.guildが存在するかを確認
    if (!interaction.guild) {
      await interaction.reply('サーバー情報を取得できませんでした。');
      return;
    }

    const emojis = interaction.guild.emojis.cache;

    if (emojis.size === 0) {
      await interaction.reply('このサーバーには絵文字がありません');
      return;
    }

    const emojiList = emojis.map((emoji) => `${emoji} — \`${emoji.name}\``).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`サーバー絵文字リスト (${emojis.size})`)
      .setDescription(emojiList)
      .setColor('#0099ff');

    // interaction.reply で返信を行う
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
