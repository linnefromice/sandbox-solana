#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};
pub mod instructions;
use instructions::state::{DepositState, RootState};

declare_id!("DqQyM9cNFC48XKtkGHvAV5VAWCPLqrM2ZDukGn8RedhX");

#[program]
pub mod program_spl_2 {
    use super::*;

    pub fn initialize(ctx: Context<InitializeToken>) -> Result<()> {
        execute_init(ctx)
    }

    pub fn deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
        execute_deposit_token(ctx, amount)
    }
}

pub fn execute_init(ctx: Context<InitializeToken>) -> Result<()> {
    ctx.accounts.root_state.authority = ctx.accounts.vault.key();
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    pub mint_account: Account<'info, Mint>,
    #[account(
        init,
        payer = signer,
        space = 8 + RootState::MAX_SIZE,
        seeds = [
            b"root",
            mint_account.key().as_ref(),
        ],
        bump
    )]
    pub root_state: Account<'info, RootState>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = mint_account,
        associated_token::authority = root_state,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn execute_deposit_token(ctx: Context<DepositToken>, amount: u64) -> Result<()> {
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_accounts = Transfer {
        from: ctx.accounts.signer_ata.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    transfer(cpi_ctx, amount)?;

    ctx.accounts.root_state.total_amount += amount;
    ctx.accounts.user_state.total_amount += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct DepositToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint_account: Account<'info, Mint>,
    #[account(
        mut,
        // associated_token::mint = mint_account,
        // associated_token::authority = signer
    )]
    pub signer_ata: Account<'info, TokenAccount>,
    #[account(
        init_if_needed, 
        payer = signer, 
        space = DepositState::MAX_SIZE, 
        seeds=[b"user", signer.key().as_ref(), mint_account.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, DepositState>,

    #[account(
        mut,
        seeds = [
            b"root",
            mint_account.key().as_ref(),
        ],
        bump
    )]
    pub root_state: Account<'info, RootState>,
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = root_state,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
