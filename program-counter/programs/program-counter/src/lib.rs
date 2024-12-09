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

    // pub fn add(ctx: &Context<AddContext>, data: AddData) -> Result<()> {
    //     todo!()
    // }

    // pub fn sub(ctx: &Context<SubContext>, data: SubData) -> Result<()> {
    //     todo!()
    // }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + AccountStats::MAX_SIZE,
    )]
    pub executor: Account<'info, AccountStats>, // アカウントを初期化
    #[account(mut)]
    pub user: Signer<'info>, // ユーザーの署名者
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

// #[derive(Accounts)]
// pub struct AddContext<'info> {
//     #[account(mut)]
//     pub executor: ProgramAccount<'info, AccountStats>,
//     #[account(mut)]
//     pub user: Signer<'info>, // ユーザー署名
// }

// #[derive(Accounts)]
// pub struct SubContext<'info> {
//     #[account(mut)]
//     pub executor: ProgramAccount<'info, AccountStats>,
//     #[account(mut)]
//     pub user: Signer<'info>, // ユーザー署名
// }


// #[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy, Debug)]
// pub struct AddData {
//     pub value: u64
//     pub count: u64
// }

// #[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy, Debug)]
// pub struct SubData {
//     pub value: u64
//     pub count: u64
// }

