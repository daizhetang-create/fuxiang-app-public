# 15 分钟启用浮想

## 你现在只需要做三件事

1. 硅基流动：删除聊天中暴露过的旧 Key，创建一把新 Key。
2. Supabase：创建免费项目，依次运行 `supabase/00_extensions.sql` 和 `supabase/schema.sql`。
3. Vercel：导入项目并填写下面 6 个环境变量，然后 Deploy。

```env
AI_BASE_URL=https://api.siliconflow.cn/v1
AI_API_KEY=你的新密钥
AI_TEXT_MODEL=Pro/moonshotai/Kimi-K2.6
AI_TRANSCRIBE_MODEL=FunAudioLLM/SenseVoiceSmall
VITE_SUPABASE_URL=你的_Project_URL
VITE_SUPABASE_ANON_KEY=你的_anon_public_key
```

模型不是在控制台里每次手动选择。浮想会自动用 `AI_TEXT_MODEL` 整理文字，用 `AI_TRANSCRIBE_MODEL` 转录语音；未来换模型只改环境变量并重新部署。

所有内测用户共用服务端的一把硅基流动 Key，只注册浮想账号，不需要各自充值。建议限制单次录音 3 分钟，并在硅基流动控制台观察余额。

重要：不要把 Key 放进 `VITE_` 变量、源码、GitHub 或版本快照。Vercel 中只使用服务端变量 `AI_API_KEY`。
