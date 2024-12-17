use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

pub fn execute(_ctx: Context<Initialize>) -> Result<()> {
    Ok(())
}

#[account]
pub struct RootState {
    pub total_amount: u64,
}
impl RootState {
    pub const MAX_SIZE: usize = 8;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
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
