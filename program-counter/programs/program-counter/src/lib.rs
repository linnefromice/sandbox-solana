use anchor_lang::prelude::*;

declare_id!("7KA9m77s3r75FcuJDJDhirgELXZD2rLw9JNw8GB9XFtZ");

#[program]
pub mod program_counter {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        let executor = &mut ctx.accounts.executor;
        executor.total = 0;
        executor.add_count = 0;
        executor.sub_count = 0;
        Ok(())
    }

    pub fn add(ctx: Context<Add>, data: AddData) -> Result<()> {
        Ok(())
    }

    pub fn sub(ctx: Context<Sub>, data: SubData) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + AccountStats::MAX_SIZE,
    )]
    pub executor: Account<'info, AccountStats>, // アカウントを初期化
    #[account(mut)]
    pub signer: Signer<'info>, // ユーザーの署名者
    pub system_program: Program<'info, System>, // 必須のシステムプログラム
}

#[account]
#[derive(Default)]
pub struct AccountStats {
    pub total: u64,
    pub add_count: u64,
    pub sub_count: u64,
}
impl AccountStats {
    // ref: https://book.anchor-lang.com/anchor_references/space.html
    pub const MAX_SIZE: usize = 8 + 8 + 8;
}

#[derive(Accounts)]
pub struct Add<'info> {
    #[account(mut)]
    pub executor: Account<'info, AccountStats>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy, Debug)]
pub struct AddData {
    pub value: u64,
    pub count: u64
}

#[derive(Accounts)]
pub struct Sub<'info> {
    #[account(mut)]
    pub executor: Account<'info, AccountStats>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy, Debug)]
pub struct SubData {
    pub value: u64,
    pub count: u64
}
