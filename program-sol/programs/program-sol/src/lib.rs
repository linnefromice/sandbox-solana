use anchor_lang::prelude::*;

declare_id!("3FbrHy2HRjGVCDgQbzpoRaHAZUqyGLL3UVrhuX9U75tX");

#[program]
pub mod program_sol {
    use super::*;

    pub fn init_program(ctx: Context<InitializeProgram>) -> Result<()> {
        let bank = &mut ctx.accounts.bank;
        bank.total_amount = 0;
        Ok(())
    }

    pub fn init_user(ctx: Context<InitializeUser>) -> Result<()> {
        let executor = &mut ctx.accounts.executor;
        executor.total_amount = 0;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[account]
pub struct Bank {
    pub total_amount: u64,
}
impl Bank {
    pub const MAX_SIZE: usize = 8;
}

#[account]
pub struct UserStats {
    pub total_amount: u64,
}
impl UserStats {
    pub const MAX_SIZE: usize = 8;
}

#[derive(Accounts)]
pub struct InitializeProgram<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + Bank::MAX_SIZE,
        seeds = [],
        bump
    )]
    pub bank: Account<'info, Bank>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + UserStats::MAX_SIZE,
    )]
    pub executor: Account<'info, UserStats>, // アカウントを初期化
    #[account(mut)]
    pub signer: Signer<'info>, // ユーザーの署名者
    pub system_program: Program<'info, System>, // 必須のシステムプログラム
}

#[derive(Accounts)]
pub struct Deposit {}

#[derive(Accounts)]
pub struct Withdraw {}
