import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { Client, Message, Events, GatewayIntentBits, ActivityType, CommandInteraction, ChatInputCommandInteraction, InteractionType, InteractionResponseType } from 'discord.js';
import fs from 'fs';
import path from 'path';

import registerCommands from './deploy-commands'; registerCommands();

const app = express();
const PORT = process.env.PORT || 8080;
const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;

// Discord パブリックキーの存在確認
if (!discordPublicKey) {
    throw new Error("Discordのパブリックキーが環境変数として設定されていません。");
  }

// 環境変数の型安全な取得関数
function getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name}が見つかりませんでした。`);
    }
    return value;
}

// 定数の定義
const token = getRequiredEnvVar('DISCORD_TOKEN');

// コマンドインターフェース
interface Command {
    data: {
        name: string;
        description: string;
    };
    execute: (interaction: CommandInteraction) => Promise<void>;
}

// クライアントの初期化
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ] 
});

// コマンドを保持するMap
const commands: Map<string, Command> = new Map();


client.once(Events.ClientReady, async (c: Client) => {
    if (client.user) {
        client.user.setActivity("🥔を栽培中", { type: ActivityType.Playing });
    }

    console.log(`準備OKです! ${c.user?.tag}がログインしました。`);
});


// コマンドの読み込み関数
const loadCommands = async () => {
    const commandsPath = path.join(__dirname, 'commands');
    
    // コマンドファイルの読み込み
    const commandFiles = fs.readdirSync(commandsPath).filter(file => 
        file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.cjs')
    );
  
    // 各コマンドファイルの処理
    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
  
        // コマンドの名前を確認し、Mapに登録
        if (command.default?.data?.name) {
          commands.set(command.default.data.name, command.default);
          console.log(`${command.default.data.name}コマンドを登録しました。`);
        } else {
          console.warn(`コマンド名が指定されていないファイル: ${file}`);
        }
      } catch (error) {
        console.error(`コマンド読み込み中にエラーが発生しました (${file}):`, error);
      }
    }
  };

// イベントリスナー

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
        const command = commands.get(interaction.commandName);
        if (!command) {
            console.error(`${interaction.commandName}というコマンドには対応していません。`);
            return;
        }

        try {
            await command.execute(interaction as ChatInputCommandInteraction);
        } catch (error) {
            console.error('コマンド実行中にエラーが発生しました:', error);
            const response = { 
                content: 'コマンド実行時にエラーが発生しました。', 
                ephemeral: true 
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(response);
            } else {
                await interaction.reply(response);
            }
        }
    } else if (interaction.isModalSubmit()) {
        try{
            console.log('モーダル送信イベントを受信しました。');
            //contact-v2.tsのモーダル送信時の処理
            const command = interaction.customId;
            if (!command) {
                console.error('コマンドが見つかりません。');
                return;
            }            

            let responseContent = '';
            switch (command) {
                case 'contactForm':
                    { 
                        const title = interaction.fields.getTextInputValue(`contact_title`);
                        const body = interaction.fields.getTextInputValue(`contact_body`);

                        // DBのcontactsテーブルにデータを挿入
                        const { error } = await supabase.from('contacts').insert([
                            { 
                                inquiry_text: body,
                                user_id: Number(interaction.user.id), 
                                handler_id: 344833367348609000, 
                                status_id: 1, 
                                inquiry_title: title 
                            }]);
                            
                        if (error) {
                            console.error('DB挿入中にエラーが発生しました:', error);
                        }


                        responseContent = 'お問い合わせを受け付けました。';
                        console.log(`お問い合わせ: タイトル: ${title}, 本文: ${body}`);
                        break; 
                    }
                // case 'shareRecipe':
                //     {
                //         responseContent = 'レシピを投稿しました。';
                //         console.log(`レシピ: タイトル: , 本文: `);        
                //         break;
                //     }
                // case 'shareEvent':
                //     {
                //         responseContent = 'イベントを投稿しました。';
                //         console.log(`イベント: タイトル: , 本文:`);
                //         break;
                //     }
                // case 'guild_poll':
                //     {
                //         responseContent = 'アンケートを投稿しました。';
                //         console.log(`アンケート: タイトル: , 本文: `);
                //         break;
                //     }
                // case 'report_user':
                //     {
                //         responseContent = '通報を受け付けました。';
                //         console.log(`通報: タイトル: , 本文: `);
                //         break;
                //     }
                // case 'lottery_join':
                //     {
                //         responseContent = '抽選に参加登録しました。';
                //         console.log(`通報: タイトル: , 本文: `);
                //         break;
                //     }
                // default:
                //     {
                //         console.error('不明なコマンドです。');
                //         return;
                //     }
            }

            const response = { content: responseContent, ephemeral: true };
            await interaction.reply(response);
        } catch (error) {
            console.error('モーダル送信時にエラーが発生しました:', error);
            const response = { 
                content: 'モーダル送信時にエラーが発生しました。', 
                ephemeral: true 
            };
            await interaction.reply(response);
        }
    } // buttonを押した時の処理
    else if (interaction.isButton()) {
        const button = interaction.customId;
        if (!button) {
            console.error('ボタンが見つかりません。');
            return;
        }
        let responseContent = '';
        switch (button) {
            case 'welcome_button':
                {
                    try {
                        // 押したユーザーにロールを付与
                        const guild = interaction.guild;
                        if (!guild) {
                            console.error('ギルドが見つかりません。');
                            break;
                        }

                         // サーバーオーナーのIDを取得
                        const ownerId = guild.ownerId;
                        const member = guild.members.cache.get(interaction.user.id);

                        // 対象がサーバーオーナーならスキップ
                        if (member && member.id === ownerId) {
                            console.log("サーバーオーナーには役職を付与しません。");
                            responseContent = 'サーバーオーナーには役職を付与しません。';
                            break;
                        }

                        const role = guild.roles.cache.find(role => role.name === 'Member');

                        if (member && role) {
                            if (member.roles.cache.has(role.id)) {
                                responseContent = `${interaction.user.username}さん、すでに「${role.name}」ロールが付与されています。`;
                                console.log(`ユーザー ${interaction.user.username} はすでにロール「${role.name}」を持っています。`);
                            } else {
                                await member.roles.add(role);
                                responseContent = `${interaction.user.username}さん、ようこそ！`;
                                console.log(`ロール「${role.name}」がユーザー ${interaction.user.username} に追加されました。`);
                            }
                        }

                        responseContent = `${interaction.user.username}さん、ようこそ！`;
                        console.log('ボタンが押されました。');
                    } catch (error) {
                        console.error('ロール付与中にエラーが発生しました:', error);
                        responseContent = 'ロール付与中にエラーが発生しました。';
                    }
                    break;
                }
            default:
                {
                    console.error('不明なボタンです。');
                    return;
                }
        }

        const response = { content: responseContent, ephemeral: true };
        await interaction.reply(response);
    } 
});

// Discordインタラクションエンドポイント
app.post('/interactions', verifyKeyMiddleware(discordPublicKey), async (req: Request, res: Response) => {
    const interaction = req.body;
  
    // コマンドの確認と実行
    const command = commands.get(interaction.data?.name);
    if (command) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('コマンド実行中にエラーが発生しました:', error);
        res.status(500).send({ error: 'コマンド実行中にエラーが発生しました。' });
      }
    } else {
      res.status(404).send({ error: 'コマンドが見つかりません。' });
    }
});

const myConfig = function (req: Request & { discordClient?: Client<boolean> }, res: Response, next: () => void) {
    req.discordClient = client;
    next()
};

app.use((req, res, next) => myConfig(req as Request & { discordClient?: Client<boolean> }, res, next));

// サーバーの起動
app.listen(PORT, async () => {
    await loadCommands();
    console.log(`サーバーはポート${PORT}で起動中です。`);
  });

  client.login(token).catch(error => {
    console.error('ログインに失敗しました:', error);
    process.exit(1);
});