use anchor_lang::prelude::*;

declare_id!("3FbrHy2HRjGVCDgQbzpoRaHAZUqyGLL3UVrhuX9U75tX");

#[program]
pub mod program_sol {
    use anchor_lang::system_program::{transfer, Transfer};

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

    pub fn deposit(ctx: Context<DepositOrWithdraw>, amount: u64) -> Result<()> {
        let signer = &mut ctx.accounts.signer;
        let bank_account = &mut ctx.accounts.bank;
        let program_account = &mut ctx.accounts.system_program;

        let cpi_ctx = CpiContext::new(
            program_account.to_account_info(),
            Transfer {
                from: signer.to_account_info(),
                to: bank_account.to_account_info(),
            },
        );
        transfer(cpi_ctx, amount)?;
        // let inst = anchor_lang::solana_program::system_instruction::transfer(
        //     &signer.key(),
        //     &bank_account.key(),
        //     amount,
        // );
        // anchor_lang::solana_program::program::invoke(
        //     &inst,
        //     &[signer.to_account_info(), bank_account.to_account_info()],
        // )?;

        ctx.accounts.executor.total_amount += amount;
        bank_account.total_amount += amount;

        Ok(())
    }

    pub fn withdraw(ctx: Context<DepositOrWithdraw>, amount: u64) -> Result<()> {
        let signer = &mut ctx.accounts.signer;
        let bank_account = &mut ctx.accounts.bank;
        let program_account = &mut ctx.accounts.system_program;

        **bank_account.to_account_info().try_borrow_mut_lamports()? -= amount;
        **signer.to_account_info().try_borrow_mut_lamports()? += amount;

        // ref: https://github.com/solana-developers/program-examples/blob/main/tokens/token-swap/anchor/programs/token-swap/src/instructions/deposit_liquidity.rs#L103-L111
        // ref: https://solana.com/docs/programs/anchor/cpi
        let bank_bumps: &[u8] = &[ctx.bumps.bank];
        let bank_seeds = &[b"", bank_bumps];
        let bank_signer_seeds = &[&bank_seeds[..]];

        // NOTE: This is not working
        //   "Transfer: `from` must not carry data",
        //   "Program 11111111111111111111111111111111 failed: invalid program argument",
        // let cpi_ctx = CpiContext::new(
        //     program_account.to_account_info(),
        //     Transfer {
        //         from: bank_account.to_account_info(),
        //         to: signer.to_account_info(),
        //     },
        // )
        // .with_signer(bank_signer_seeds);
        // transfer(cpi_ctx, amount)?;

        // let inst = anchor_lang::solana_program::system_instruction::transfer(
        //     &bank_account.key(),
        //     &signer.key(),
        //     amount,
        // );
        // anchor_lang::solana_program::program::invoke_signed(
        //     &inst,
        //     &[
        //         bank_account.to_account_info(),
        //         user_account.to_account_info(),
        //     ],
        //     bank_signer_seeds,
        // )?;

        ctx.accounts.executor.total_amount -= amount;
        bank_account.total_amount -= amount;

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
pub struct DepositOrWithdraw<'info> {
    #[account(mut)]
    pub executor: Account<'info, UserStats>, // user's PDA
    #[account(mut, seeds = [], bump)]
    pub bank: Account<'info, Bank>, // program's PDA
    #[account(mut)]
    pub signer: Signer<'info>, // user's signer
    pub system_program: Program<'info, System>, // 必須のシステムプログラム
}
