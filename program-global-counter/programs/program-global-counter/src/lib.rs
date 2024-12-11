use anchor_lang::prelude::*;

declare_id!("38iBYy8JAKBtjce1RAF2VpoRksUiFLghNDkmgDwJGMR6");

const GLOBAL_STATE_SEED: &[u8] = b"global";

#[program]
pub mod program_global_counter {
    use super::*;

    pub fn init_program(ctx: Context<InitializeProgram>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.total = 500; // 0; // initial value
        global_state.add_count = 0;
        global_state.sub_count = 0;
        Ok(())
    }

    pub fn initialize(ctx: Context<InitializeUser>) -> Result<()> {
        let executor = &mut ctx.accounts.executor;
        executor.total = 0;
        executor.add_count = 0;
        executor.sub_count = 0;
        Ok(())
    }

    pub fn add(ctx: Context<Calcurate>, data: CalcurateData) -> Result<()> {
        let Calcurate { executor, global, .. } = ctx.accounts;
        let CalcurateData { value, count } = data;
        executor.add_count += count;
        executor.total += value * count;
        global.add_count += count;
        global.total += value * count;
        Ok(())
    }

    pub fn sub(ctx: Context<Calcurate>, data: CalcurateData) -> Result<()> {
        let Calcurate { executor, global, .. } = ctx.accounts;
        let CalcurateData { value, count } = data;
        executor.add_count += count;
        executor.total -= value * count;
        global.add_count += count;
        global.total -= value * count;
        Ok(())
    }
}

#[account]
pub struct Stats {
    pub total: u64,
    pub add_count: u64,
    pub sub_count: u64,
}
impl Stats {
    // ref: https://book.anchor-lang.com/anchor_references/space.html
    pub const MAX_SIZE: usize = 8 + 8 + 8;
}

#[derive(Accounts)]
pub struct InitializeProgram<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + Stats::MAX_SIZE,
        seeds = [GLOBAL_STATE_SEED],
        bump
    )]
    pub global_state: Account<'info, Stats>, // アカウントを初期化
    #[account(mut)]
    pub signer: Signer<'info>, // ユーザーの署名者
    pub system_program: Program<'info, System>, // 必須のシステムプログラム
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + Stats::MAX_SIZE,
    )]
    pub executor: Account<'info, Stats>, // アカウントを初期化
    #[account(mut)]
    pub signer: Signer<'info>, // ユーザーの署名者
    pub system_program: Program<'info, System>, // 必須のシステムプログラム
}

#[derive(Accounts)]
pub struct Calcurate<'info> {
    #[account(mut)]
    pub executor: Account<'info, Stats>,
    #[account(mut, seeds = [GLOBAL_STATE_SEED], bump)]
    pub global: Account<'info, Stats>,
}

#[account]
pub struct CalcurateData {
    pub value: u64,
    pub count: u64
}